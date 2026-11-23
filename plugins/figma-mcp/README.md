# Figma MCP (desktop server)

Gives the agent the read tools of Figma's desktop MCP server.

**Before anything works:** the Figma desktop app must be open, in **Dev Mode**
(`Shift` + `D`), with **MCP server** enabled in the right sidebar, on a Dev or
Full seat. The server listens on `http://127.0.0.1:3845/mcp` and stops when
Figma closes. No token is involved and nothing leaves this machine.

## Tools

While Figma runs, these appear as `mcp__figma__*`:

- `get_design_context` — structure, styles, and generated code for a layer
- `get_metadata` — lightweight XML outline of a selection or page list
- `get_screenshot` — rendered image of a selection
- `get_variable_defs` — variables and styles used in a selection
- `get_code_connect_map`, `add_code_connect_map` — Code Connect mappings
- `get_figjam`, `get_motion_context` — diagram outline and animation data

Paste a frame link (**Copy link to selection**) or select a frame in Figma and
ask about it; the agent reads the design and writes code in the workspace.

## Limits

Read-only for design content. Writing to the canvas (`use_figma`), searching
libraries (`search_design_system`, `get_libraries`), and downloading assets
exist only on Figma's remote server `https://mcp.figma.com/mcp`, which is
OAuth-only and limited to clients in Figma's MCP catalog. This bundle does not
connect it. `add_code_connect_map` writes Code Connect mappings, not canvas
content.

## When tools are missing

1. Check that Figma is open, in Dev Mode, with its MCP server enabled.
2. Turn the bundle off and on under **Plugins**, or restart DSH. A session
   reload alone does not rebuild the connection row.
3. The row retries for about 45 minutes after a disconnect, then stops until
   step 2.

## Install on another machine

The bundle is a configuration-only package: no build step, no dependencies.

1. Copy this directory (or the `.tgz` next to it) to the other machine.
2. Install it:
   - **Plugins** > **Add plugin**, pointing at the directory, or
   - the `plugin_manager` tool: `install_bundle` with the absolute directory
     path or `file:/path/to/local-figma-mcp-1.0.0.tgz`.
3. A directory install links the folder: moving or deleting the copy afterwards
   breaks the bundle, so keep it somewhere stable or install the tarball.
4. The row uses `serverName: figma`. If the target profile already has an MCP
   entry named `figma`, remove or rename one of them — the names must be unique.
5. Keep Figma open in Dev Mode, start a new session, and ask the agent to call
   `mcp__figma__get_metadata` to confirm the connection.
