// "demo" runs the whole app in the browser (no databases, no servers).
// "live" talks to the Express backend and the FastAPI AI service.
const rawMode = (process.env.NEXT_PUBLIC_API_MODE || "demo").toLowerCase();

export const API_MODE = rawMode === "live" ? "live" : "demo";
export const IS_DEMO = API_MODE === "demo";

export const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:5000").replace(/\/$/, "");
export const AI_URL = (process.env.NEXT_PUBLIC_AI_API || "http://127.0.0.1:8000").replace(/\/$/, "");
