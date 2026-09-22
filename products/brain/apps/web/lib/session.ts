import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "./env";
import { BRAIN_SCOPE, LocalClaims, localUsers } from "./local-users";
export const sessionCookie = "brain-session";
function signature(user: string) {
  return createHmac("sha256", env().LOCAL_IDENTITY_SECRET)
    .update(user)
    .digest("base64url");
}
export function createSession(claims: LocalClaims) {
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
export function readSession(value?: string) {
  if (!value) return null;
  const split = value.lastIndexOf(".");
  if (split < 1) return null;
  const payload = value.slice(0, split);
  const actual = Buffer.from(value.slice(split + 1));
  const expected = Buffer.from(signature(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()) as LocalClaims; } catch { return null; }
}
export function validCredentials(user: string, password: string) {
  const candidate = localUsers().find((item) => item.username === user);
  const actual = Buffer.from(password);
  const expected = Buffer.from(candidate?.password ?? "invalid-local-password");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected) || !candidate || !candidate.scopes.includes(BRAIN_SCOPE)) return null;
  const { username: _, password: __, ...claims } = candidate;
  return claims;
}
