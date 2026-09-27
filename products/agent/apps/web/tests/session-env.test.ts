// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { env } from "@/lib/env";
import { createSession, readSession, sessionCookie, validCredentials } from "@/lib/session";
const original = process.env;
describe("Agent web configuration and session", () => {
  afterEach(() => { process.env = original; vi.unstubAllEnvs(); });
  it("requires a valid Agent API URL and bearer", () => { process.env = { ...original, AGENT_API_URL: "not-a-url", AGENT_API_BEARER_TOKEN: "" }; expect(() => env()).toThrow(); });
  it("uses a typed local fixture and a signed claims-only cookie", () => {
    process.env = { ...original, AGENT_API_BEARER_TOKEN: "agent-secret", LOCAL_IDENTITY_SECRET: "local-identity-secret", LOCAL_USERS: JSON.stringify([{ username: "agent-user", password: "agent-password", subject: "subject-a", displayName: "Agent User", organizationId: "10000000-0000-0000-0000-000000000001", principalId: "20000000-0000-0000-0000-000000000001", groupIds: [], scopes: ["agent.api"], roles: ["conversation.user"] }]) };
    expect(validCredentials("agent-user", "agent-password")?.subject).toBe("subject-a");
    expect(validCredentials("knowledge-admin", "knowledge-local-dev")).toBeNull();
    const value = createSession();
    expect(sessionCookie).toBe("agent-session"); expect(value).not.toContain("agent-password"); expect(value).not.toContain("agent-secret"); expect(readSession(value)?.subject).toBe("subject-a"); expect(readSession(`${value}x`)).toBeNull();
  });
});
