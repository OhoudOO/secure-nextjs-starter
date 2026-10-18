import { loadEnv } from "@/lib/env";

// Validates the environment once when the server starts, so a missing secret fails loudly.
export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") loadEnv();
}
