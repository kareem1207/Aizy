// `EXPORT=1 npm run build` produces a static site in ./out (used for GitHub Pages).
// NEXT_PUBLIC_BASE_PATH is the sub-path the site is served from, e.g. /Aizy.
const isExport = process.env.EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export", trailingSlash: true } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: { unoptimized: true },
  // `npm run lint` runs ESLint directly; the build-time lint hook is incompatible with ESLint 9 flat configs.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
