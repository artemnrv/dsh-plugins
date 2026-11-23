window.__ModuleLoader__.load({
  id: '@local/interactive-answers',
  factory(require) {
    const React = require('react')
    const ReactDOM = require('react-dom')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    /** Locale namespace for the layer's own copy. */
    const NS = 'interactive-answers'
    /** Fence language the Host half documents to the agent. */
    const LANG = 'dsh-ui'
    /** Local-storage prefix of the confirmed choice of one block occurrence. */
    const STORE_PREFIX = 'dsh.interactive-answers.choice.'
    /** Field caps shared with the Host-side validator. */
    const CAP = {
      id: 128, fallback: 4000, title: 200, columnKey: 40, columnLabel: 80,
      caption: 300, footnote: 200, cells: 500, rows: 40, columns: 8, alt: 300, imageCaption: 400,
      cards: 6, cardTitle: 80, cardSubtitle: 120, cardBadge: 40, cardBody: 800,
      cardFooter: 160, cardItems: 6, itemLabel: 60, itemValue: 120,
      question: 300, hint: 300, options: 6, optionId: 60, optionLabel: 120,
      optionDescription: 240, optionSubmit: 500,
    }
    /** Block types the client renders. */
    const TYPES = new Set(['table', 'image', 'cards', 'choice'])
    /** Badge tones of a card; neutral is the default. */
    const CARD_TONES = new Set(['neutral', 'success', 'warning', 'accent'])

    // ---------------------------------------------------------------- locale

    const en = {
      'badge.local': 'On screen',
      'badge.dialog': 'To chat',
      'block.fallbackLabel': 'Text fallback',
      'block.unreadable': 'This block could not be read. The original code is shown below.',
      'block.invalid': 'This block did not pass validation. Showing its text fallback.',
      'table.sortHint': 'Click a column header to sort — this only changes the table on your screen.',
      'table.sortColumn': 'Sort by {column}',
      'table.sortedAscending': 'Table sorted by {column}, ascending.',
      'table.sortedDescending': 'Table sorted by {column}, descending.',
      'table.scroll': 'Comparison table',
      'image.open': 'Open image',
      'image.close': 'Close',
      'image.loading': 'Loading image…',
      'image.failed': 'The image is unavailable.',
      'image.localHint': 'Opens in an overlay on this screen only — nothing is sent to the agent.',
      'choice.sent': 'Sent: {label}',
      'choice.failed': 'The choice could not be sent. Its text is left in the message field — press Send there, or clear the field and choose again.',
      'choice.busy': 'Wait for the current submission or command to finish.',
      'choice.draftBlocked': 'The message field already has text or attachments. Send or clear it, then choose again.',
      'choice.dialogHint': 'An option is sent to the agent as your next message in this chat. The message field must be empty.',
    }

    const ru = {
      'badge.local': 'На экране',
      'badge.dialog': 'В чат',
      'block.fallbackLabel': 'Текстовая версия',
      'block.unreadable': 'Блок не удалось прочитать. Ниже показан исходный код.',
      'block.invalid': 'Блок не прошёл проверку. Показана его текстовая версия.',
      'table.sortHint': 'Нажмите на заголовок столбца, чтобы отсортировать — меняется только таблица на экране.',
      'table.sortColumn': 'Сортировать по «{column}»',
      'table.sortedAscending': 'Таблица отсортирована по «{column}» по возрастанию.',
      'table.sortedDescending': 'Таблица отсортирована по «{column}» по убыванию.',
      'table.scroll': 'Таблица сравнения',
      'image.open': 'Открыть изображение',
      'image.close': 'Закрыть',
      'image.loading': 'Изображение загружается…',
      'image.failed': 'Изображение недоступно.',
      'image.localHint': 'Открывается поверх страницы и не отправляется агенту.',
      'choice.sent': 'Отправлено: {label}',
      'choice.failed': 'Не удалось отправить выбор. Его текст остался в поле ввода — отправьте его оттуда или очистите поле и выберите снова.',
      'choice.busy': 'Дождитесь завершения текущей отправки или команды.',
      'choice.draftBlocked': 'В поле ввода уже есть текст или вложения. Отправьте их или очистите поле, затем нажмите вариант снова.',
      'choice.dialogHint': 'Вариант отправится агенту следующим сообщением в этом чате. Поле ввода должно быть пустым.',
    }

    // Built-in locale ids; languages without their own copy fall back to English.
    const DICTIONARIES = { en, ru, zh: en, ja: en, es: en, fr: en, de: en, pt: en }

    // ------------------------------------------------------- value utilities

    function isRecord(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    }

    function readText(value, max) {
      return typeof value === 'string' ? value.trim().slice(0, max) : ''
    }

    /** One table cell as display text; only JSON scalars become text. */
    function cellText(value) {
      if (typeof value === 'string') return value.slice(0, CAP.cells)
      if (typeof value === 'number' && Number.isFinite(value)) return String(value)
      if (typeof value === 'boolean') return value ? 'true' : 'false'
      return ''
    }

    /** Whether an image source is an http(s) URL or a path the file route may resolve. */
    function isSafeSource(value) {
      if (value === '' || /[\u0000-\u001f\u007f]/u.test(value)) return false
      if (/^https?:\/\//iu.test(value)) return true
      return !/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(value)
    }

    function isAbsolutePath(value) {
      return /^\//u.test(value) || /^[A-Za-z]:[\\/]/u.test(value)
    }

    function resolveWorkspacePath(cwd, value) {
      if (isAbsolutePath(value)) return value
      const root = typeof cwd === 'string' ? cwd.replace(/[\\/]+$/u, '') : ''
      return root === '' ? value : root + '/' + value
    }

    /**
     * Build the authenticated file-route URL for an absolute path; http(s) sources pass through.
     * Mirrors the Markdown image resolver shipped by the Web client.
     */
    function mediaUrl(source) {
      const value = typeof source === 'string' ? source : ''
      if (/^https?:\/\//iu.test(value)) return value
      if (value === '' || !isAbsolutePath(value) || /^[/\\]{2}/u.test(value) || /[\u0000-\u001f\u007f]/u.test(value)) return undefined
      if (typeof document === 'undefined') return undefined
      try {
        return new URL('api/file?path=' + encodeURIComponent(value), document.baseURI).href
      } catch {
        return undefined
      }
    }

    /** Small stable hash so a confirmed choice stays bound to the block content. */
    function hashString(value) {
      let hash = 5381
      for (let index = 0; index < value.length; index += 1) {
        hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0
      }
      return (hash >>> 0).toString(36)
    }

    function choiceStorageKey(sessionId, block, code) {
      return STORE_PREFIX + String(sessionId) + '.' + block.id + '.' + hashString(code)
    }

    function readChoice(key) {
      try {
        if (typeof window === 'undefined' || window.localStorage === undefined) return null
        const raw = window.localStorage.getItem(key)
        if (raw === null) return null
        const value = JSON.parse(raw)
        if (!isRecord(value) || typeof value.optionId !== 'string' || typeof value.label !== 'string') return null
        return { optionId: value.optionId, label: value.label, text: typeof value.text === 'string' ? value.text : value.label, at: Number.isFinite(value.at) ? value.at : 0 }
      } catch {
        return null
      }
    }

    function writeChoice(key, value) {
      try {
        if (typeof window === 'undefined' || window.localStorage === undefined) return
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        // Storage can be unavailable or full; the sent message still reaches the session.
      }
    }

    /** Numeric reading of a cell, including k/M/B suffixes and currency prefixes. */
    function numericValue(text) {
      if (typeof text !== 'string') return undefined
      const match = /^[^\d+-]*([+-]?[\d\s.,]+)\s*([kKmMbB])?[^\d]*$/u.exec(text)
      if (!match) return undefined
      const digits = match[1].replace(/\s/gu, '').replace(/,(?=\d{3}\b)/gu, '').replace(',', '.')
      const number = Number(digits)
      if (!Number.isFinite(number)) return undefined
      const suffix = (match[2] || '').toLowerCase()
      if (suffix === 'k') return number * 1e3
      if (suffix === 'm') return number * 1e6
      if (suffix === 'b') return number * 1e9
      return number
    }

    function compareCells(left, right) {
      const a = numericValue(left)
      const b = numericValue(right)
      if (a !== undefined && b !== undefined && a !== b) return a - b
      return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' })
    }

    function sortRows(rows, key, direction) {
      const copy = rows.slice()
      copy.sort((left, right) => compareCells(left[key], right[key]) * direction)
      return copy
    }

    // ------------------------------------------------------------ validation

    /**
     * Parse one fence body into a JSON value.
     * @returns parsed value or a failure reason.
     */
    function parseBlock(code) {
      if (typeof code !== 'string') return { ok: false, reason: 'empty' }
      const body = code.trim()
      if (body === '') return { ok: false, reason: 'empty' }
      let value
      try {
        value = JSON.parse(body)
      } catch (error) {
        return { ok: false, reason: 'json', detail: error instanceof Error ? error.message : String(error) }
      }
      if (!isRecord(value)) return { ok: false, reason: 'shape' }
      return { ok: true, value }
    }

    /** Salvage the documented fallback string from a body that failed to parse. */
    function extractFallback(code) {
      const match = /"fallback"\s*:\s*"((?:[^"\\]|\\.)*)"/u.exec(typeof code === 'string' ? code : '')
      if (match === null) return ''
      try {
        const value = JSON.parse('"' + match[1] + '"')
        return typeof value === 'string' ? value.trim().slice(0, CAP.fallback) : ''
      } catch {
        return ''
      }
    }

    function normalizeTable(data, errors) {
      if (!Array.isArray(data.columns) || data.columns.length < 1 || data.columns.length > CAP.columns) {
        errors.push('columns')
        return null
      }
      const columns = []
      const keys = new Set()
      for (const raw of data.columns) {
        if (!isRecord(raw)) {
          errors.push('columns.item')
          continue
        }
        const key = readText(raw.key, CAP.columnKey)
        const label = readText(raw.label, CAP.columnLabel)
        if (key === '' || label === '' || keys.has(key)) {
          errors.push('columns.field')
          continue
        }
        keys.add(key)
        const align = raw.align === 'right' || raw.align === 'center' ? raw.align : 'left'
        columns.push({ key, label, align })
      }
      if (columns.length === 0 || columns.length !== data.columns.length) return null
      if (!Array.isArray(data.rows) || data.rows.length < 1 || data.rows.length > CAP.rows) {
        errors.push('rows')
        return null
      }
      const rows = []
      for (const raw of data.rows) {
        if (!isRecord(raw)) {
          errors.push('rows.item')
          return null
        }
        const row = {}
        for (const column of columns) row[column.key] = cellText(raw[column.key])
        rows.push(row)
      }
      return {
        columns,
        rows,
        caption: readText(data.caption, CAP.caption),
        footnote: readText(data.footnote, CAP.footnote),
        sort: data.sort !== false,
      }
    }

    /** Normalize one durable image attachment reference, or null for an invalid one. */
    function readAttachment(raw, errors, label) {
      if (!isRecord(raw)) {
        errors.push(label)
        return null
      }
      if (typeof raw.attachmentId !== 'string' || raw.attachmentId === ''
        || typeof raw.mediaType !== 'string' || raw.mediaType === '') {
        errors.push(label)
        return null
      }
      const attachment = {
        attachmentId: raw.attachmentId,
        mediaType: raw.mediaType,
        bytes: Number.isInteger(raw.bytes) ? raw.bytes : 0,
        width: Number.isInteger(raw.width) ? raw.width : 0,
        height: Number.isInteger(raw.height) ? raw.height : 0,
      }
      const name = readText(raw.name, 120)
      if (name !== '') attachment.name = name
      return attachment
    }

    /** Normalize an optional image payload of one card. */
    function normalizeCardImage(raw, errors) {
      if (raw === undefined) return null
      if (!isRecord(raw)) {
        errors.push('cards.image')
        return null
      }
      const attachment = raw.attachment === undefined ? null : readAttachment(raw.attachment, errors, 'cards.image.attachment')
      const src = readText(raw.src, 2000)
      if (attachment === null) {
        if (src === '') errors.push('cards.image.src')
        else if (!isSafeSource(src)) errors.push('cards.image.src.scheme')
      }
      const alt = readText(raw.alt, CAP.alt)
      if (alt === '') errors.push('cards.image.alt')
      return { attachment, src, alt }
    }

    function normalizeImage(data, errors) {
      const attachment = data.attachment === undefined ? null : readAttachment(data.attachment, errors, 'attachment')
      const src = readText(data.src, 2000)
      if (attachment === null) {
        if (src === '') errors.push('src.required')
        else if (!isSafeSource(src)) errors.push('src.scheme')
      }
      const alt = readText(data.alt, CAP.alt)
      if (alt === '') errors.push('alt')
      return {
        attachment,
        src,
        alt,
        caption: readText(data.caption, CAP.imageCaption),
      }
    }

    function normalizeCards(data, errors) {
      if (!Array.isArray(data.cards) || data.cards.length < 1 || data.cards.length > CAP.cards) {
        errors.push('cards')
        return null
      }
      const cards = []
      for (const raw of data.cards) {
        if (!isRecord(raw)) {
          errors.push('cards.item')
          return null
        }
        const title = readText(raw.title, CAP.cardTitle)
        if (title === '') {
          errors.push('cards.title')
          return null
        }
        const items = []
        if (raw.items !== undefined) {
          if (!Array.isArray(raw.items) || raw.items.length > CAP.cardItems) {
            errors.push('cards.items')
            return null
          }
          for (const item of raw.items) {
            if (!isRecord(item)) continue
            const label = readText(item.label, CAP.itemLabel)
            const value = readText(item.value, CAP.itemValue)
            if (label !== '' && value !== '') items.push({ label, value })
          }
        }
        const tone = CARD_TONES.has(raw.tone) ? raw.tone : 'neutral'
        if (raw.tone !== undefined && !CARD_TONES.has(raw.tone)) errors.push('cards.tone')
        cards.push({
          title,
          subtitle: readText(raw.subtitle, CAP.cardSubtitle),
          badge: readText(raw.badge, CAP.cardBadge),
          tone,
          image: normalizeCardImage(raw.image, errors),
          body: readText(raw.body, CAP.cardBody),
          items,
          footer: readText(raw.footer, CAP.cardFooter),
        })
      }
      return { cards }
    }

    function normalizeChoice(data, blockTitle, errors) {
      const question = readText(data.question, CAP.question)
      if (question === '' && blockTitle === '') errors.push('question')
      if (!Array.isArray(data.options) || data.options.length < 1 || data.options.length > CAP.options) {
        errors.push('options')
        return null
      }
      const options = []
      const ids = new Set()
      for (const raw of data.options) {
        if (!isRecord(raw)) {
          errors.push('options.item')
          return null
        }
        const id = readText(raw.id, CAP.optionId)
        const label = readText(raw.label, CAP.optionLabel)
        if (id === '' || label === '' || ids.has(id)) {
          errors.push('options.field')
          return null
        }
        ids.add(id)
        options.push({
          id,
          label,
          description: readText(raw.description, CAP.optionDescription),
          submit: readText(raw.submit, CAP.optionSubmit),
        })
      }
      return { question, hint: readText(data.hint, CAP.hint), options }
    }

    /**
     * Validate and normalize one parsed block. Unknown types fail; every failure keeps the
     * readable fallback so the layer can degrade to text.
     */
    function normalizeBlock(raw) {
      const errors = []
      if (!isRecord(raw)) return { ok: false, errors: ['shape'], block: null }
      const id = readText(raw.id, CAP.id)
      if (id === '') errors.push('id')
      else if (!/^[A-Za-z0-9._:-]+$/u.test(id)) errors.push('id.chars')
      const type = readText(raw.type, 20)
      if (!TYPES.has(type)) errors.push('type')
      const fallback = readText(raw.fallback, CAP.fallback)
      if (fallback === '') errors.push('fallback')
      const title = readText(raw.title, CAP.title)
      const block = { id, type, fallback, title, data: null }
      if (!isRecord(raw.data)) {
        errors.push('data')
        return { ok: false, errors, block }
      }
      let data = null
      if (type === 'table') data = normalizeTable(raw.data, errors)
      else if (type === 'image') data = normalizeImage(raw.data, errors)
      else if (type === 'cards') data = normalizeCards(raw.data, errors)
      else if (type === 'choice') data = normalizeChoice(raw.data, title, errors)
      if (data === null || errors.length > 0) return { ok: false, errors, block }
      block.data = data
      return { ok: true, errors, block }
    }

    // ------------------------------------------------------------- primitives

    /** Keeps one crashing fence local: after a crash the fence's plain code block is rendered. */
    class Boundary extends React.Component {
      constructor(props) {
        super(props)
        this.state = { failed: false }
      }

      static getDerivedStateFromError() {
        return { failed: true }
      }

      componentDidCatch(error) {
        console.warn('[interactive-answers] block render failed', error)
      }

      render() {
        return this.state.failed ? (this.props.fallback ?? null) : this.props.children
      }
    }

    function Badge({ badge }) {
      if (!badge) return null
      return h('span', { className: 'ia-badge', 'data-kind': badge.kind }, badge.label)
    }

    function BlockShell({ title, badge, children }) {
      return h('section', { className: 'ia-block' },
        (title !== '' || badge) ? h('div', { className: 'ia-block-head' },
          title !== '' ? h('h3', { className: 'ia-block-title' }, title) : h('span'),
          h(Badge, { badge })) : null,
        children)
    }

    /** Plain-text fallback of a block whose data failed validation. */
    function Fallback({ text, t, note }) {
      // The .ia-block wrapper supplies the block font scale and resets the host
      // Markdown paragraph margins; without it the two lines drift apart.
      return h('div', { className: 'ia-block' },
        h('div', { className: 'ia-fallback', role: 'note' },
          h('p', { className: 'ia-fallback-label' }, note || t('block.fallbackLabel')),
          h('p', { className: 'ia-fallback-text' }, text)))
    }

    /** Shown when even the fallback cannot be read: the original fence stays copyable. */
    function Unreadable({ children, t }) {
      return h('div', { className: 'ia-block ia-unreadable', role: 'note' },
        h('p', { className: 'ia-fallback-label' }, t('block.unreadable')),
        h('div', { className: 'ia-raw' }, children))
    }

    // ----------------------------------------------------------------- table

    function sortGlyph(sort, key) {
      if (sort.key !== key || sort.dir === 0) return '↕'
      return sort.dir === 1 ? '↑' : '↓'
    }

    function TableBlock({ block, t }) {
      const data = block.data
      const [sort, setSort] = useState({ key: '', dir: 0 })
      const rows = useMemo(() => (sort.key === '' || sort.dir === 0 ? data.rows : sortRows(data.rows, sort.key, sort.dir)), [data.rows, sort])

      const cycle = useCallback(key => {
        setSort(current => {
          if (current.key !== key) return { key, dir: 1 }
          if (current.dir === 1) return { key, dir: -1 }
          return { key: '', dir: 0 }
        })
      }, [])

      const head = data.columns.map(column => {
        const active = sort.key === column.key && sort.dir !== 0
        const ariaSort = active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'
        return h('th', {
          key: column.key,
          scope: 'col',
          'data-align': column.align,
          'aria-sort': data.sort ? ariaSort : undefined,
        }, data.sort
          ? h('button', {
            type: 'button',
            className: 'ia-th',
            onClick: () => cycle(column.key),
            title: t('table.sortColumn', { column: column.label }),
          },
          h('span', { className: 'ia-th-label' }, column.label),
          h('span', { className: 'ia-sort-glyph', 'aria-hidden': 'true' }, sortGlyph(sort, column.key)))
          : h('span', { className: 'ia-th-label' }, column.label))
      })

      const body = rows.map((row, index) => h('tr', { key: index },
        data.columns.map(column => {
          const value = row[column.key] ?? ''
          return h('td', {
            key: column.key,
            'data-align': column.align,
            className: numericValue(value) === undefined ? undefined : 'ia-num',
          }, value)
        })))

      const sortedColumn = sort.key === '' ? null : data.columns.find(column => column.key === sort.key)
      const announcement = sort.key === '' || sortedColumn === null
        ? ''
        : t(sort.dir === 1 ? 'table.sortedAscending' : 'table.sortedDescending', { column: sortedColumn.label })

      return h(BlockShell, {
        title: block.title,
        badge: data.sort ? { kind: 'local', label: t('badge.local') } : null,
      },
      h('div', { className: 'ia-table-wrap', role: 'group', 'aria-label': t('table.scroll') },
        h('table', { className: 'ia-table' },
          data.caption !== '' ? h('caption', { className: 'ia-table-caption' }, data.caption) : null,
          h('thead', null, h('tr', null, head)),
          h('tbody', null, body))),
      data.footnote !== '' ? h('p', { className: 'ia-table-footnote' }, data.footnote) : null,
      h('p', { className: 'ia-sr-only', 'aria-live': 'polite' }, announcement),
      data.sort ? h('p', { className: 'ia-hint' }, t('table.sortHint')) : null)
    }

    // ----------------------------------------------------------------- image

    function Lightbox({ url, alt, caption, t, onClose }) {
      const closeRef = useRef(null)
      const [broken, setBroken] = useState(false)
      useEffect(() => {
        const previous = typeof document !== 'undefined' ? document.activeElement : null
        const onKeyDown = event => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            onClose()
            return
          }
          // One focusable control: keep Tab inside the modal instead of letting
          // focus walk into the page behind the overlay.
          if (event.key === 'Tab') {
            event.preventDefault()
            if (closeRef.current !== null) closeRef.current.focus()
          }
        }
        document.addEventListener('keydown', onKeyDown, true)
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        if (closeRef.current !== null) closeRef.current.focus()
        return () => {
          document.removeEventListener('keydown', onKeyDown, true)
          document.body.style.overflow = previousOverflow
          if (previous !== null && typeof previous.focus === 'function') previous.focus()
        }
      }, [onClose])
      const label = alt !== '' ? alt : (caption !== '' ? caption : t('image.open'))
      return ReactDOM.createPortal(h('div', {
        className: 'ia-lightbox',
        onMouseDown: event => { if (event.target === event.currentTarget) onClose() },
      },
      h('div', {
        className: 'ia-lightbox-panel',
        role: 'dialog',
        'aria-modal': 'true',
        'aria-label': label,
      },
      h('button', {
        ref: closeRef,
        type: 'button',
        className: 'ia-lightbox-close',
        onClick: onClose,
        'aria-label': t('image.close'),
      }, '×'),
      broken
        ? h('p', { className: 'ia-lightbox-caption' }, t('image.failed'))
        : h('img', {
          className: 'ia-lightbox-img',
          src: url,
          alt,
          onError: () => setBroken(true),
        }),
      caption !== '' && !broken ? h('p', { className: 'ia-lightbox-caption' }, caption) : null)),
      document.body)
    }

    /** Resolve one durable attachment or workspace path into a displayable URL. */
    function useImageSource({ attachment, src, sessionId, useSessions, resolveAttachment }) {
      const cwd = useSessions(state => state.byId[sessionId]?.cwd)
      const [source, setSource] = useState({ status: 'loading', url: '' })
      useEffect(() => {
        let alive = true
        setSource({ status: 'loading', url: '' })
        if (attachment !== null) {
          Promise.resolve()
            .then(() => resolveAttachment(sessionId, attachment))
            .then(value => {
              if (!alive) return
              if (typeof value !== 'string' || value === '') setSource({ status: 'error', url: '' })
              else setSource({ status: 'ready', url: value })
            }, () => { if (alive) setSource({ status: 'error', url: '' }) })
        } else {
          const url = mediaUrl(resolveWorkspacePath(cwd, src))
          setSource(url === undefined ? { status: 'error', url: '' } : { status: 'ready', url })
        }
        return () => { alive = false }
      }, [attachment, src, cwd, sessionId, resolveAttachment])
      return source
    }

    function ImageFigure({ block, sessionId, useSessions, resolveAttachment, t }) {
      const data = block.data
      const { status, url } = useImageSource({
        attachment: data.attachment,
        src: data.src,
        sessionId,
        useSessions,
        resolveAttachment,
      })
      const [broken, setBroken] = useState(false)
      const [open, setOpen] = useState(false)
      const close = useCallback(() => setOpen(false), [])
      useEffect(() => { setBroken(false) }, [data])

      const view = broken ? 'error' : status
      const caption = data.caption
      const label = caption !== '' ? caption : data.alt
      if (view === 'error') {
        return h(BlockShell, { title: block.title },
          h(Fallback, { text: block.fallback, t, note: t('image.failed') }),
          caption !== '' ? h('p', { className: 'ia-figcaption' }, caption) : null)
      }
      return h(BlockShell, {
        title: block.title,
        badge: view === 'ready' ? { kind: 'local', label: t('badge.local') } : null,
      },
      h('figure', { className: 'ia-figure', 'aria-busy': view === 'loading' || undefined },
        h('button', {
          type: 'button',
          className: 'ia-image-btn',
          'aria-label': t('image.open') + (label !== '' ? ': ' + label : ''),
          disabled: view !== 'ready',
          onClick: () => setOpen(true),
        },
        view === 'ready'
          ? h('img', {
            className: 'ia-image',
            src: url,
            alt: data.alt,
            loading: 'lazy',
            decoding: 'async',
            onError: () => setBroken(true),
          })
          : h('span', { className: 'ia-image-placeholder', role: 'status' }, t('image.loading'))),
        caption !== '' ? h('figcaption', { className: 'ia-figcaption' }, caption) : null),
      view === 'ready' ? h('p', { className: 'ia-hint' }, t('image.localHint')) : null,
      open && view === 'ready' ? h(Lightbox, {
        url,
        alt: data.alt,
        caption,
        t,
        onClose: close,
      }) : null)
    }

    // ----------------------------------------------------------------- cards

    /** Card image area; a missing source simply leaves the card without media. */
    function CardMedia({ image, sessionId, useSessions, resolveAttachment }) {
      const { status, url } = useImageSource({
        attachment: image.attachment,
        src: image.src,
        sessionId,
        useSessions,
        resolveAttachment,
      })
      const [broken, setBroken] = useState(false)
      const view = broken ? 'error' : status
      if (view === 'error') return null
      return h('div', { className: 'ia-card-media', 'aria-busy': view === 'loading' || undefined },
        view === 'ready'
          ? h('img', {
            className: 'ia-card-image',
            src: url,
            alt: image.alt,
            loading: 'lazy',
            decoding: 'async',
            onError: () => setBroken(true),
          })
          : h('span', { className: 'ia-card-media-placeholder' }, image.alt))
    }

    function CardsBlock({ block, sessionId, useSessions, resolveAttachment }) {
      return h(BlockShell, { title: block.title },
        h('div', { className: 'ia-cards' }, block.data.cards.map((card, index) => h('article', { className: 'ia-card', key: index },
          card.image !== null
            ? h(CardMedia, { image: card.image, sessionId, useSessions, resolveAttachment })
            : null,
          h('div', { className: 'ia-card-head' },
            h('h4', { className: 'ia-card-title' }, card.title),
            card.badge !== '' ? h('span', { className: 'ia-badge', 'data-tone': card.tone }, card.badge) : null),
          card.subtitle !== '' ? h('p', { className: 'ia-card-subtitle' }, card.subtitle) : null,
          card.body !== '' ? h('p', { className: 'ia-card-body' }, card.body) : null,
          card.items.length > 0 ? h('dl', { className: 'ia-card-items' }, card.items.flatMap((item, itemIndex) => [
            h('dt', { key: 'label-' + itemIndex }, item.label),
            h('dd', { key: 'value-' + itemIndex }, item.value),
          ])) : null,
          card.footer !== '' ? h('p', { className: 'ia-card-footer' }, card.footer) : null))))
    }

    // ---------------------------------------------------------------- choice

    /** Remove one stored confirmation; storage may be unavailable or full. */
    function clearChoice(key) {
      try {
        if (typeof window === 'undefined' || window.localStorage === undefined) return
        window.localStorage.removeItem(key)
      } catch {
        // The in-memory state is reset by the caller regardless.
      }
    }

    function ChoiceBlock({ block, code, sessionId, inputActions, phase, draft, attachmentIds, t }) {
      const data = block.data
      const options = data.options
      const storageKey = choiceStorageKey(sessionId, block, code)
      const [handled, setHandled] = useState(() => readChoice(storageKey))
      const handledRef = useRef(handled)
      const busyRef = useRef(false)
      const [busy, setBusy] = useState(false)
      const [hint, setHint] = useState('')
      const [focusIndex, setFocusIndex] = useState(0)
      const optionRefs = useRef([])
      const phaseRef = useRef(phase)
      const draftRef = useRef(draft)
      const attachmentRef = useRef(attachmentIds)
      const pendingRef = useRef(null)
      phaseRef.current = phase
      draftRef.current = draft
      attachmentRef.current = attachmentIds

      // An accepted send clears the composer. If the submit surface settles back
      // to plain while our text is still there, the send did not leave: withdraw
      // the optimistic confirmation and allow a retry.
      useEffect(() => {
        const pending = pendingRef.current
        if (pending === null) return
        if (phase !== 'plain') {
          pending.started = true
          return
        }
        if (!pending.started) return
        if (typeof draft === 'string' && draft.trim() === pending.text.trim()) {
          clearChoice(storageKey)
          handledRef.current = null
          setHandled(null)
          setHint('failed')
        }
        pendingRef.current = null
      }, [phase, draft, storageKey])

      const choose = useCallback(option => {
        if (handledRef.current !== null || busyRef.current) return
        if (inputActions === undefined) {
          setHint('failed')
          return
        }
        const current = typeof draftRef.current === 'string' ? draftRef.current : ''
        const attached = Array.isArray(attachmentRef.current) ? attachmentRef.current.length : 0
        if (current.trim() !== '' || attached > 0) {
          setHint('draft')
          return
        }
        if (phaseRef.current !== 'plain') {
          setHint('busy')
          return
        }
        busyRef.current = true
        setBusy(true)
        setHint('')
        try {
          const text = option.submit !== '' ? option.submit : option.label
          inputActions.setDraft(text)
          inputActions.submit()
          const record = { optionId: option.id, label: option.label, text, at: Date.now() }
          writeChoice(storageKey, record)
          handledRef.current = record
          pendingRef.current = { text, started: false }
          setHandled(record)
        } catch (error) {
          console.warn('[interactive-answers] could not send the choice', error)
          setHint('failed')
          handledRef.current = null
          pendingRef.current = null
        } finally {
          busyRef.current = false
          setBusy(false)
        }
      }, [inputActions, storageKey])

      const moveFocus = useCallback(next => {
        const count = options.length
        const index = ((next % count) + count) % count
        setFocusIndex(index)
        const node = optionRefs.current[index]
        if (node !== undefined && node !== null && typeof node.focus === 'function') node.focus()
      }, [options.length])

      const locked = handled !== null || busy
      const status = hint === 'draft'
        ? { tone: 'warn', text: t('choice.draftBlocked') }
        : hint === 'busy'
          ? { tone: 'warn', text: t('choice.busy') }
          : hint === 'failed'
            ? { tone: 'error', text: t('choice.failed') }
            : handled !== null
              ? { tone: 'ok', text: t('choice.sent', { label: handled.label }) }
              : { tone: 'muted', text: t('choice.dialogHint') }

      return h(BlockShell, {
        title: block.title,
        badge: { kind: 'dialog', label: t('badge.dialog') },
      },
      h('div', { className: 'ia-choice', role: 'radiogroup', 'aria-label': data.question !== '' ? data.question : block.title, 'aria-busy': busy || undefined },
        data.question !== '' ? h('p', { className: 'ia-choice-question' }, data.question) : null,
        data.hint !== '' ? h('p', { className: 'ia-choice-hint' }, data.hint) : null,
        h('div', { className: 'ia-choice-options' }, options.map((option, index) => {
          const selected = handled !== null && handled.optionId === option.id
          return h('button', {
            key: option.id,
            ref: node => { optionRefs.current[index] = node },
            type: 'button',
            role: 'radio',
            'aria-checked': selected,
            'aria-disabled': locked || undefined,
            'data-selected': selected || undefined,
            className: 'ia-option',
            tabIndex: index === focusIndex ? 0 : -1,
            disabled: locked,
            onFocus: () => setFocusIndex(index),
            onClick: () => choose(option),
            onKeyDown: event => {
              if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); moveFocus(index + 1) }
              else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); moveFocus(index - 1) }
              else if (event.key === 'Home') { event.preventDefault(); moveFocus(0) }
              else if (event.key === 'End') { event.preventDefault(); moveFocus(options.length - 1) }
            },
          },
          h('span', { className: 'ia-option-mark', 'aria-hidden': 'true' }),
          h('span', { className: 'ia-option-main' },
            h('span', { className: 'ia-option-label' }, option.label),
            option.description !== '' ? h('span', { className: 'ia-option-desc' }, option.description) : null),
          h('span', { className: 'ia-option-send', 'aria-hidden': 'true' }, '↵'))
        })),
        h('p', { className: 'ia-status', 'data-tone': status.tone, 'aria-live': 'polite' }, status.text)))
    }

    // ------------------------------------------------------------------ layer

    function LayerBody(props) {
      const { code, streaming, children, t, sessionId, inputActions, useInput, useSessions, resolveAttachment } = props
      const parsed = useMemo(() => parseBlock(code), [code])
      const normalized = useMemo(() => (parsed.ok ? normalizeBlock(parsed.value) : null), [parsed])
      const phase = useInput(state => state.phase)
      const draft = useInput(state => state.draft)
      const attachmentIds = useInput(state => state.attachmentIds)

      if (!parsed.ok) {
        if (streaming) return children
        if (parsed.reason === 'json') console.warn('[interactive-answers] invalid block JSON', parsed.detail)
        const salvaged = extractFallback(code)
        return salvaged !== ''
          ? h(Fallback, { text: salvaged, t, note: t('block.invalid') })
          : h(Unreadable, { t }, children)
      }
      const fallback = readText(parsed.value.fallback, CAP.fallback)
      if (!normalized.ok) {
        if (!streaming) console.warn('[interactive-answers] invalid block', normalized.errors)
        if (streaming) return children
        return fallback !== ''
          ? h(Fallback, { text: fallback, t, note: t('block.invalid') })
          : h(Unreadable, { t }, children)
      }
      const block = normalized.block
      if (block.type === 'table') return h(TableBlock, { block, t })
      if (block.type === 'image') {
        return h(ImageFigure, { block, sessionId, useSessions, resolveAttachment, t })
      }
      if (block.type === 'cards') return h(CardsBlock, { block, sessionId, useSessions, resolveAttachment })
      return h(ChoiceBlock, { block, code, sessionId, inputActions, phase, draft, attachmentIds, t })
    }

    function makeLayer(ctx) {
      function resolveAttachment(sessionId, attachment) {
        return ctx.uiConversation.imageUrl(sessionId, attachment)
      }
      return function InteractiveAnswerLayer(props) {
        return h(Boundary, { fallback: props.children },
          h(LayerBody, { ...props, resolveAttachment }))
      }
    }

    // ----------------------------------------------------------------- styles

    const CSS = `
.ia-block{--ia-secondary-size:var(--dsh-content-font-size-secondary,13px);--ia-secondary-line:calc(18px + var(--dsh-content-font-delta-secondary,0px));--ia-title-size:calc(var(--dsh-content-font-size,14px) + 2px);display:flex;flex-direction:column;gap:10px;margin:0;font-size:var(--dsh-content-font-size,14px);line-height:calc(22px + var(--dsh-content-font-delta,0px));color:var(--dsw-alias-label-primary)}
.ia-block *{box-sizing:border-box}
.ia-block h3,.ia-block h4,.ia-block p,.ia-block dl,.ia-block dd,.ia-block dt,.ia-block figure,.ia-block table{margin:0}
.ia-block-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:28px}
.ia-block .ia-block-title{margin:0;font-family:inherit;font-size:var(--ia-title-size);font-weight:600;line-height:1.3;letter-spacing:-.01em}
.ia-block .ia-card-title{margin:0;font-family:inherit;font-size:var(--ia-title-size);font-weight:600;line-height:1.3;letter-spacing:-.01em}
.ia-badge{flex:none;white-space:nowrap;padding:5px 10px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:1;font-weight:500}
.ia-badge[data-tone="success"]{color:var(--dsw-alias-state-success-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 10%, transparent)}
.ia-badge[data-tone="warning"]{color:var(--dsw-alias-state-warn-label);border-color:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 10%, transparent)}
.ia-badge[data-tone="accent"],.ia-badge[data-kind="dialog"]{color:var(--dsw-alias-state-business-primary);border-color:color-mix(in srgb, var(--dsw-alias-state-business-primary) 42%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-business-primary) 8%, transparent)}
.ia-hint{color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-table-wrap{overflow-x:auto;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}
.ia-table{width:100%;border-collapse:collapse;font:var(--dsw-font-markdown-table);color:inherit}
.ia-table-caption{caption-side:bottom;text-align:left;padding:10px 16px;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-table th,.ia-table td{padding:11px 16px;text-align:left;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l1)}
.ia-table tbody tr:last-child td{border-bottom:0}
.ia-table tbody tr:hover{background:var(--dsw-alias-bg-layer-2)}
.ia-table thead th{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-markdown-table-head);font-weight:600}
.ia-table th[data-align="right"],.ia-table td[data-align="right"]{text-align:right}
.ia-table th[data-align="center"],.ia-table td[data-align="center"]{text-align:center}
.ia-table-footnote{padding:0 4px;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-num{font-variant-numeric:tabular-nums}
.ia-th{display:flex;align-items:center;gap:5px;width:100%;padding:0;border:0;background:0 0;color:inherit;font:inherit;text-align:inherit}
.ia-table th[data-align="right"] .ia-th{justify-content:flex-end}
.ia-table th[data-align="center"] .ia-th{justify-content:center}
button.ia-th{cursor:pointer}
button.ia-th:hover{color:var(--dsw-alias-label-primary)}
.ia-th:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px;border-radius:var(--dsw-radius-xs)}
.ia-th-label{min-width:0}
.ia-sort-glyph{flex:none;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1}
.ia-figure{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.ia-image-btn{display:block;max-width:100%;padding:0;border:0;border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);line-height:0;cursor:zoom-in;overflow:hidden}
.ia-image-btn:disabled{cursor:progress}
.ia-image-btn:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.ia-image{display:block;max-width:100%;max-height:460px;width:auto;height:auto;object-fit:contain;border-radius:inherit}
.ia-image-placeholder{display:flex;align-items:center;justify-content:center;width:280px;height:140px;padding:0 16px;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line);text-align:center}
.ia-figcaption{color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.ia-card{display:flex;flex-direction:column;gap:8px;min-width:0;padding:12px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}
.ia-card-media{position:relative;height:150px;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);overflow:hidden}
.ia-card-image{display:block;width:100%;height:100%;object-fit:cover}
.ia-card-media-placeholder{display:flex;align-items:center;justify-content:center;height:100%;padding:12px;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line);text-align:center}
.ia-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
.ia-card-subtitle{color:var(--dsw-alias-label-secondary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-card-body{white-space:pre-wrap;color:var(--dsw-alias-label-secondary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-card-items{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-card-items dt{color:var(--dsw-alias-label-tertiary)}
.ia-card-items dd{color:var(--dsw-alias-label-primary);text-align:right;font-variant-numeric:tabular-nums}
.ia-card-footer{padding-top:8px;border-top:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-choice{display:flex;flex-direction:column;gap:10px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1)}
.ia-choice-question{font-size:var(--ia-title-size);font-weight:600;line-height:1.3}
.ia-choice-hint{color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-choice-options{display:flex;flex-direction:column;gap:8px}
.ia-option{display:flex;align-items:flex-start;gap:12px;width:100%;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);color:inherit;font:inherit;text-align:left;cursor:pointer;transition:background-color .12s ease,border-color .12s ease}
.ia-option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}
.ia-option:active:not(:disabled){background:var(--dsw-alias-interactive-bg-active)}
.ia-option:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
.ia-option:disabled{cursor:default;opacity:.72}
.ia-option[data-selected="true"]{border-color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, transparent);opacity:1}
.ia-option-mark{flex:none;width:18px;height:18px;margin-top:2px;border:1.5px solid var(--dsw-alias-border-l2);border-radius:50%;transition:border-color .12s ease}
.ia-option[data-selected="true"] .ia-option-mark{border-color:var(--dsw-alias-state-success-primary);background:radial-gradient(circle,var(--dsw-alias-state-success-primary) 0 5px,transparent 5.5px)}
.ia-option-main{display:flex;flex:1;flex-direction:column;gap:3px;min-width:0}
.ia-option-label{font-weight:500}
.ia-option-desc{color:var(--dsw-alias-label-secondary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-option-send{flex:none;align-self:center;color:var(--dsw-alias-label-tertiary);font-size:var(--ia-secondary-size);line-height:1}
.ia-status{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-status[data-tone="ok"]{color:var(--dsw-alias-state-success-primary)}
.ia-status[data-tone="warn"]{color:var(--dsw-alias-state-warn-label)}
.ia-status[data-tone="error"]{color:var(--dsw-alias-state-error-primary)}
.ia-fallback{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border:1px dashed var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1)}
.ia-fallback-label{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
.ia-fallback-text{white-space:pre-wrap;color:var(--dsw-alias-label-secondary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line)}
.ia-raw{min-width:0}
.ia-sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.ia-lightbox{--ia-secondary-size:var(--dsh-content-font-size-secondary,13px);--ia-secondary-line:calc(18px + var(--dsh-content-font-delta-secondary,0px));position:fixed;inset:0;z-index:1400;display:flex;align-items:center;justify-content:center;padding:24px;background:color-mix(in srgb, var(--dsw-static-neutral-1000) 74%, transparent)}
.ia-lightbox-panel{position:relative;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:min(92vw,1100px);max-height:88vh}
.ia-lightbox-img{display:block;max-width:100%;max-height:calc(88vh - 48px);object-fit:contain;border-radius:var(--dsw-radius-lg)}
.ia-lightbox-caption{padding:5px 12px;border-radius:var(--dsw-radius-sm);background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:var(--ia-secondary-size);line-height:var(--ia-secondary-line);text-align:center}
.ia-lightbox-close{position:absolute;top:-14px;right:-14px;display:flex;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);font-size:18px;line-height:1;cursor:pointer;box-shadow:var(--dsw-elevation-soft)}
.ia-lightbox-close:focus-visible{outline:2px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}
@media (prefers-reduced-motion:reduce){.ia-block *{transition:none!important;animation:none!important}}
`

    // ------------------------------------------------------------------ setup

    function apply(ctx) {
      for (const stale of document.querySelectorAll('style[data-interactive-answers]')) stale.remove()
      const style = document.createElement('style')
      style.setAttribute('data-interactive-answers', '')
      style.textContent = CSS
      document.head.appendChild(style)
      ctx.effect(() => () => style.remove(), 'interactive-answers: styles')
      ctx.effect(() => ctx.locale.register(NS, DICTIONARIES), 'interactive-answers: locale')
      ctx.slots.inject('conversation.chat.markdown.fence', () => ctx.slots.register({
        name: 'conversation.chat.markdown.fence',
        id: '@local/interactive-answers/dsh-ui',
        key: LANG,
        locale: NS,
      }, makeLayer(ctx)))
    }

    const testHooks = typeof globalThis === 'object' && globalThis.__DSH_IA_TEST__ === true
      ? { parseBlock, normalizeBlock, extractFallback, sortRows, numericValue, choiceStorageKey, LANG }
      : null

    return testHooks === null
      ? { inject: ['slots', 'locale', 'uiConversation'], apply }
      : { inject: ['slots', 'locale', 'uiConversation'], apply, __test: testHooks }
  },
})
