import * as path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../src/server.js";

const FIXTURES_DIR = path.join(import.meta.dirname, "fixtures");

let client: Client;

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

describe("search_notes", () => {
  async function searchNotes(query: string): Promise<string> {
    const result = await client.callTool({
      name: "search_notes",
      arguments: { query },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    return content[0]!.text;
  }

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

  it("returns an error result when the notes directory is unreadable", async () => {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await createServer(path.join(FIXTURES_DIR, "does-not-exist")).connect(
      serverTransport,
    );
    const brokenClient = new Client({
      name: "test-client",
      version: "1.0.0",
    });
    await brokenClient.connect(clientTransport);

    try {
      const result = await brokenClient.callTool({
        name: "search_notes",
        arguments: { query: "apples" },
      });
      const content = result.content as Array<{ type: string; text: string }>;

      expect(result.isError).toBe(true);
      expect(content[0]!.text).toContain("Error searching notes:");
    } finally {
      await brokenClient.close();
    }
  });
});

describe("read_note", () => {
  async function readNote(relativePath: string) {
    const result = await client.callTool({
      name: "read_note",
      arguments: { relativePath },
    });
    const content = result.content as Array<{ type: string; text: string }>;
    return { isError: result.isError, text: content[0]!.text };
  }

  it("reads the full content of a note", async () => {
    const { isError, text } = await readNote("groceries.md");

    expect(isError).toBeUndefined();
    expect(text).toContain("# Groceries");
    expect(text).toContain("Buy apples and bananas.");
  });

  it("reads notes in nested directories", async () => {
    const { isError, text } = await readNote(path.join("work", "meeting.md"));

    expect(isError).toBeUndefined();
    expect(text).toContain("roadmap");
  });

  it("returns an error result for a missing note", async () => {
    const { isError, text } = await readNote("does-not-exist.md");

    expect(isError).toBe(true);
    expect(text).toContain("Error reading file:");
  });
});
