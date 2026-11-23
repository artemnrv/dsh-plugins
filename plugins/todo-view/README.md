# To do

A personal to-do page in the Web GUI. A **To do** entry appears in the left sidebar; selecting it replaces the conversation area with the page until you pick a session again.

## What it does

- The page keeps named lists of tasks. A fresh installation starts with one empty **Personal list**; **New list** in the page header adds another, for example Work or Home.
- Each list has its own field for adding a task. Press **Add** (or Enter) to append the task to the bottom of that list.
- The circle on a row marks that task done; pressing it again marks it not done. A done task keeps its place with struck-through text.
- A row's trash control deletes one task. The trash control in a list's header deletes the whole list, after an inline confirmation that names the list.
- A task's position in its list is its priority. Drag the grip at the left of a row to move the task, or focus the grip and press ↑/↓ to move it one place. The drop line shows where the task will land.
- All lists are kept in this installation's local browser storage, so they are the same in every session and survive a reload or an app restart. They are not synced to other computers.
- Lists and tasks are personal UI data: they are not written to session logs, are not sent to the model, and are not visible to tools.

## Upgrade from the first version

The first version stored one flat task list. On first open, those tasks are moved into a single **Personal list** (the name follows the interface language) and saved in the new multi-list shape. Existing task order, titles, and done marks are preserved. If an earlier build crashed while reordering and left that list without its tasks, this version restores the tasks it last recorded for it once.

## Limitations

- There is no renaming of lists or tasks, no search, no due dates, and no reminders; a task is one line of text, done or not done.
- Tasks cannot be dragged from one list to another; reordering works within a list. Create or delete lists to regroup.
- Reordering works by dragging with a mouse or trackpad, or with the arrow keys on a focused grip.
- Uninstalling the plugin removes the page and the sidebar entry and leaves the stored lists behind, so reinstalling shows the same lists again.

## Removal

Disabling or removing the bundle removes only its sidebar entry and its page; other sidebar entries, pages, and conversations are untouched.
