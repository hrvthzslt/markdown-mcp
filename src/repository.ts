import * as fs from "fs/promises";
import * as path from "path";

export async function checkDirectoryExistence(dir: string): Promise<void> {
  let errorMessage = "";
  try {
    const stat = await fs.stat(dir);
    if (!stat.isDirectory()) {
      errorMessage = `${dir} is not a directory`;
    }
  } catch {
    errorMessage = `${dir} does not exist`;
  }
  if (errorMessage) {
    throw new Error(errorMessage);
  }
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

export async function searchInMarkdownFiles(
  dir: string,
  query: string,
): Promise<string> {
  const allFiles = await getMarkdownFiles(dir);
  const lowercaseQuery = query.toLowerCase();
  const matches: string[] = [];

  for (const filePath of allFiles) {
    const content = await fs.readFile(filePath, "utf-8");
    if (content.toLowerCase().includes(lowercaseQuery)) {
      const relativePath = path.relative(dir, filePath);
      matches.push(`- ${relativePath}`);
    }
  }

  return matches.length > 0
    ? `Found matches in:\n${matches.join("\n")}`
    : "No matching notes found.";
}

export async function getFileContent(path: string): Promise<string> {
  return await fs.readFile(path, "utf-8");
}
