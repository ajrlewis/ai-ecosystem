import "server-only";
import { z } from "zod";

const environment = z.object({
  AGENT_API_URL: z.string().url().default("http://127.0.0.1:8100"),
  AGENT_API_BEARER_TOKEN: z.string().trim().min(1),
  LOCAL_IDENTITY_SECRET: z.string().min(16).default("ai-ecosystem-local-identity-secret"),
});

export function env() {
  return environment.parse(process.env);
}
