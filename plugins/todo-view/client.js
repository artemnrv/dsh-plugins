/**
 * Browser half of the To do bundle.
 *
 * One sidebar entry (`sidebar.panellist`) and its main-area page (`main`, the
 * keyed slot the frame renders for a selected panel). The entry id and the main
 * panel key are the same value, which is how the sidebar addresses its page, and
 * the sidebar owns the button, its label, its selected state, and the
 * `ctx.layout.selectPanel` call; this module only supplies the glyph and the page.
 *
 * The page keeps named lists, each one an ordered array of tasks; a task's index
 * in that array is its priority, changed by dragging the grip at the row's left
 * edge or by pressing the arrow keys while the grip is focused. Lists can be
 * created and deleted; deleting a list deletes its tasks after an inline confirm.
 *
 * Everything is plain browser storage (`localStorage`) under one key derived from
 * the package name: it belongs to this installation, survives reloads and
 * restarts, and is not scoped to a Session. Nothing here reads session data or
 * writes session events; unloading the plugin removes the entry and the page and
 * leaves the stored lists for the next mount.
 *
 * Stored shapes: version 2 is `{ version: 2, lists: [{ id, name, tasks }] }`; a
 * version 1 page stored one flat `{ version: 1, tasks }` (or a bare array), which
 * reads as one list named after the locale's default list.
 *
 * Glyphs are the app's own icon-set geometry (checklist, check-circle, trash,
 * grip), inlined because a plugin cannot import the Client primitives package.
 */

window.__ModuleLoader__.load({
  id: '@dsh-local/view-2cc9dc95-2fad-493b-bcba-29b2666983c5',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** Dictionary namespace owned by this module. */
    const NS = 'local.todo'
    /** Identity shared by the sidebar entry and the main-slot occupant. */
    const PANEL_ID = 'local-todo'
    /** Local storage key; the package name keeps it out of every other plugin's namespace. */
    const STORAGE_KEY = '@dsh-local/view-2cc9dc95-2fad-493b-bcba-29b2666983c5.todo.v1'

    /**
     * Tasks recovered from this installation's storage after the ordering crash
     * that saved a list without its `tasks` array. They are restored only while
     * that exact list still has no task array; the first normal write ends it.
     */
    const RECOVERED_LIST_ID = 'list-mwrv4udz-hc3qhc'
    const RECOVERED_TASKS = [
      { id: 'task-mwrvhg4n-20bfqa', title: 'Помыть аерогриль', done: false, createdAt: 1795354113767 },
      { id: 'task-mwrvhpd1-85n6fh', title: 'Сходить в магазин', done: false, createdAt: 1795354125733 },
      { id: 'task-mwrvhvgh-le32b6', title: 'Приготовить роллы', done: false, createdAt: 1795354133633 },
      { id: 'task-mwrvi0uz-cq2fxf', title: 'Заняться учебой', done: false, createdAt: 1795354140635 },
      { id: 'task-mwrvi5nl-19hkyv', title: 'Тестовое в ЗЯ', done: false, createdAt: 1795354146849 },
    ]

    const en = {
      'panel': 'To do',
      'title': 'To do',
      'add.label': 'New task',
      'add.placeholder': 'Add a task',
      'add.action': 'Add',
      'empty': 'This list is empty. Add a task above.',
      'lists.default': 'Personal list',
      'lists.new': 'New list',
      'lists.name.label': 'List name',
      'lists.name.placeholder': 'List name',
      'lists.create': 'Create',
      'lists.cancel': 'Cancel',
      'lists.none': 'No lists yet. Create one — for example, “Personal list”.',
      'lists.delete': 'Delete list: {title}',
      'lists.delete.confirm': 'Delete “{title}” and all its tasks?',
      'lists.delete.count': 'Tasks: {count}',
      'lists.delete.yes': 'Delete',
      'storage.error': 'Changes are not saved: browser storage is unavailable.',
      'item.done': 'Mark as done: {title}',
      'item.undone': 'Mark as not done: {title}',
      'item.delete': 'Delete task: {title}',
      'item.drag': 'Reorder: {title}. Drag, or press ↑ and ↓.',
    }

    const ru = {
      'panel': 'To do',
      'title': 'To do',
      'add.label': 'Новая задача',
      'add.placeholder': 'Добавить задачу',
      'add.action': 'Добавить',
      'empty': 'Список пуст. Добавьте задачу выше.',
      'lists.default': 'Личный список',
      'lists.new': 'Новый список',
      'lists.name.label': 'Название списка',
      'lists.name.placeholder': 'Название списка',
      'lists.create': 'Создать',
      'lists.cancel': 'Отмена',
      'lists.none': 'Списков пока нет. Создайте первый — например, «Личный список».',
      'lists.delete': 'Удалить список: {title}',
      'lists.delete.confirm': 'Удалить список «{title}» и все его задачи?',
      'lists.delete.count': 'Задач: {count}',
      'lists.delete.yes': 'Удалить',
      'storage.error': 'Изменения не сохраняются: хранилище браузера недоступно.',
      'item.done': 'Отметить выполненной: {title}',
      'item.undone': 'Отметить невыполненной: {title}',
      'item.delete': 'Удалить задачу: {title}',
      'item.drag': 'Изменить порядок: {title}. Перетащите или нажмите ↑ и ↓.',
    }

    /** Icon-set geometry: `checklist-outline`, the glyph other panel entries use. */
    const CHECKLIST_PATHS = [
      'M3.75 6.25C4.7165 6.25 5.5 5.4665 5.5 4.5C5.5 3.5335 4.7165 2.75 3.75 2.75C2.7835 2.75 2 3.5335 2 4.5C2 5.4665 2.7835 6.25 3.75 6.25Z',
      'M7.5 4.5H13.5',
      'M3.75 13.25C4.7165 13.25 5.5 12.4665 5.5 11.5C5.5 10.5335 4.7165 9.75 3.75 9.75C2.7835 9.75 2 10.5335 2 11.5C2 12.4665 2.7835 13.25 3.75 13.25Z',
      'M7.5 11.5H13.5',
    ]

    /** Icon-set geometry: the ring half of `check-circle-outline`, used unchecked. */
    const CHECK_RING = 'M14.5996 8C14.5996 4.35492 11.6451 1.40039 8 1.40039C4.35492 1.40039 1.40039 4.35492 1.40039 8C1.40039 11.6451 4.35492 14.5996 8 14.5996C11.6451 14.5996 14.5996 11.6451 14.5996 8ZM15.9004 8C15.9004 12.363 12.363 15.9004 8 15.9004C3.63695 15.9004 0.0996094 12.363 0.0996094 8C0.0996094 3.63695 3.63695 0.0996094 8 0.0996094C12.363 0.0996094 15.9004 3.63695 15.9004 8Z'

    /** Icon-set geometry: the check half of `check-circle-outline`, used done. */
    const CHECK_TICK = 'M12.5303 6.53027L8.80273 10.2578C8.54967 10.5109 8.31796 10.7439 8.10645 10.9141C7.88375 11.0932 7.616 11.2602 7.27344 11.3145C7.09229 11.3431 6.90771 11.3431 6.72656 11.3145C6.384 11.2602 6.11625 11.0932 5.89355 10.9141C5.68204 10.7439 5.45033 10.5109 5.19727 10.2578L3.46973 8.53027L4.53027 7.46973L6.25781 9.19727C6.53457 9.47402 6.70036 9.63859 6.83398 9.74609C6.95637 9.84453 6.98241 9.83644 6.96094 9.83301C6.98679 9.83709 7.01321 9.83709 7.03906 9.83301C7.01759 9.83644 7.04363 9.84453 7.16602 9.74609C7.29964 9.63859 7.46543 9.47402 7.74219 9.19727L11.4697 5.46973L12.5303 6.53027Z'

    /** Icon-set geometry: `trash-outline`. */
    const TRASH_PATHS = [
      'M1.28149 3.88831H14.7187',
      'M5.41602 3.88833V2.47962C5.41602 2.29282 5.52492 2.11366 5.71876 1.98157C5.9126 1.84948 6.17551 1.77527 6.44964 1.77527H9.55053C9.82466 1.77527 10.0876 1.84948 10.2814 1.98157C10.4753 2.11366 10.5842 2.29282 10.5842 2.47962V3.88833',
      'M2.57349 3.88831L3.19366 13.2943C3.21937 13.5502 3.33952 13.7872 3.53065 13.9593C3.72178 14.1313 3.97016 14.2259 4.22729 14.2246H11.7728C12.0299 14.2259 12.2783 14.1313 12.4694 13.9593C12.6605 13.7872 12.7807 13.5502 12.8064 13.2943L13.4266 3.88831',
      'M6.44946 6.98926V11.1238',
      'M9.55054 6.98926V11.1238',
    ]

    /** Icon-set outline geometry for the grip: two columns of three dots. */
    const GRIP_DOTS = [
      [5.5, 3.6],
      [10.5, 3.6],
      [5.5, 8],
      [10.5, 8],
      [5.5, 12.4],
      [10.5, 12.4],
    ]

    /** Page styles. Rendered by the component, so unmounting removes them. */
    const CSS = `
.dsh-todo-page{display:flex;width:100%;height:100%;min-width:0;min-height:0;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.6}
.dsh-todo-scroll{flex:1;min-height:0;overflow:auto;scrollbar-gutter:stable;--dsh-scrollbar-width:9px;--dsh-scrollbar-thumb-border:2px;--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2)}
.dsh-todo-content{max-width:960px;margin:0 auto;padding:0 clamp(24px,4vw,48px) 48px}
.dsh-todo-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding-top:28px;margin-bottom:20px}
html[data-platform='darwin'] .dsh-todo-heading{padding-top:calc(28px + var(--dsh-frame-top-clearance,0px))}
.dsh-todo-heading h1{flex:0 1 auto;min-width:0;max-width:100%;margin:0;font-size:20px;line-height:28px;font-weight:500}
.dsh-todo-newlist{flex:none;display:inline-flex;align-items:center;height:32px;padding:0 14px;border:0.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:20px;white-space:nowrap;cursor:pointer;transition:background-color .15s}
@media (hover:hover){.dsh-todo-newlist:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-storage{margin:0 0 12px;font-size:13px;line-height:20px;color:var(--dsw-alias-state-error-primary)}
.dsh-todo-create{display:flex;align-items:center;gap:8px;margin:0 0 12px}
.dsh-todo-create .dsh-todo-input{flex:1;min-width:0}
.dsh-todo-form{display:flex;align-items:center;gap:8px;margin:2px 0 10px}
.dsh-todo-input{box-sizing:border-box;flex:1;min-width:0;height:36px;padding:0 12px;border:0.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;transition:border-color .15s,box-shadow .15s}
.dsh-todo-input::placeholder{color:var(--dsw-alias-label-caption)}
.dsh-todo-input:focus{border-color:var(--dsw-alias-state-business-primary);box-shadow:inset 0 0 0 .5px var(--dsw-alias-state-business-primary)}
.dsh-todo-add{flex:none;height:36px;padding:0 18px;border:0;border-radius:999px;background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:13px;line-height:20px;white-space:nowrap;cursor:pointer}
.dsh-todo-add:disabled{opacity:.4;cursor:default}
.dsh-todo-groups{display:flex;flex-direction:column}
.dsh-todo-group{padding:16px 0 6px;border-top:0.5px solid var(--dsw-alias-border-l2)}
.dsh-todo-group:first-child{border-top:0;padding-top:4px}
.dsh-todo-group-head{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.dsh-todo-group-name{margin:0;font-size:15px;line-height:22px;font-weight:500;overflow-wrap:anywhere}
.dsh-todo-group-delete{flex:none;margin-left:auto;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;transition:color .15s,background-color .15s}
@media (hover:hover){.dsh-todo-group-delete:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-confirm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:2px 0 10px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary)}
.dsh-todo-confirm-count{color:var(--dsw-alias-label-tertiary)}
.dsh-todo-danger{flex:none;height:30px;padding:0 12px;border:0;border-radius:var(--dsw-radius-md);background:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-label-primary-foreground);font:inherit;font-size:13px;cursor:pointer}
.dsh-todo-secondary{flex:none;height:30px;padding:0 12px;border:0;border-radius:var(--dsw-radius-md);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;cursor:pointer}
@media (hover:hover){.dsh-todo-secondary:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-list{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.dsh-todo-row{display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:var(--dsw-radius-md);transition:background-color .15s,box-shadow .1s}
@media (hover:hover){.dsh-todo-row:hover{background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-row[data-drop='before']{box-shadow:inset 0 2px 0 0 var(--dsw-alias-state-business-primary)}
.dsh-todo-row[data-drop='after']{box-shadow:inset 0 -2px 0 0 var(--dsw-alias-state-business-primary)}
@media (forced-colors:active){.dsh-todo-row[data-drop='before']{outline:2px solid CanvasText;outline-offset:-2px}.dsh-todo-row[data-drop='after']{outline:2px solid CanvasText;outline-offset:-2px}}
.dsh-todo-row[data-dragging='true']{opacity:.45}
.dsh-todo-grip{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:grab;transition:color .15s,background-color .15s}
.dsh-todo-grip:active{cursor:grabbing}
@media (hover:hover){.dsh-todo-grip:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-toggle{flex:none;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}
.dsh-todo-toggle[aria-checked='true']{color:var(--dsw-alias-state-business-primary)}
@media (hover:hover){.dsh-todo-toggle:hover{color:var(--dsw-alias-label-primary)}}
.dsh-todo-toggle[aria-checked='true']:hover{color:var(--dsw-alias-state-business-primary)}
.dsh-todo-text{flex:1;min-width:0;font-size:14px;line-height:22px;overflow-wrap:anywhere;white-space:pre-wrap}
.dsh-todo-row[data-done='true'] .dsh-todo-text{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}
.dsh-todo-delete{flex:none;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:0;border-radius:var(--dsw-radius-sm);background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;opacity:.45;transition:opacity .15s}
.dsh-todo-row:hover .dsh-todo-delete,.dsh-todo-row:focus-within .dsh-todo-delete,.dsh-todo-delete:focus-visible{opacity:1}
@media (hover:none){.dsh-todo-delete{opacity:1}}
@media (hover:hover){.dsh-todo-delete:hover{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover)}}
.dsh-todo-empty{margin:2px 0 8px;padding:4px 8px;color:var(--dsw-alias-label-tertiary);font-size:13px}
.dsh-todo-empty-page{padding:48px 20px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:14px}
.dsh-todo-empty-page p{margin:0 0 16px}
.dsh-todo-page :focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}
.dsh-todo-input:focus-visible{outline:none}
@media (prefers-reduced-motion:reduce){.dsh-todo-page *{transition:none!important}}
@media (pointer:coarse){.dsh-todo-input{font-size:16px}}
`

    /** @returns an id unique within this plugin's data. */
    function makeId(kind) {
      return kind + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
    }

    /**
     * Read one stored task.
     * @param item - one entry of a stored `tasks` array.
     * @returns the normalized task, or `null` when the entry is unusable.
     */
    function normalizeTask(item) {
      if (item === null || typeof item !== 'object') return null
      if (typeof item.id !== 'string' || item.id === '') return null
      if (typeof item.title !== 'string' || item.title.trim() === '') return null
      return {
        id: item.id,
        title: item.title.trim(),
        done: item.done === true,
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0,
      }
    }

    /**
     * Read the stored lists, migrating the one-list version 1 shape.
     * @param defaultName - name for the default list when storage is empty or migrated.
     * @returns the stored lists, possibly empty when the user deleted every list; a fresh installation gets one empty default list.
     */
    function readLists(defaultName) {
      let raw = null
      try {
        raw = window.localStorage.getItem(STORAGE_KEY)
      } catch (_storageUnavailable) {
        return [{ id: makeId('list'), name: defaultName, tasks: [] }]
      }
      if (raw === null) return [{ id: makeId('list'), name: defaultName, tasks: [] }]

      let saved
      try {
        saved = JSON.parse(raw)
      } catch (_invalidJson) {
        return [{ id: makeId('list'), name: defaultName, tasks: [] }]
      }

      if (saved !== null && typeof saved === 'object' && !Array.isArray(saved) && Array.isArray(saved.lists)) {
        const lists = []
        const seenIds = new Set()
        for (const item of saved.lists) {
          if (item === null || typeof item !== 'object') continue
          let id = typeof item.id === 'string' && item.id !== '' ? item.id : makeId('list')
          while (seenIds.has(id)) id = makeId('list')
          seenIds.add(id)
          const rawName = typeof item.name === 'string' ? item.name.trim() : ''
          const tasks = []
          const seenTaskIds = new Set()
          if (Array.isArray(item.tasks)) {
            for (const entry of item.tasks) {
              const task = normalizeTask(entry)
              if (task === null || seenTaskIds.has(task.id)) continue
              seenTaskIds.add(task.id)
              tasks.push(task)
            }
          } else if (id === RECOVERED_LIST_ID && item.tasks === undefined) {
            // The pre-fix reorder crash dropped this list's tasks array; put back the last tasks seen before it.
            for (const task of RECOVERED_TASKS) {
              if (seenTaskIds.has(task.id)) continue
              seenTaskIds.add(task.id)
              tasks.push({ ...task })
            }
          }
          lists.push({ id, name: rawName === '' ? defaultName : rawName, tasks })
        }
        return lists
      }

      const legacyTasks = Array.isArray(saved)
        ? saved
        : saved !== null && typeof saved === 'object' && Array.isArray(saved.tasks)
          ? saved.tasks
          : null
      if (legacyTasks === null) return [{ id: makeId('list'), name: defaultName, tasks: [] }]
      const tasks = []
      const seenTaskIds = new Set()
      for (const entry of legacyTasks) {
        const task = normalizeTask(entry)
        if (task === null || seenTaskIds.has(task.id)) continue
        seenTaskIds.add(task.id)
        tasks.push(task)
      }
      return [{ id: makeId('list'), name: defaultName, tasks }]
    }

    /**
     * Store the lists as the next page load must find them.
     * @param lists - the complete list collection after the change.
     * @returns whether the lists were written; `false` means the page holds changes storage cannot keep.
     */
    function writeLists(lists) {
      const stored = lists.map(list => ({
        id: list.id,
        name: list.name,
        tasks: tasksOf(list).map(task => ({
          id: task.id,
          title: task.title,
          done: task.done === true,
          createdAt: typeof task.createdAt === 'number' ? task.createdAt : 0,
        })),
      }))
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, lists: stored }))
        return true
      } catch (_storageUnavailable) {
        return false
      }
    }

    /**
     * Move one task to a new priority.
     * @param tasks - the list's tasks in their current priority order.
     * @param taskId - id of the task to move.
     * @param toIndex - insertion index in `tasks`, as a drop between rows computes it.
     * @returns a new array in the requested order, or `tasks` itself for a no-op.
     */
    function reorderTasks(tasks, taskId, toIndex) {
      const from = tasks.findIndex(task => task.id === taskId)
      if (from === -1) return tasks
      const target = Math.max(0, Math.min(tasks.length, toIndex))
      if (target === from || target === from + 1) return tasks
      const next = tasks.slice()
      const moved = next.splice(from, 1)[0]
      next.splice(target > from ? target - 1 : target, 0, moved)
      return next
    }

    /**
     * Read a list's tasks defensively.
     * @param list - a list from state or storage.
     * @returns its tasks array, or an empty one when the list carries no task array.
     */
    function tasksOf(list) {
      return Array.isArray(list.tasks) ? list.tasks : []
    }

    /**
     * Render the sidebar entry's glyph: the icon set's checklist mark at the size the row asks for.
     * @param props - the sidebar's icon share: the requested size and whether the page is selected.
     * @returns the decorative glyph.
     */
    function TodoPanelIcon({ size }) {
      return h(
        'svg',
        {
          width: size === undefined ? 16 : size,
          height: size === undefined ? 16 : size,
          viewBox: '0 0 16 16',
          fill: 'none',
          strokeWidth: 1,
          'aria-hidden': 'true',
          focusable: 'false',
        },
        CHECKLIST_PATHS.map(d => h('path', { key: d, d, stroke: 'currentColor' })),
      )
    }

    /**
     * Render the completion control's glyph, unchecked or checked.
     * @param size - square edge in px.
     * @param done - whether the task is done.
     * @returns the icon-set circle, with its tick when done.
     */
    function CheckGlyph({ size, done }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        h('path', { d: CHECK_RING, fill: 'currentColor' }),
        done ? h('path', { d: CHECK_TICK, fill: 'currentColor' }) : null,
      )
    }

    /**
     * Render the drag handle's grip glyph.
     * @param size - square edge in px.
     * @returns the icon-set dots.
     */
    function GripGlyph({ size }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          'aria-hidden': 'true',
          focusable: 'false',
        },
        GRIP_DOTS.map(([cx, cy], index) => h('circle', { key: index, cx, cy, r: 1.05, fill: 'currentColor' })),
      )
    }

    /**
     * Render the delete control's glyph.
     * @param size - square edge in px.
     * @returns the icon-set trash outline.
     */
    function TrashGlyph({ size }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 16 16',
          fill: 'none',
          strokeWidth: 1,
          'aria-hidden': 'true',
          focusable: 'false',
        },
        TRASH_PATHS.map(d => h('path', { key: d, d, stroke: 'currentColor' })),
      )
    }

    /**
     * Render one named list: its header and delete confirm, its add form, and its ordered tasks.
     * @param props - the list, the locale seat, and the page's change callbacks.
     * @returns the list section.
     */
    function ListSection({ list, t, autoFocus, onAutoFocused, onAddTask, onToggleTask, onDeleteTask, onReorderTasks, onDeleteList }) {
      const [draft, setDraft] = React.useState('')
      const [confirmingDeletion, setConfirmingDeletion] = React.useState(false)
      const [dragId, setDragId] = React.useState(null)
      const [dropAt, setDropAt] = React.useState(null)
      const trimmed = draft.trim()
      const tasks = tasksOf(list)
      const inputRef = React.useRef(null)
      const deleteButtonRef = React.useRef(null)
      const cancelButtonRef = React.useRef(null)
      const gripRefs = React.useRef(new Map())
      const pendingFocusTask = React.useRef(null)
      const wasConfirming = React.useRef(false)

      // A new list, or the list after a deleted one, takes the cursor so the page does not fall back to its top.
      React.useEffect(() => {
        if (!autoFocus) return
        const input = inputRef.current
        if (input !== null) {
          input.focus({ preventScroll: true })
          if (typeof input.scrollIntoView === 'function') input.scrollIntoView({ block: 'nearest' })
        }
        onAutoFocused()
      }, [autoFocus, onAutoFocused])

      // Opening the confirm parks focus on its safe action; cancelling returns it to the trash control.
      React.useEffect(() => {
        if (confirmingDeletion) {
          if (cancelButtonRef.current !== null) cancelButtonRef.current.focus()
        } else if (wasConfirming.current && deleteButtonRef.current !== null) {
          deleteButtonRef.current.focus()
        }
        wasConfirming.current = confirmingDeletion
      }, [confirmingDeletion])

      // After a task is deleted, keep keyboard focus in the list instead of dropping it on the page body.
      React.useEffect(() => {
        const target = pendingFocusTask.current
        if (target === null) return
        pendingFocusTask.current = null
        if (target === 'input') {
          if (inputRef.current !== null) inputRef.current.focus()
          return
        }
        const grip = gripRefs.current.get(target)
        if (grip !== undefined) grip.focus()
      }, [tasks])

      const addTask = event => {
        event.preventDefault()
        if (trimmed === '') return
        onAddTask(list.id, trimmed)
        setDraft('')
      }

      /** Delete this row, then move focus to the next task's grip (or the add field when none is left). */
      const removeTask = index => {
        const task = tasks[index]
        const next = tasks[index + 1] !== undefined ? tasks[index + 1] : tasks[index - 1]
        pendingFocusTask.current = next === undefined ? 'input' : next.id
        onDeleteTask(list.id, task.id)
      }

      /** Start dragging this row's task; the whole row is the drag image, not just the grip. */
      const handleDragStart = taskId => event => {
        event.stopPropagation()
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', taskId)
        const row = event.currentTarget.closest('li')
        if (row !== null) {
          try {
            event.dataTransfer.setDragImage(row, 24, 20)
          } catch (_dragImageUnsupported) {
            // The default drag image is good enough where setDragImage is unavailable.
          }
        }
        setDragId(taskId)
        setDropAt(null)
      }

      /** Track the insertion point: above or below the row under the pointer. */
      const handleDragOver = index => event => {
        if (dragId === null) return
        event.preventDefault()
        event.stopPropagation()
        event.dataTransfer.dropEffect = 'move'
        const rect = event.currentTarget.getBoundingClientRect()
        const next = index + (event.clientY > rect.top + rect.height / 2 ? 1 : 0)
        setDropAt(current => (current === next ? current : next))
      }

      const finishDrag = () => {
        setDragId(null)
        setDropAt(null)
      }

      const handleDrop = event => {
        if (dragId === null || dropAt === null) return
        event.preventDefault()
        event.stopPropagation()
        const taskId = dragId
        const toIndex = dropAt
        finishDrag()
        onReorderTasks(list.id, taskId, toIndex)
      }

      /** Arrow keys on a focused grip move that task one place up or down. */
      const handleGripKeyDown = (index, taskId) => event => {
        if (event.key === 'ArrowUp' && index > 0) {
          event.preventDefault()
          onReorderTasks(list.id, taskId, index - 1)
        } else if (event.key === 'ArrowDown' && index < tasks.length - 1) {
          event.preventDefault()
          onReorderTasks(list.id, taskId, index + 2)
        }
      }

      return h(
        'section',
        {
          className: 'dsh-todo-group',
          role: 'group',
          'aria-label': list.name,
          'data-testid': 'local-todo-list',
        },
        h(
          'div',
          { className: 'dsh-todo-group-head' },
          h('h2', { className: 'dsh-todo-group-name' }, list.name),
          confirmingDeletion
            ? null
            : h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-todo-group-delete',
                  ref: deleteButtonRef,
                  'aria-label': t('lists.delete', { title: list.name }),
                  title: t('lists.delete', { title: list.name }),
                  onClick: () => setConfirmingDeletion(true),
                },
                h(TrashGlyph, { size: 15 }),
              ),
        ),
        confirmingDeletion
          ? h(
              'div',
              {
                className: 'dsh-todo-confirm',
                onKeyDown: event => {
                  if (event.key === 'Escape') {
                    event.preventDefault()
                    setConfirmingDeletion(false)
                  }
                },
              },
              h('span', { role: 'alert' }, t('lists.delete.confirm', { title: list.name })),
              h('span', { className: 'dsh-todo-confirm-count' }, t('lists.delete.count', { count: tasks.length })),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-todo-danger',
                  onClick: () => onDeleteList(list.id),
                },
                t('lists.delete.yes'),
              ),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-todo-secondary',
                  ref: cancelButtonRef,
                  onClick: () => setConfirmingDeletion(false),
                },
                t('lists.cancel'),
              ),
            )
          : h(
              'form',
              { className: 'dsh-todo-form', onSubmit: addTask },
              h('input', {
                className: 'dsh-todo-input',
                type: 'text',
                ref: inputRef,
                value: draft,
                placeholder: t('add.placeholder'),
                'aria-label': t('add.label') + ': ' + list.name,
                maxLength: 500,
                autoComplete: 'off',
                spellCheck: false,
                onChange: event => setDraft(event.target.value),
              }),
              h('button', { className: 'dsh-todo-add', type: 'submit', disabled: trimmed === '' }, t('add.action')),
            ),
        tasks.length === 0 && !confirmingDeletion
          ? h('p', { className: 'dsh-todo-empty' }, t('empty'))
          : h(
              'ul',
              { className: 'dsh-todo-list' },
              tasks.map((task, index) => {
                const drop =
                  dropAt === index
                    ? 'before'
                    : dropAt === tasks.length && index === tasks.length - 1
                      ? 'after'
                      : undefined
                return h(
                  'li',
                  {
                    key: task.id,
                    className: 'dsh-todo-row',
                    'data-done': task.done ? 'true' : undefined,
                    'data-dragging': dragId === task.id ? 'true' : undefined,
                    'data-drop': drop,
                    onDragOver: handleDragOver(index),
                    onDrop: handleDrop,
                  },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-todo-grip',
                      draggable: true,
                      ref: node => {
                        if (node === null) gripRefs.current.delete(task.id)
                        else gripRefs.current.set(task.id, node)
                      },
                      'aria-label': t('item.drag', { title: task.title }),
                      'aria-keyshortcuts': 'ArrowUp ArrowDown',
                      title: t('item.drag', { title: task.title }),
                      onDragStart: handleDragStart(task.id),
                      onDragEnd: finishDrag,
                      onKeyDown: handleGripKeyDown(index, task.id),
                      onClick: event => event.currentTarget.focus(),
                    },
                    h(GripGlyph, { size: 16 }),
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-todo-toggle',
                      role: 'checkbox',
                      'aria-checked': task.done,
                      'aria-label': task.title,
                      title: t(task.done ? 'item.undone' : 'item.done', { title: task.title }),
                      onClick: () => onToggleTask(list.id, task.id),
                    },
                    h(CheckGlyph, { size: 16, done: task.done }),
                  ),
                  h('span', { className: 'dsh-todo-text' }, task.title),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-todo-delete',
                      'aria-label': t('item.delete', { title: task.title }),
                      title: t('item.delete', { title: task.title }),
                      onClick: () => removeTask(index),
                    },
                    h(TrashGlyph, { size: 16 }),
                  ),
                )
              }),
            ),
      )
    }

    /**
     * Render the page: the heading, the new-list control, and every named list.
     * @param props - the framework's locale seat for this registration.
     * @returns the page element.
     */
    function TodoPage(props) {
      const t = props.t
      const [lists, setLists] = React.useState(() => readLists(t('lists.default')))
      const [creating, setCreating] = React.useState(false)
      const [listName, setListName] = React.useState('')
      const [storageError, setStorageError] = React.useState(false)
      const [focusListId, setFocusListId] = React.useState(null)
      const newListButtonRef = React.useRef(null)
      const createdName = listName.trim()

      // Persist the first read once: this commits a migrated shape and makes a recovered list permanent.
      React.useEffect(() => {
        setStorageError(!writeLists(lists))
      }, [])

      /** Apply one change to the lists and persist it. */
      const commit = next => {
        setLists(next)
        setStorageError(!writeLists(next))
      }

      const closeCreate = () => {
        setCreating(false)
        setListName('')
      }

      const toggleCreate = () => {
        if (creating) closeCreate()
        else setCreating(true)
      }

      const createList = event => {
        event.preventDefault()
        if (createdName === '') return
        const id = makeId('list')
        commit([...lists, { id, name: createdName, tasks: [] }])
        setFocusListId(id)
        closeCreate()
      }

      const addTask = (listId, title) => {
        commit(
          lists.map(list =>
            list.id === listId
              ? { ...list, tasks: [...tasksOf(list), { id: makeId('task'), title, done: false, createdAt: Date.now() }] }
              : list,
          ),
        )
      }

      const toggleTask = (listId, taskId) => {
        commit(
          lists.map(list =>
            list.id === listId
              ? {
                  ...list,
                  tasks: tasksOf(list).map(task => (task.id === taskId ? { ...task, done: !task.done } : task)),
                }
              : list,
          ),
        )
      }

      const deleteTask = (listId, taskId) => {
        commit(
          lists.map(list =>
            list.id === listId ? { ...list, tasks: tasksOf(list).filter(task => task.id !== taskId) } : list,
          ),
        )
      }

      const moveTask = (listId, taskId, toIndex) => {
        commit(
          lists.map(list =>
            list.id === listId ? { ...list, tasks: reorderTasks(tasksOf(list), taskId, toIndex) } : list,
          ),
        )
      }

      const deleteList = listId => {
        const index = lists.findIndex(list => list.id === listId)
        const remaining = lists.filter(list => list.id !== listId)
        commit(remaining)
        if (remaining.length === 0) {
          setFocusListId(null)
          if (newListButtonRef.current !== null) newListButtonRef.current.focus()
          return
        }
        const next = remaining[Math.min(Math.max(index, 0), remaining.length - 1)]
        setFocusListId(next.id)
      }

      return h(
        'section',
        { className: 'dsh-todo-page', 'aria-label': t('title'), 'data-testid': 'local-todo-page' },
        h('style', { dangerouslySetInnerHTML: { __html: CSS } }),
        h(
          'div',
          { className: 'dsh-todo-scroll' },
          h(
            'div',
            { className: 'dsh-todo-content' },
            h(
              'div',
              { className: 'dsh-todo-heading' },
              h('h1', null, t('title')),
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-todo-newlist',
                  ref: newListButtonRef,
                  'aria-expanded': creating,
                  onClick: toggleCreate,
                },
                t('lists.new'),
              ),
            ),
            storageError ? h('p', { className: 'dsh-todo-storage', role: 'status' }, t('storage.error')) : null,
            creating
              ? h(
                  'form',
                  { className: 'dsh-todo-create', onSubmit: createList },
                  h('input', {
                    className: 'dsh-todo-input',
                    type: 'text',
                    value: listName,
                    placeholder: t('lists.name.placeholder'),
                    'aria-label': t('lists.name.label'),
                    maxLength: 120,
                    autoFocus: true,
                    autoComplete: 'off',
                    spellCheck: false,
                    onChange: event => setListName(event.target.value),
                    onKeyDown: event => {
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        closeCreate()
                      }
                    },
                  }),
                  h('button', { className: 'dsh-todo-add', type: 'submit', disabled: createdName === '' }, t('lists.create')),
                  h('button', { className: 'dsh-todo-secondary', type: 'button', onClick: closeCreate }, t('lists.cancel')),
                )
              : null,
            lists.length === 0
              ? h(
                  'div',
                  { className: 'dsh-todo-empty-page' },
                  h('p', { role: 'status' }, t('lists.none')),
                  h(
                    'button',
                    { type: 'button', className: 'dsh-todo-newlist', onClick: () => setCreating(true) },
                    t('lists.new'),
                  ),
                )
              : h(
                  'div',
                  { className: 'dsh-todo-groups' },
                  lists.map(list =>
                    h(ListSection, {
                      key: list.id,
                      list,
                      t,
                      autoFocus: focusListId === list.id,
                      onAutoFocused: () => setFocusListId(null),
                      onAddTask: addTask,
                      onToggleTask: toggleTask,
                      onDeleteTask: deleteTask,
                      onReorderTasks: moveTask,
                      onDeleteList: deleteList,
                    }),
                  ),
                ),
          ),
        ),
      )
    }

    /**
     * Register the page, its sidebar entry, and the teardown that returns the frame to the Conversation.
     * @param ctx - browser services used by these contributions.
     */
    function apply(ctx) {
      ctx.effect(() => ctx.locale.register(NS, { en, ru }), 'local-todo: dictionaries')
      const t = ctx.locale.bind(NS)
      ctx.slots.inject('main', () =>
        ctx.slots.register({ name: 'main', key: PANEL_ID, locale: NS }, TodoPage),
      )
      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            locale: NS,
            label: () => t('panel'),
          },
          TodoPanelIcon,
        ),
      )
      // Leave the panel on unload only when this plugin's page is the selected one.
      ctx.effect(
        () => () => {
          try {
            if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) ctx.layout.selectPanel(null)
          } catch (_unavailable) {
            // The layout owner is already gone; there is no selection left to clear.
          }
        },
        'local-todo: leave panel on unload',
      )
    }

    return {
      inject: ['slots', 'locale', 'layout'],
      apply,
      // Exposed only so a Node check can exercise the storage and ordering logic
      // without a browser; the module loader ignores unknown plugin fields.
      testHooks: { storageKey: STORAGE_KEY, readLists, writeLists, reorderTasks },
    }
  },
})
