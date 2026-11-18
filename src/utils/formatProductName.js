function formatWord(word, isFirst) {
  if (!word) return word;
  if (word.includes("-")) return word.split("-").map((p) => formatWord(p, true)).join("-");
  const m = word.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}].*)$/u);
  if (!m) return word;
  const [, lead, core] = m;
  if (/\d/.test(core)) return word;
  if (core.length <= 3 && core === core.toUpperCase() && /\p{L}/u.test(core)) return word;
  return lead + core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

export function formatProductName(name) {
  if (typeof name !== "string") return name;
  return name.trim().replace(/\s+/g, " ").split(" ").map((w, i) => formatWord(w, i === 0)).join(" ");
}
