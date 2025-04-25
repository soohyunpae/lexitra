


export function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z가-힣])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}