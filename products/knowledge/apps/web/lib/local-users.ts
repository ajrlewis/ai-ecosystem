import "server-only";
import { z } from "zod";

export const KNOWLEDGE_SCOPE = "knowledge.api";
export const AGENT_SCOPE = "agent.api";
export const STEWARD_ROLE = "knowledge.steward";
export const CONVERSATION_ROLE = "conversation.user";

const claimSchema = z.object({
  subject: z.string().trim().min(1).max(255),
  displayName: z.string().trim().min(1).max(255),
  organizationId: z.string().uuid(),
  principalId: z.string().uuid(),
  groupIds: z.array(z.string().uuid()),
  scopes: z.array(z.enum([KNOWLEDGE_SCOPE, AGENT_SCOPE])).min(1),
  roles: z.array(z.enum([STEWARD_ROLE, CONVERSATION_ROLE])),
}).strict();

const fixtureSchema = claimSchema.extend({
  username: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(255),
}).strict();

export type LocalClaims = z.infer<typeof claimSchema>;
export type LocalUser = z.infer<typeof fixtureSchema>;

const defaults: LocalUser[] = [
  { username: "alex", password: "ai-ecosystem-local-dev", subject: "northstar-alex", displayName: "Alex Rowan", organizationId: "35982da3-60ae-5eea-b46a-088c3cc0f278", principalId: "7f180c45-c2f9-5f9d-b715-bf68f4ced724", groupIds: ["8bde0934-4daa-5afa-a9c3-24e849557486"], scopes: [KNOWLEDGE_SCOPE, AGENT_SCOPE], roles: [STEWARD_ROLE, CONVERSATION_ROLE] },
  { username: "morgan", password: "ai-ecosystem-local-dev", subject: "northstar-morgan", displayName: "Morgan Lee", organizationId: "35982da3-60ae-5eea-b46a-088c3cc0f278", principalId: "52d13c34-a996-52f3-b4e9-33daf8b0fd72", groupIds: ["ed74569a-d5ea-5cb2-a321-bbd23825d652"], scopes: [KNOWLEDGE_SCOPE, AGENT_SCOPE], roles: [CONVERSATION_ROLE] },
  { username: "taylor", password: "ai-ecosystem-local-dev", subject: "northstar-taylor", displayName: "Taylor Quinn", organizationId: "35982da3-60ae-5eea-b46a-088c3cc0f278", principalId: "b6fe5b54-0d90-5c69-8824-cdb9f04f1d03", groupIds: [], scopes: [KNOWLEDGE_SCOPE, AGENT_SCOPE], roles: [CONVERSATION_ROLE] },
];

export function localUsers(): LocalUser[] {
  const raw = process.env.LOCAL_USERS;
  const users = z.array(fixtureSchema).min(1).parse(raw ? JSON.parse(raw) : defaults);
  const usernames = new Set<string>();
  const subjects = new Set<string>();
  for (const user of users) {
    if (usernames.has(user.username) || subjects.has(user.subject)) throw new Error("LOCAL_USERS contains duplicate usernames or subjects");
    usernames.add(user.username); subjects.add(user.subject);
  }
  return users;
}

export function publicLocalUsers() {
  return localUsers().map(({ username, displayName }) => ({ username, displayName }));
}
