export function normalizeAnswer(input: string) {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:()[\]{}"'`]/g, " ")
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeJapaneseAnswer(input: string) {
  return input
    .normalize("NFKC")
    .trim()
    .replace(/[。、「」『』（）()!?！？・,，.]/g, "")
    .replace(/\s+/g, "")
    .trim();
}
