import { describe, expect, it } from "vitest";
import { getPathFromInput } from "../src/input.js";

describe("getPathFromInput", () => {
  it("returns the path argument", () => {
    expect(getPathFromInput(["node", "index.ts", "/some/notes"])).toBe(
      "/some/notes",
    );
  });

  it("throws when no path is given", () => {
    expect(() => getPathFromInput(["node", "index.ts"])).toThrow(
      "Please provide a directory path as an argument.",
    );
  });

  it("throws when the path is an empty string", () => {
    expect(() => getPathFromInput(["node", "index.ts", ""])).toThrow(
      "Please provide a directory path as an argument.",
    );
  });
});
