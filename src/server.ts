import * as path from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getFileContent, searchInMarkdownFiles } from "./repository.js";

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

  server.registerTool(
    "read_note",
    {
      description:
        "Reads the complete text content of a specific markdown note.",
      inputSchema: {
        relativePath: z
          .string()
          .describe(
            "The relative path of the note from the vault root (e.g., 'Work/Meeting.md')",
          ),
      },
    },
    async ({ relativePath }) => {
      try {
        const content = await getFileContent(path.join(notesDir, relativePath));
        return {
          content: [{ type: "text", text: content }],
        };
      } catch (error: any) {
        return {
          isError: true,
          content: [
            { type: "text", text: `Error reading file: ${error.message}` },
          ],
        };
      }
    },
  );

  return server;
}
