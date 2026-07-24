import * as fs from "fs/promises";
import * as path from "path";

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

async function main() {
  if (!process.argv[2] && typeof process.argv[2] !== "string") {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }
  const dirPath = process.argv[2];
  console.log(process.argv);
  console.info(await getMarkdownFiles(dirPath));
}

main();
