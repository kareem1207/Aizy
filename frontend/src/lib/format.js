export const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n) || 0);

/** Prefix a public/ asset with the deployment base path (GitHub Pages serves under /<repo>). */
export const asset = (p) => `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${p}`;
