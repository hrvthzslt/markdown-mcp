import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { createServer } from "./server.js";
import { checkDirectoryExistence as validateDirectoryExistence } from "./repository.js";
import { getPathFromInput } from "./input.js";

async function main() {
  const path = getPathFromInput(process.argv);
  await validateDirectoryExistence(path);
  const server = createServer(path);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Markdown Reader MCP Server running...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
