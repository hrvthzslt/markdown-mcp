import * as fs from "fs/promises";
import * as path from "path";

function getPathFromInput(processArgv: string[]): string {
  if (!processArgv[2] && typeof processArgv[2] !== "string") {
    console.error("Please provide a directory path as an argument.");
    process.exit(1);
  }

  return processArgv[2];
}

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
    const dirPath = getPathFromInput(process.argv);
    console.info(dirPath);
    console.info(await getMarkdownFiles(dirPath));

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
