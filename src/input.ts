export function getPathFromInput(processArgv: string[]): string {
  const path = processArgv[2];
  if (!path) {
    throw new Error("Please provide a directory path as an argument.");
  }

  return path;
}
