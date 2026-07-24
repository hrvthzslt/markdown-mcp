import * as fs from "fs/promises";
import * as path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

function getPathFromInput(processArgv: string[]): string {
  if (!processArgv[2] && typeof processArgv[2] !== "string") {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }

  return processArgv[2];
}

const NOTES_DIR = getPathFromInput(process.argv);

const server = new McpServer({
  name: "markdown-mcp",
  version: "1.0.0",
});

async function getMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      if (entry.isDirectory()) {
        return getMarkdownFiles(res);
      }
      return entry.name.endsWith(".md") ? res : [];
    }),
  );
  return files.flat();
}

server.registerTool(
  "search_notes",
  {
    description: "Searches for a keyword or string inside all markdown files.",
    inputSchema: {
      query: z.string().describe("The search keyword or phrase"),
    },
  },
  async ({ query }) => {
    try {
      const allFiles = await getMarkdownFiles(NOTES_DIR);
      const lowercaseQuery = query.toLowerCase();
      const matches: string[] = [];

      for (const filePath of allFiles) {
        const content = await fs.readFile(filePath, "utf-8");
        if (content.toLowerCase().includes(lowercaseQuery)) {
          const relativePath = path.relative(NOTES_DIR, filePath);
          matches.push(`- ${relativePath}`);
        }
      }

      const resultText =
        matches.length > 0
          ? `Found matches in:\n${matches.join("\n")}`
          : "No matching notes found.";

      return { content: [{ type: "text", text: resultText }] };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          { type: "text", text: `Error searching notes: ${error.message}` },
        ],
      };
    }
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Markdown Reader MCP Server running...");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
