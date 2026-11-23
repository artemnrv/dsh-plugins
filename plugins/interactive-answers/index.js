/**
 * Host half of the Interactive answers bundle.
 *
 * Two model-facing contributions:
 * - one system-prompt section teaching the `dsh-ui` block format the Web client renders;
 * - the `ui_answer_blocks` tool, which lists this session's image attachment references and
 *   validates a block object before the model writes it into an answer.
 *
 * The blocks themselves are ordinary fenced Markdown in the assistant message, so they persist
 * in the session log and re-render from history without any extra event type.
 */

/** Stable Loader identity. */
export const name = 'interactive-answers'

/** Services required to register the prompt section and the tool. */
export const inject = ['systemPrompt', 'tools']

/** Fence language the client half renders; kept in sync with client.js. */
const FENCE_LANG = 'dsh-ui'

/** Supported block types and field caps, mirrored by the client-side normalizer. */
const BLOCK_TYPES = new Set(['table', 'image', 'cards', 'choice'])
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
const ID_PATTERN = /^[A-Za-z0-9._:-]+$/

/** Plain-language contract shared by every turn of every agent in this profile. */
const SECTION = [
  'INTERACTIVE ANSWER BLOCKS',
  '',
  'You can build one answer from prose plus visual blocks. Emit each block as its own fenced code block with the language `' + FENCE_LANG + '` and exactly one JSON object as the body. The user sees the blocks inline in the order you write them. Use them only when they make the answer clearer; if prose is enough, use ordinary Markdown.',
  '',
  'Every block has:',
  '- "id": stable string, unique in the message (letters, digits, ".", "_", ":", "-").',
  '- "type": "table" | "image" | "cards" | "choice".',
  '- "fallback": the plain-text version of the block, shown if the block cannot render.',
  '- "title" (optional): a short heading.',
  '- "data": the type-specific payload below.',
  '',
  'table — a comparison with local sorting:',
  '{"id":"cmp-1","type":"table","title":"Three models","fallback":"A is cheapest, B balances, C is fastest.","data":{"columns":[{"key":"model","label":"Model"},{"key":"price","label":"Price, $/1M","align":"right"}],"rows":[{"model":"A","price":"0.27"}],"caption":"optional","footnote":"optional","sort":true}}',
  'columns: 1-8 objects {key, label, align? left|right|center}; rows: 1-40 objects keyed by column key with string or number values. "caption" sits under the table, "footnote" under the card. Sorting runs in the browser only.',
  '',
  'image — a captioned image:',
  '{"id":"shot-1","type":"image","title":"optional","fallback":"A screenshot of the settings page.","data":{"src":"/absolute/workspace/path.png","alt":"Settings page","caption":"optional"}}',
  'Use an absolute workspace path or an https URL in "src". For an image the user attached, first call ui_answer_blocks with action "attachments", then put one returned reference object verbatim in "data.attachment" instead of "src". Never invent an attachment reference.',
  '',
  'cards — a small set of static option cards:',
  '{"id":"opts-1","type":"cards","fallback":"A: cheap; B: balanced.","data":{"cards":[{"title":"Model A","subtitle":"cheap","badge":"$0.27","tone":"success","image":{"src":"/absolute/path.png","alt":"Model A"},"body":"optional","items":[{"label":"Context","value":"128k"}],"footer":"optional"}]}}',
  'cards: 1-6. Optional "tone" for the badge: neutral | success | warning | accent. Optional "image" with "src" or an attachment reference plus "alt" renders a media area above the title; the image is display-only.',
  '',
  'choice — a decision that continues the conversation:',
  '{"id":"price-1","type":"choice","fallback":"Choose what matters most: price, speed or context.","data":{"question":"What matters most?","hint":"optional","options":[{"id":"price","label":"Price matters more","description":"optional","submit":"Price matters more — re-rank the three models for cost."}]}}',
  'options: 1-6 objects {id, label, description?, submit?}. When the user clicks an option, the client sends its "submit" text (or its "label" when submit is absent) as the user\'s next message in this conversation. Write "submit" as a complete instruction that stands on its own: that message is the only context you receive with it.',
  '',
  'Rules:',
  '- One block per fence, placed between paragraphs in reading order. Never put several blocks in one JSON array.',
  '- The body must be valid JSON: double quotes, no comments, no trailing commas. The client validates it; invalid or unknown blocks show their text fallback.',
  '- Do not repeat a block\'s content as Markdown beside it; the fallback already covers rendering failure.',
  '- Use a table block when sorting helps and Markdown for a simple fixed table. Use at most one choice block per answer, and only when the next step really depends on the user\'s preference.',
  '- Only the types and fields above exist. An unknown type is rejected and the block shows its text fallback; unknown extra fields are ignored.',
].join('\n')

/** Parameter schema of the `ui_answer_blocks` tool. */
const PARAMETERS = {
  type: 'object',
  additionalProperties: false,
  required: ['action'],
  properties: {
    action: {
      type: 'string',
      enum: ['attachments', 'validate'],
      description: 'attachments: list image attachment references available in this session. validate: check one block object before writing it into an answer.',
    },
    block: {
      type: 'object',
      additionalProperties: true,
      description: 'The block object to validate (action=validate).',
    },
    limit: {
      type: 'integer',
      description: 'Maximum number of attachments to return, 1-10 (default 6).',
    },
  },
}

/** Output schema of the `ui_answer_blocks` tool. */
const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'action'],
  properties: {
    ok: { type: 'boolean' },
    action: { type: 'string' },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'ref'],
        properties: {
          name: { type: 'string' },
          ref: { type: 'object', additionalProperties: true },
          mediaType: { type: 'string' },
          bytes: { type: 'integer' },
          width: { type: 'integer' },
          height: { type: 'integer' },
        },
      },
    },
    errors: { type: 'array', items: { type: 'string' } },
  },
}

/** Whether a value is a plain JSON record. */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Trimmed string at a field cap, or an empty string for anything else. */
function readText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/** Whether an image source is an http(s) URL or a filesystem path the client may resolve. */
function isSafeSource(value) {
  if (value === '' || /[\u0000-\u001f\u007f]/u.test(value)) return false
  if (/^https?:\/\//iu.test(value)) return true
  return !/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(value)
}

/** Validate table payload, appending human-readable problems. */
function validateTable(data, errors) {
  const columns = data.columns
  if (!Array.isArray(columns) || columns.length < 1 || columns.length > 8) {
    errors.push('data.columns: an array of 1-8 columns is required')
    return
  }
  const keys = new Set()
  for (const column of columns) {
    if (!isRecord(column)) {
      errors.push('data.columns: every column must be an object')
      continue
    }
    const key = readText(column.key, 40)
    const label = readText(column.label, 80)
    if (key === '') errors.push('data.columns[].key: required')
    else if (!ID_PATTERN.test(key) || key.length > 40) errors.push('data.columns[].key: use letters, digits, ".", "_", ":", "-"')
    else if (keys.has(key)) errors.push(`data.columns: duplicate key "${key}"`)
    else keys.add(key)
    if (label === '') errors.push(`data.columns["${key || '?'}"].label: required`)
    if (column.align !== undefined && !['left', 'right', 'center'].includes(column.align)) {
      errors.push(`data.columns["${key || '?'}"].align: left, right or center`)
    }
  }
  if (!Array.isArray(data.rows) || data.rows.length < 1 || data.rows.length > 40) {
    errors.push('data.rows: an array of 1-40 rows is required')
    return
  }
  for (const [index, row] of data.rows.entries()) {
    if (!isRecord(row)) {
      errors.push(`data.rows[${index}]: every row must be an object`)
      continue
    }
    for (const key of Object.keys(row)) {
      if (!keys.has(key)) errors.push(`data.rows[${index}]: unknown column "${key}"`)
    }
  }
  if (data.caption !== undefined && typeof data.caption !== 'string') errors.push('data.caption: must be a string')
  if (data.footnote !== undefined && typeof data.footnote !== 'string') errors.push('data.footnote: must be a string')
  if (data.sort !== undefined && typeof data.sort !== 'boolean') errors.push('data.sort: must be a boolean')
}

/** Validate image payload, appending human-readable problems. */
function validateImage(data, errors) {
  if (data.attachment !== undefined) {
    if (!isRecord(data.attachment)) {
      errors.push('data.attachment: must be an attachment reference object')
    } else {
      const ref = data.attachment
      if (readText(ref.attachmentId, 200) === '') errors.push('data.attachment.attachmentId: required')
      if (!IMAGE_TYPES.has(ref.mediaType)) errors.push('data.attachment.mediaType: png, jpeg, webp or gif')
    }
  } else {
    const src = readText(data.src, 2000)
    if (src === '') errors.push('data.src: required unless data.attachment is set')
    else if (!isSafeSource(src)) errors.push('data.src: must be an http(s) URL or a file path')
  }
  if (readText(data.alt, 300) === '') errors.push('data.alt: required')
}

/** Validate cards payload, appending human-readable problems. */
function validateCards(data, errors) {
  if (!Array.isArray(data.cards) || data.cards.length < 1 || data.cards.length > 6) {
    errors.push('data.cards: an array of 1-6 cards is required')
    return
  }
  for (const [index, card] of data.cards.entries()) {
    if (!isRecord(card)) {
      errors.push(`data.cards[${index}]: must be an object`)
      continue
    }
    if (readText(card.title, 80) === '') errors.push(`data.cards[${index}].title: required`)
    if (card.tone !== undefined && !['neutral', 'success', 'warning', 'accent'].includes(card.tone)) {
      errors.push(`data.cards[${index}].tone: neutral, success, warning or accent`)
    }
    if (card.image !== undefined) {
      if (!isRecord(card.image)) errors.push(`data.cards[${index}].image: must be an object`)
      else {
        if (card.image.attachment !== undefined) {
          if (!isRecord(card.image.attachment)) errors.push(`data.cards[${index}].image.attachment: must be an attachment reference`)
          else {
            if (readText(card.image.attachment.attachmentId, 200) === '') errors.push(`data.cards[${index}].image.attachment.attachmentId: required`)
            if (!IMAGE_TYPES.has(card.image.attachment.mediaType)) errors.push(`data.cards[${index}].image.attachment.mediaType: png, jpeg, webp or gif`)
          }
        } else {
          const src = readText(card.image.src, 2000)
          if (src === '') errors.push(`data.cards[${index}].image.src: required unless image.attachment is set`)
          else if (!isSafeSource(src)) errors.push(`data.cards[${index}].image.src: must be an http(s) URL or a file path`)
        }
        if (readText(card.image.alt, 300) === '') errors.push(`data.cards[${index}].image.alt: required`)
      }
    }
    if (card.items !== undefined && !Array.isArray(card.items)) errors.push(`data.cards[${index}].items: must be an array`)
    else if (Array.isArray(card.items) && card.items.length > 6) errors.push(`data.cards[${index}].items: at most 6`)
  }
}

/** Validate choice payload, appending human-readable problems. */
function validateChoice(data, title, errors) {
  if (readText(data.question, 300) === '' && readText(title, 200) === '') {
    errors.push('data.question: required unless the block has a title')
  }
  if (data.hint !== undefined && typeof data.hint !== 'string') errors.push('data.hint: must be a string')
  const options = data.options
  if (!Array.isArray(options) || options.length < 1 || options.length > 6) {
    errors.push('data.options: an array of 1-6 options is required')
    return
  }
  const ids = new Set()
  for (const [index, option] of options.entries()) {
    if (!isRecord(option)) {
      errors.push(`data.options[${index}]: must be an object`)
      continue
    }
    const id = readText(option.id, 60)
    if (id === '') errors.push(`data.options[${index}].id: required`)
    else if (ids.has(id)) errors.push(`data.options: duplicate id "${id}"`)
    else ids.add(id)
    if (readText(option.label, 120) === '') errors.push(`data.options[${index}].label: required`)
    if (option.submit !== undefined && (typeof option.submit !== 'string' || option.submit.length > 500)) {
      errors.push(`data.options[${index}].submit: must be a string of at most 500 characters`)
    }
  }
}

/**
 * Validate one block object against the documented schema.
 * @param raw - model-supplied JSON value.
 * @returns okay flag and every problem found.
 */
function validateBlock(raw) {
  const errors = []
  if (!isRecord(raw)) return { ok: false, errors: ['block: must be a JSON object'] }
  const id = readText(raw.id, 128)
  if (id === '') errors.push('id: required string')
  else if (!ID_PATTERN.test(id)) errors.push('id: only letters, digits, ".", "_", ":", "-"')
  const type = readText(raw.type, 20)
  if (!BLOCK_TYPES.has(type)) errors.push('type: must be table, image, cards or choice')
  if (readText(raw.fallback, 4000) === '') errors.push('fallback: required plain-text version')
  if (raw.title !== undefined && readText(raw.title, 200) === '') errors.push('title: must be a non-empty string when present')
  if (!isRecord(raw.data)) {
    errors.push('data: required object')
    return { ok: false, errors }
  }
  if (type === 'table') validateTable(raw.data, errors)
  else if (type === 'image') validateImage(raw.data, errors)
  else if (type === 'cards') validateCards(raw.data, errors)
  else if (type === 'choice') validateChoice(raw.data, raw.title, errors)
  return { ok: errors.length === 0, errors }
}

/** Collect image attachment references from the session's model-visible surface, newest last. */
function collectAttachments(snapshot, limit) {
  const found = []
  const seen = new Set()
  for (const event of snapshot.events ?? []) {
    if (event?.type !== 'user/message') continue
    const message = event.data
    if (!isRecord(message) || message.role !== 'user') continue
    if (!isRecord(message.source) || message.source.kind !== 'user') continue
    if (!Array.isArray(message.content)) continue
    for (const block of message.content) {
      if (!isRecord(block) || block.type !== 'image' || !isRecord(block.attachment)) continue
      const ref = block.attachment
      if (typeof ref.attachmentId !== 'string' || seen.has(ref.attachmentId)) continue
      seen.add(ref.attachmentId)
      found.push({
        name: readText(ref.name, 120) || 'image',
        ref,
        mediaType: readText(ref.mediaType, 40) || 'image/png',
        bytes: Number.isInteger(ref.bytes) ? ref.bytes : 0,
        width: Number.isInteger(ref.width) ? ref.width : 0,
        height: Number.isInteger(ref.height) ? ref.height : 0,
      })
    }
  }
  return found.slice(-limit)
}

/**
 * Register the prompt section and the tool on the Host context.
 * @param ctx - context carrying `systemPrompt` and `tools`.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'ui:interactive-answers',
    order: 9100,
    text: SECTION,
  }), 'interactive-answers: prompt section')

  ctx.tools.register({
    name: 'ui_answer_blocks',
    description: 'Prepare interactive answer blocks for the chat UI. action=attachments returns image attachment references found in this session log (newest last) so an image block can reference one; action=validate checks a block object against the documented schema (the client validates again before rendering). Emit accepted blocks as `' + FENCE_LANG + '` fenced JSON in your reply.',
    parameters: PARAMETERS,
    output: {
      schema: OUTPUT_SCHEMA,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 1) }],
    },
    async execute(args, exec) {
      const action = isRecord(args) && typeof args.action === 'string' ? args.action : ''
      if (action === 'validate') {
        const result = validateBlock(isRecord(args) ? args.block : undefined)
        return { ok: result.ok, action, errors: result.errors }
      }
      if (action !== 'attachments') {
        return { ok: false, action: action || 'unknown', errors: ['action: use "attachments" or "validate"'] }
      }
      if (exec.agent === undefined) {
        return { ok: false, action, errors: ['attachments: no calling agent session'] }
      }
      const query = ctx.get('sessionQuery')
      if (query === undefined) {
        return { ok: false, action, errors: ['attachments: session history is unavailable in this composition'] }
      }
      // The complete log keeps attachments visible after compaction replaced the
      // earlier user message; the current surface would drop them.
      const read = typeof query.readSession === 'function'
        ? () => query.readSession(exec.agent.session.id)
        : typeof query.readSurface === 'function'
          ? () => query.readSurface(exec.agent.session.id)
          : null
      if (read === null) {
        return { ok: false, action, errors: ['attachments: session history is unavailable in this composition'] }
      }
      const requested = isRecord(args) && Number.isInteger(args.limit) ? args.limit : 6
      const limit = Math.min(Math.max(requested, 1), 10)
      exec.signal.throwIfAborted()
      const snapshot = await read()
      exec.signal.throwIfAborted()
      const attachments = collectAttachments(snapshot, limit)
      if (attachments.length === 0) {
        return { ok: true, action, attachments: [], errors: ['attachments: this session has no image attachments'] }
      }
      return { ok: true, action, attachments }
    },
  })
}
