# Markdown MCP Server

An MCP Server for providing tools to search and read Markdown files recursively.

## Tools

- `search_notes` - Searches for a phrase inside all markdown files.
  - `query` - The search phrase.
- `read_note` - Reads the complete text content of a specific markdown note.
  - `relativePath` - The relative path of the note from the notes root (e.g., `Work/Meeting.md`).

## Setup

Run `npm ci` to install the dependencies.

Example for setting up the MCP for Claude globally. Provide the MCP entrypoint and the path to the markdown files with the following command.

```bash
claude mcp add --scope user markdown-mcp -- npx tsx ${HOME}/markdown-mcp/src/index.ts ${HOME}/path/notes
```

Will yield the following config:

```json
"mcpServers": {
  "markdown-mcp": {
    "type": "stdio",
    "command": "npx",
    "args": [
      "tsx",
      "/home/user/markdown-mcp/src/index.ts",
      "/home/user/path/notes"
    ]
  }
}
```

## Command

```bash
npx tsx src/index.ts ~/path/notes
```

The command requires a path to the notes directory as a positional argument.

## Development

Testing the tools with the inspector can be done with the following command:

```bash
npx @modelcontextprotocol/inspector tsx src/index.ts ~/path/notes
```

Also, running tests with:

```bash
npm run test
```
