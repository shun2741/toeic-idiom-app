export function normalizeAnswer(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:()[\]{}"'`]/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
