// Starts the API with no databases: `npm run dev:memory`. Demo accounts: see README.
process.env.DATA_MODE = "memory";
process.env.SEED_DEMO = "1";
await import("../app.js");
