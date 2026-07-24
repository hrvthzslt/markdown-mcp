import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

const FIXTURES_DIR = path.join(import.meta.dirname, "fixtures");

describe("search_notes", () => {
  let client: Client;

  async function searchNotes(query: string): Promise<string> {
    const result = await client.callTool({
      name: "search_notes",
      arguments: { query },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    return content[0]!.text;
  }

  beforeEach(async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await createServer(FIXTURES_DIR).connect(serverTransport);

    client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);
  });

  afterEach(async () => {
    await client.close();
  });

  it("finds notes containing the query", async () => {
    const text = await searchNotes("apples");

    expect(text).toContain("Found matches in:");
    expect(text).toContain("- groceries.md");
    expect(text).not.toContain("ideas.md");
  });

  it("matches case-insensitively", async () => {
    const text = await searchNotes("APPLES");

    expect(text).toContain("- groceries.md");
  });

  it("searches nested directories and reports relative paths", async () => {
    const text = await searchNotes("roadmap");

    expect(text).toContain(`- ${path.join("work", "meeting.md")}`);
  });

  it("ignores non-markdown files", async () => {
    const text = await searchNotes("MCP");

    expect(text).toContain("- ideas.md");
    expect(text).not.toContain("notes.txt");
  });

  it("reports when nothing matches", async () => {
    const text = await searchNotes("nonexistent-keyword");

    expect(text).toBe("No matching notes found.");
  });
});
