// Small fuzzy matcher for the command palette.
//
// The query's characters must appear in order in the text. Matches score
// higher when they are consecutive, start a word, or start the text.
// Returns null for no match, otherwise { score, indices }.
export function fuzzyMatch(query, text) {
  const q = query.toLowerCase().replace(/\s+/g, "");
  if (!q) return { score: 0, indices: [] };
  const t = text.toLowerCase();
  const indices = [];
  let score = 0;
  let ti = 0;
  let prev = -2;
  for (const ch of q) {
    const found = t.indexOf(ch, ti);
    if (found === -1) return null;
    let s = 1;
    if (found === prev + 1) s += 5; // consecutive
    if (found === 0) s += 8; // start of text
    else if (/[\s\-_/·.]/.test(t[found - 1])) s += 6; // start of a word
    s -= Math.min(found - ti, 5) * 0.2; // small penalty for gaps
    score += s;
    indices.push(found);
    prev = found;
    ti = found + 1;
  }
  return { score: score - t.length * 0.01, indices };
}

// Filters and ranks items by `key(item)`. Stable for equal scores.
export function fuzzyFilter(query, items, key) {
  if (!query.trim()) return items.map((item) => ({ item, indices: [] }));
  return items
    .map((item, order) => {
      const m = fuzzyMatch(query, key(item));
      return m && { item, indices: m.indices, score: m.score, order };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.order - b.order);
}
