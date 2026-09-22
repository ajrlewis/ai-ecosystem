// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { env } from "@/lib/env";
import { createSession, readSession, sessionCookie, validCredentials } from "@/lib/session";
const original = process.env;
describe("Cortex web configuration and session", () => {
  afterEach(() => { process.env = original; vi.unstubAllEnvs(); });
  it("requires a valid Cortex API URL and bearer", () => { process.env = { ...original, CORTEX_API_URL: "not-a-url", CORTEX_API_BEARER_TOKEN: "" }; expect(() => env()).toThrow(); });
  it("uses a typed local fixture and a signed claims-only cookie", () => {
    process.env = { ...original, CORTEX_API_BEARER_TOKEN: "cortex-secret", LOCAL_IDENTITY_SECRET: "local-identity-secret", LOCAL_USERS: JSON.stringify([{ username: "cortex-user", password: "cortex-password", subject: "subject-a", displayName: "Cortex User", organizationId: "10000000-0000-0000-0000-000000000001", principalId: "20000000-0000-0000-0000-000000000001", groupIds: [], scopes: ["cortex.api"], roles: ["conversation.user"] }]) };
    expect(validCredentials("cortex-user", "cortex-password")?.subject).toBe("subject-a");
    expect(validCredentials("brain-admin", "brain-local-dev")).toBeNull();
    const value = createSession();
    expect(sessionCookie).toBe("cortex-session"); expect(value).not.toContain("cortex-password"); expect(value).not.toContain("cortex-secret"); expect(readSession(value)?.subject).toBe("subject-a"); expect(readSession(`${value}x`)).toBeNull();
  });
});
