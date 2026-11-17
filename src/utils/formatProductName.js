// Title Case for product names (mirrors the backend rule so the form shows what will be saved).
const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);

function formatWord(word, isFirst) {
  if (!word) return word;
  if (word.includes("-")) return word.split("-").map((p) => formatWord(p, true)).join("-");
  const m = word.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}].*)$/u);
  if (!m) return word;
  const [, lead, core] = m;
  if (/\d/.test(core)) return word;
  if (core.length <= 3 && core === core.toUpperCase() && /\p{L}/u.test(core)) return word;
  if (!isFirst && SMALL_WORDS.has(core.toLowerCase())) return lead + core.toLowerCase();
  return lead + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

export function formatProductName(name) {
  if (typeof name !== "string") return name;
  return name.trim().replace(/\s+/g, " ").split(" ").map((w, i) => formatWord(w, i === 0)).join(" ");
}
