# dsh-plugins

Five personal DeepSeek Harness plugin **bundles** in one repository, so each one can be
installed straight from Git — no registry, no packed tarball to keep around.

Every directory under `plugins/` is a self-contained bundle: `package.json` declares
`dsh.bundle.patch`, `cordis.patch.yml` inserts that plugin's rows, and `files` lists
everything it needs at runtime (`index.js`, `client.js`, `locale/`, `icon.svg`, `docs/`).

| Directory | Package | What it does |
|---|---|---|
| `plugins/claude-look` | `@local/claude-look` | Claude-style warm palette, brand marks, Projects panel |
| `plugins/composer-balance` | `@local/composer-balance` | Account balance in the composer footer |
| `plugins/interactive-answers` | `@local/interactive-answers` | Inline answer blocks: tables, images, cards, choices |
| `plugins/figma-mcp` | `@local/figma-mcp` | Figma desktop MCP server (read-only design tools) |
| `plugins/todo-view` | `@dsh-local/view-2cc9dc95-2fad-493b-bcba-29b2666983c5` | To-do page in the left sidebar |

## Install

Exact pinned specs per plugin are in [INSTALL.md](INSTALL.md). The general form is:

```
git+https://github.com/artemnrv/dsh-plugins.git#<full-40-char-commit>&path:/plugins/<directory>
```

Paste a spec into **Plugins → Add plugin**, or run
`dsh plugin --profile <profile> add "<spec>"`.

The spec pins a **full commit**, not a branch: installations are reproducible, and a
copy installed from such a spec is the only kind the Plugins page may later replace
with a newer commit through a Discover index.

## Update

Change a plugin, commit, push, then install that plugin again with the new spec.
Bundles installed from a tarball, a local path, or a link get no **Update** button;
Git copies update only through a Discover index that lists the new commit.

## Share

The repository is **public**: anyone can install these plugins with the specs in
[INSTALL.md](INSTALL.md) — signing in to GitHub is not required.

## Local check

Both the repository and the profile live on this machine, so a spec may also use
`git+file:///…/dsh-plugins#<commit>&path:/plugins/<directory>`; that form is valid
only while the checkout stays at that absolute path.
