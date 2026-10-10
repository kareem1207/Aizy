import { env } from "./config/env.js";
import { createRepos } from "./repositories/index.js";
import { createApp } from "./appFactory.js";
import { seedAdmin, seedDemo } from "./seed.js";

async function main() {
  const repos = await createRepos();
  await seedAdmin(repos);
  if (env.seedDemo && repos.kind === "memory" && !env.isProd) await seedDemo(repos);

  createApp(repos).listen(env.port, () => {
    console.log(`Aizy API running on http://localhost:${env.port} (data: ${repos.kind})`);
  });
}

main().catch((err) => {
  console.error("Failed to start:", err.message);
  process.exit(1);
});
