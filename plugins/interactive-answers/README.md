# Interactive answers

Chat answers can combine ordinary Markdown with typed visual blocks. The agent writes one
fenced code block per visual block, and the Web client renders it inline, in the order the
agent wrote it. Ordinary prose stays ordinary Markdown.

```dsh-ui
{"id":"models-1","type":"table","title":"Three models","fallback":"A is cheapest; B balances price and speed; C is fastest with the largest context.","data":{"columns":[{"key":"model","label":"Model"},{"key":"price","label":"Price, $/1M tokens","align":"right"},{"key":"speed","label":"Speed, tokens/s","align":"right"},{"key":"context","label":"Context","align":"right"}],"rows":[{"model":"A","price":"0.27","speed":"60","context":"128k"},{"model":"B","price":"0.55","speed":"90","context":"256k"},{"model":"C","price":"1.10","speed":"140","context":"512k"}]}}
```

## Block format

One JSON object per fence, language `dsh-ui`. `README` plus the system prompt section the plugin
registers documents the same format to the agent.

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Stable identifier within the message (`A-Z a-z 0-9 . _ : -`). |
| `type` | yes | `table`, `image`, `cards` or `choice`. |
| `fallback` | yes | Plain-text version shown when the block cannot be rendered. |
| `title` | no | Heading above the block. |
| `data` | yes | Type-specific payload. |

### `table`

`data.columns` (1–8) with `key`, `label` and optional `align`; `data.rows` (1–40) keyed by
column key with string or number values; optional `data.caption` (under the table),
`data.footnote` (under the card) and `data.sort` (default `true`). Sorting is local: it changes
nothing for the agent.

### `image`

Either `data.src` (an absolute workspace path or an `https://` URL) or `data.attachment` — a
reference returned by the `ui_answer_blocks` tool, action `attachments`, which lists the image
attachments across the current session log (not only the messages still on the model surface). `data.alt` is required; `data.caption` is optional. Clicking
the image opens it locally in an overlay; nothing is sent to the agent.

### `cards`

`data.cards` (1–6) with `title`, optional `subtitle`, `badge`, `tone` (`neutral`, `success`,
`warning` or `accent`), `image` (a media area above the title: `src` or an attachment reference
plus `alt`), `body`, `items` (label/value pairs) and `footer`. Rendered as a responsive grid of
static cards. A card image that cannot load simply leaves the card without media.

### `choice`

`data.question`, optional `data.hint`, and `data.options` (1–6) with `id`, `label`, optional
`description` and `submit`. Clicking an option sends `submit` (or `label` when `submit` is
absent) to the agent as the next message in the current conversation and disables the block.
`submit` must therefore read as a self-contained instruction.

## Behaviour

- Prose streams as it is generated. A block appears as soon as its fence contains a complete,
  valid JSON object; while a fence is incomplete it shows as a plain code block.
- Invalid JSON, an unknown type or a failed schema check shows the block's `fallback` text
  (or the raw fence when no fallback can be read). A block that throws while rendering falls
  back to the plain code block.
- Choice confirmation is stored in local browser storage per session and per block content, so
  reopening the chat keeps the sent state. The confirmation is optimistic: if the submission
  settles back with the choice text still in the composer, the stored confirmation is withdrawn
  and the block reports that it could not send, so the user can retry. Blocks themselves live in
  the message text in the session log, so history, reload and fork restore them. The choice
  itself also stays in the chat as the user message it sent.
- Local actions: table sorting, image zoom. Dialog action: a choice option. Local actions are
  labelled `On screen` / «На экране», the dialog action is labelled `To chat` / «В чат».
- Visual scale follows the host content scale: block titles are one step above body text,
  surfaces use the host radius and layer tokens, secondary copy uses the host secondary size
  tokens, and cards can carry a media area and a toned status badge.
- Keyboard: sortable column headers are buttons with `aria-sort` and a polite order
  announcement; choice options are a radio group where the arrow keys move focus and Enter or
  Space sends; the image overlay traps Tab, closes on Escape and restores focus.
- Double activation is blocked: the synchronous guard, the disabled buttons and the composer's
  own submission claim each refuse a second send.
- A choice never overwrites unsent input. If the composer holds text or attachments, pressing an
  option explains that the field must be sent or cleared first and leaves the block unlocked.

## Requirements and limits

- Web client only; the Host half adds one system-prompt section and the `ui_answer_blocks` tool.
- The tool's `attachments` action needs the session history service; without it the action
  reports that history is unavailable.
- Image blocks address files through the same authenticated file route Markdown images use. The
  route does not require the file to be inside the session workspace; a path the file route
  cannot read still falls back to the block's text.
- Rendered blocks are not interactive for the agent: no block action reaches the Host except a
  choice, which arrives as an ordinary user message.
- The Host `ui_answer_blocks` validator is deliberately a little stricter than the client (for
  example it also rejects unknown table row keys); the client is the final authority before
  rendering and falls back to text on its own.

## Files

- `index.js` — Host half: system-prompt section and the `ui_answer_blocks` tool.
- `client.js` — Client half: the `dsh-ui` Markdown fence layer, styles and localized copy.
- `locale/*.json` — Plugin Manager display metadata.
