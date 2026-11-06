// "1,798" -> { prefix: "", value: 1798, suffix: "", grouped: true }; null when there is no number to count.
export function parseStat(text) {
  const m = /^(\D*?)(\d[\d,]*)(\D*)$/.exec(text ?? "");
  if (!m) return null;
  return { prefix: m[1], value: Number(m[2].replace(/,/g, "")), suffix: m[3], grouped: m[2].includes(",") };
}

export function formatStat(stat, n) {
  const r = Math.round(n);
  const body = stat.grouped ? r.toLocaleString("en-US") : String(r);
  return stat.prefix + body + stat.suffix;
}
