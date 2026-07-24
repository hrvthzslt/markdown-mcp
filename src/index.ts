import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";
import { createServer } from "./server.js";

function getPathFromInput(processArgv: string[]): string {
  if (!processArgv[2] && typeof processArgv[2] !== "string") {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }

  return processArgv[2];
}

async function main() {
  const server = createServer(getPathFromInput(process.argv));
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Markdown Reader MCP Server running...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
