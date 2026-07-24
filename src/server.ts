import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchInMarkdownFiles } from "./repository.js";

export function createServer(notesDir: string): McpServer {
  const server = new McpServer({
    name: "markdown-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "search_notes",
    {
      description:
        "Searches for a keyword or string inside all markdown files.",
      inputSchema: {
        query: z.string().describe("The search keyword or phrase"),
      },
    },
    async ({ query }) => {
      try {
        return {
          content: [
            {
              type: "text",
              text: await searchInMarkdownFiles(notesDir, query),
            },
          ],
        };
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

  return server;
}
