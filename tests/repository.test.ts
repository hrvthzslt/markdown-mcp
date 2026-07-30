import * as path from "path";
import { describe, expect, it } from "vitest";
import { checkDirectoryExistence } from "../src/repository.js";

const FIXTURES_DIR = path.join(import.meta.dirname, "fixtures");

describe("checkDirectoryExistence", () => {
  it("resolves for an existing directory", async () => {
    await expect(
      checkDirectoryExistence(FIXTURES_DIR),
    ).resolves.toBeUndefined();
  });

  it("rejects when the path does not exist", async () => {
    const missing = path.join(FIXTURES_DIR, "does-not-exist");

    await expect(checkDirectoryExistence(missing)).rejects.toThrow(
      `${missing} does not exist`,
    );
  });

  it("rejects when the path is a file", async () => {
    const file = path.join(FIXTURES_DIR, "groceries.md");

    await expect(checkDirectoryExistence(file)).rejects.toThrow(
      `${file} is not a directory`,
    );
  });
});
