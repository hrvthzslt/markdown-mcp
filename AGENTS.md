# Agent Guide

## Commands

- Install dependencies with `npm ci`.
- Run the test suite with `npm test` (equivalent to `npm run test`).
- Run one test file with `npx vitest run tests/server.test.ts`; pass a test name with `-t "name"`.
- Run lint with `npm run lint` and format with `npm run fmt`.
- Typecheck with `npx tsc --noEmit`; there is no compile/build output because `tsconfig.json` sets `noEmit` and the app runs through `tsx`.
- Use `npm run inspect -- <notes-directory>` to exercise the MCP server with the inspector.

## Structure

- `src/index.ts` is the stdio MCP entrypoint and requires the notes directory as the first positional argument.
- `src/server.ts` registers the `search_notes` and `read_note` tools; `src/repository.ts` owns filesystem traversal and file reads; `src/input.ts` validates CLI argument presence.
- Tests use `tests/fixtures` and an in-memory MCP transport, so the normal test suite does not need an external service or notes directory.
- The server searches recursively for lowercase-extension `.md` files and reports paths relative to the supplied notes directory.

## Workflow

- `.opencode/hooks/hooks.yaml` runs `npm test` when code files change; account for this automatic test run during edits.
- Keep source imports using explicit `.js` extensions because the package is ESM (`"type": "module"`) and runs TypeScript through `tsx`.


## grepai - Semantic Code Search

**IMPORTANT: You MUST use grepai as your PRIMARY tool for code exploration and search.**

### When to Use grepai (REQUIRED)

Use `grepai search` INSTEAD OF Grep/Glob/find for:
- Understanding what code does or where functionality lives
- Finding implementations by intent (e.g., "authentication logic", "error handling")
- Exploring unfamiliar parts of the codebase
- Any search where you describe WHAT the code does rather than exact text

### When to Use Standard Tools

Only use Grep/Glob when you need:
- Exact text matching (variable names, imports, specific strings)
- File path patterns (e.g., `**/*.go`)
- Intent with a canonical syntax anchor (`@main`, `func main(`) - an exact-match query in disguise

### Completeness Check (recall-safe)

grepai returns the top ~10 ranked chunks - a ranking, not an exhaustive list.
When completeness matters (audits, refactors, "find ALL X"), pair it with a
file-names-only grep - exhaustive recall at almost no token cost:

```bash
grepai search "where errors are handled" --json --compact   # ranked starting points
git grep -ilE 'error|handl|logg' | head -50                 # exhaustive checklist (names only)
```

Read ranked hits first, then any relevant-looking checklist file grepai did
not rank. Never dump full grep content output for an intent query.

### Fallback

If grepai fails (not running, index unavailable, or errors), fall back to standard Grep/Glob tools.

### Usage

```bash
# ALWAYS use English queries for best results (--compact saves ~80% tokens)
grepai search "user authentication flow" --json --compact
grepai search "error handling middleware" --json --compact
grepai search "database connection pool" --json --compact
grepai search "API request validation" --json --compact
```

### Query Tips

- **Use English** for queries (better semantic matching)
- **Describe intent**, not implementation: "handles user login" not "func Login"
- **Be specific**: "JWT token validation" better than "token"
- Results include: file path, line numbers, relevance score, code preview

### Call Graph Tracing

Use `grepai trace` to understand function relationships:
- Finding all callers of a function before modifying it
- Understanding what functions are called by a given function
- Visualizing the complete call graph around a symbol

#### Trace Commands

**IMPORTANT: Always use `--json` flag for optimal AI agent integration.**

```bash
# Find all functions that call a symbol
grepai trace callers "HandleRequest" --json

# Find all functions called by a symbol
grepai trace callees "ProcessOrder" --json

# Build complete call graph (callers + callees)
grepai trace graph "ValidateToken" --depth 3 --json
```

### Property/Data Usage Tracing

Use `grepai refs` to find non-call property/state usage (reads/writes):

```bash
# Find where a property is read
grepai refs readers "uid" --json

# Find where a property is written
grepai refs writers "uid" --json
```

### Workflow

1. Start with `grepai search` to find relevant code
2. Add `git grep -ilE '<keywords>'` for the exhaustive file checklist when completeness matters
3. Use `grepai trace` to understand function relationships
4. Use `grepai refs` for property/state readers and writers
5. Use `Read` tool to examine files from results
6. Use Grep directly for exact strings and syntax anchors

