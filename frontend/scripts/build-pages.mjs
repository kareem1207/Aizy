// Builds the static demo site for GitHub Pages: `npm run build:pages`.
// Usage: node scripts/build-pages.mjs [repo-name]   (default: Aizy; pass "" for a root deployment)
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const arg = (process.argv[2] ?? "Aizy").replace(/^\/+|\/+$/g, "");
const basePath = arg ? `/${arg}` : "";
const env = {
  ...process.env,
  EXPORT: "1",
  NEXT_PUBLIC_API_MODE: "demo",
  NEXT_PUBLIC_BASE_PATH: basePath,
};
const res = spawnSync("npx", ["next", "build"], { stdio: "inherit", env, shell: true });
if (res.status === 0) writeFileSync("out/.nojekyll", "");
process.exit(res.status ?? 1);
