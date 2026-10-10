// In-browser port of the Aizy fashion assistant. The live service trains a
// TF-IDF + RandomForest model on python/data/fashion.csv; here we rank the same
// rows with TF-IDF-weighted keyword matching so the demo needs no server.
import rows from "./fashionData.json";

const STOP = new Set(
  "a an the for to of in on at and or i am is are me my need want suggest outfit outfits dress wear something what should which can could would please give show with some any attending attend going go have has coming up this that it be been who how do does something".split(
    " "
  )
);

const GENDER_WORDS = {
  b: ["boy", "boys", "man", "men", "male", "guy", "gentleman", "husband", "son", "brother", "groom"],
  g: ["girl", "girls", "woman", "women", "female", "lady", "ladies", "wife", "daughter", "sister", "bride"],
};

const SYNONYMS = {
  college: ["school", "cultural_festival"],
  fest: ["cultural_festival", "festive_gathering", "festival"],
  festival: ["festive_gathering", "cultural_festival"],
  party: ["birthday", "reception_party", "new_year_eve", "christmas_party"],
  office: ["formal_event", "formal"],
  meeting: ["formal_event", "formal"],
  corporate: ["formal_event", "formal"],
  conference: ["formal_event", "formal"],
  eid: ["ramzan"],
  ramadan: ["ramzan"],
  dussehra: ["dasara"],
  dasara: ["dasara", "navratri"],
  christmas: ["christmas_party"],
  newyear: ["new_year_eve"],
  marriage: ["wedding"],
  shaadi: ["wedding"],
  reception: ["reception_party"],
  temple: ["temple_visit"],
  ganesh: ["ganesh_chaturthi"],
  rakhi: ["raksha_bandhan"],
  deepavali: ["diwali"],
  gym: ["sportswear"],
  workout: ["sportswear"],
  winter: ["outerwear", "ski_trip"],
  beach: ["beachwear", "resort"],
};

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9_ ]+/g, " ");
const tokensOf = (s) => norm(s).split(/\s+/).filter(Boolean);
const pretty = (s) => String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Pre-compute document frequency across the corpus.
const docs = rows.map(([name, category, gender, region, occasion]) => {
  const terms = new Set([
    ...tokensOf(category),
    ...tokensOf(region),
    ...tokensOf(occasion),
    ...String(region).split("_"),
    ...String(occasion).split("_"),
  ]);
  return { name, category, gender, region, occasion, terms };
});
const df = new Map();
docs.forEach((d) => d.terms.forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
const idf = (t) => Math.log((docs.length + 1) / ((df.get(t) || 0) + 1)) + 1;

function detectGender(tokens) {
  const set = new Set(tokens);
  if (GENDER_WORDS.g.some((w) => set.has(w))) return "g";
  if (GENDER_WORDS.b.some((w) => set.has(w))) return "b";
  return null;
}

export function recommend(prompt, { limit = 5 } = {}) {
  const tokens = tokensOf(prompt);
  const gender = detectGender(tokens);
  const query = new Set();
  tokens.forEach((t) => {
    if (STOP.has(t) || t.length < 3) return;
    query.add(t);
    (SYNONYMS[t] || []).forEach((s) => query.add(s));
  });
  // "ethnic wear" style two-word hints
  const joined = norm(prompt).replace(/\s+/g, "_");
  docs.forEach((d) => {
    if (d.occasion && joined.includes(d.occasion)) query.add(d.occasion);
    if (d.region && d.region !== "all" && joined.includes(d.region)) query.add(d.region);
  });

  const scored = docs.map((d) => {
    let score = 0;
    const hits = [];
    query.forEach((q) => {
      const direct = d.terms.has(q) || d.occasion === q || d.region === q;
      const partial = !direct && [...d.terms].some((t) => t.length > 3 && (t.startsWith(q) || q.startsWith(t)));
      if (direct) {
        score += idf(q) * 2;
        hits.push(q);
      } else if (partial) {
        score += idf(q);
        hits.push(q);
      }
    });
    if (gender) score += d.gender === gender ? 1.5 : -4;
    if (d.region === "all" || d.region === "all_india") score += 0.2;
    return { d, score, hits };
  });

  scored.sort((a, b) => b.score - a.score || a.d.name.localeCompare(b.d.name));
  const picked = [];
  const seen = new Set();
  for (const s of scored) {
    if (s.score <= 0 && picked.length) break;
    if (seen.has(s.d.name)) continue;
    seen.add(s.d.name);
    picked.push(s);
    if (picked.length >= limit) break;
  }
  return { gender, picks: picked };
}

// Store items that are clearly for one gender should not be suggested to the other.
const FOR_MEN = /sherwani|pathani|nehru|dhoti|blazer|formal shirt/i;
const FOR_WOMEN = /saree|lehenga|anarkali|dress|gown|dupatta|jhumka|palazzo|skirt|heels|tote/i;
function suitsGender(product, gender) {
  if (gender === "g") return !FOR_MEN.test(product.name);
  if (gender === "b") return !FOR_WOMEN.test(product.name);
  return true;
}

export function answer(prompt, catalogue = []) {
  const text = String(prompt || "").trim();
  if (!text) return { message: "Tell me who it's for and what the occasion is, and I'll suggest outfits.", picks: [], products: [] };

  const { gender, picks } = recommend(text);
  if (!picks.length || picks[0].score <= 0.5) {
    return {
      message:
        "I couldn't match that to an occasion yet. Try something like “outfit for a girl at a wedding in Hyderabad” or “boy, college fest”.",
      picks: [],
      products: [],
    };
  }

  const lines = picks.map((p, i) => {
    const why = [p.d.occasion !== "all" && pretty(p.d.occasion), p.d.region !== "all" && pretty(p.d.region)]
      .filter(Boolean)
      .join(" · ");
    return `${i + 1}. **${p.d.name}** (${p.d.category})${why ? ` — ${why}` : ""}`;
  });

  // Surface matching products from the store catalogue.
  const names = picks.map((p) => p.d.name.toLowerCase());
  const cats = new Set(picks.map((p) => p.d.category.toLowerCase()));
  const nameHit = (pr) => {
    const n = pr.name.toLowerCase();
    return names.some((x) => n.includes(x) || x.includes(n));
  };
  const products = catalogue
    .filter((pr) => (nameHit(pr) || cats.has(String(pr.category).toLowerCase())) && suitsGender(pr, gender))
    // Exact name matches first, then the best rated in the same category.
    .sort((a, b) => Number(nameHit(b)) - Number(nameHit(a)) || (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  const who = gender === "g" ? "her" : gender === "b" ? "him" : "you";
  const message = `Here's what I'd suggest for ${who}:\n${lines.join("\n")}${
    products.length ? "\n\nA few matching pieces from the store are below." : ""
  }`;
  return { message, picks: picks.map((p) => p.d.name), products };
}
