import { env } from "../config/env.js";
import { createMemoryRepos } from "./memory.js";

export async function createRepos(mode = env.dataMode) {
  if (mode === "memory") return createMemoryRepos();
  const { connectDB } = await import("../config/mongodb.config.js");
  await connectDB();
  const { createDbRepos } = await import("./db.js");
  return createDbRepos();
}
