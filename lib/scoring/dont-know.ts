export const DONT_KNOW_SENTINEL = "__dont_know__";

export function isDontKnowAnswer(input: string) {
  return input.trim() === DONT_KNOW_SENTINEL;
}
