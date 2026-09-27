import "server-only";
import { z } from "zod";
const environment = z.object({
  BRAIN_API_URL: z.string().url().default("http://127.0.0.1:8000"),
  LOCAL_BEARER_TOKEN: z.string().min(1),
  LOCAL_IDENTITY_SECRET: z.string().min(16).default("mind-local-identity-secret"),
});
export function env() {
  return environment.parse(process.env);
}
