import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { CONVERSATION_ROLE, CORTEX_SCOPE, LocalClaims, localUsers } from "./local-users";

export const sessionCookie = "cortex-session";

function signature(value: string) {
  return createHmac("sha256", env().LOCAL_IDENTITY_SECRET)
    .update(value)
    .digest("base64url");
}

export function createSession(claims?: LocalClaims) {
  if (!claims) {
    const { username: _, password: __, ...defaultClaims } = localUsers()[0];
    claims = defaultClaims;
  }
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function readSession(value?: string) {
  if (!value) return null;
  const split = value.lastIndexOf(".");
  if (split < 1) return null;
  const marker = value.slice(0, split);
  const actual = Buffer.from(value.slice(split + 1));
  const expected = Buffer.from(signature(marker));
  return actual.length === expected.length && timingSafeEqual(actual, expected)
    ? (() => { try { return JSON.parse(Buffer.from(marker, "base64url").toString()) as LocalClaims; } catch { return null; } })()
    : null;
}

export function validCredentials(user: string, password: string) {
  const candidate = localUsers().find((item) => item.username === user);
  const actual = Buffer.from(password);
  const expected = Buffer.from(candidate?.password ?? "invalid-local-password");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected) || !candidate || !candidate.scopes.includes(CORTEX_SCOPE) || !candidate.roles.includes(CONVERSATION_ROLE)) return null;
  const { username: _, password: __, ...claims } = candidate;
  return claims;
}
