// Generates a clean SVG product tile as a data URI (no external images needed).

const PALETTE = {
  "Ethnic Wear": ["#f6d365", "#fda085"],
  "Western Wear": ["#a1c4fd", "#c2e9fb"],
  Footwear: ["#d4fc79", "#96e6a1"],
  Accessories: ["#fbc2eb", "#a6c1ee"],
  Electronics: ["#89f7fe", "#66a6ff"],
  Stationery: ["#ffecd2", "#fcb69f"],
  Arts: ["#e0c3fc", "#8ec5fc"],
  "Home & Living": ["#fdfcfb", "#e2d1c3"],
  Sports: ["#84fab0", "#8fd3f4"],
};

export function productArt(category, emoji = "🛍️") {
  const [a, b] = PALETTE[category] || ["#e5e7eb", "#cbd5e1"];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#g)"/>` +
    `<circle cx="330" cy="50" r="90" fill="#fff" opacity=".18"/>` +
    `<circle cx="60" cy="270" r="70" fill="#fff" opacity=".14"/>` +
    `<text x="200" y="185" font-size="120" text-anchor="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const ART_PREFIX = "data:image/svg+xml;charset=utf-8,";
/** True for tiles produced by productArt(), which must never be saved as an uploaded image. */
export const isArt = (image) => typeof image === "string" && image.startsWith(ART_PREFIX);
/** Ensures a product always has something to show. */
export const withArt = (p) => (p && !p.image ? { ...p, image: productArt(p.category, p.emoji) } : p);
