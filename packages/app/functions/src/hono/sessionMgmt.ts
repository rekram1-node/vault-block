import {
  encodeHexLowerCase,
  encodeBase32LowerCaseNoPadding,
} from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";

import { type Context } from "functions/src/hono/hono";

export function generateSessionToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);
  return token;
}

export async function createSession(
  c: Context,
  token: string,
  userId: string,
  notionToken: string,
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessionExpiration = newSessionExpiration();
  const session: Session = {
    id: sessionId,
    userId,
    notionToken,
    expiresAt: new Date(sessionExpiration * 1000),
  };
  await c.env.VAULT_BLOCK_KV.put(
    `session:${sessionId}`,
    JSON.stringify(session),
    {
      expiration: sessionExpiration,
    },
  );

  return session;
}

export async function validateSessionToken(
  c: Context,
  token: string,
): Promise<Session | null> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const item = await c.env.VAULT_BLOCK_KV.get(`session:${sessionId}`);
  if (item === null) {
    console.log("session isn't in db");
    return null;
  }

  const sessionJson = JSON.parse(item) as SessionJson;
  const session: Session = {
    userId: sessionJson.userId,
    id: sessionJson.id,
    notionToken: sessionJson.notionToken,
    expiresAt: new Date(sessionJson.expiresAt),
  };
  console.log("item:", JSON.stringify(item));
  console.log("session:", JSON.stringify(session));
  console.log(typeof session.expiresAt);
  if (Date.now() >= session.expiresAt.getTime()) {
    await c.env.VAULT_BLOCK_KV.delete(`session:${sessionId}`);
    console.log("session is expired but in db");
    return null;
  }

  // it we are within 15 days of the expiration date
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    const sessionExpiration = newSessionExpiration();
    session.expiresAt = new Date(sessionExpiration * 1000);

    await c.env.VAULT_BLOCK_KV.put(
      `session:${sessionId}`,
      JSON.stringify(session),
      {
        expiration: sessionExpiration,
      },
    );
  }

  return session;
}

export async function invalidateSession(
  c: Context,
  token: string,
): Promise<void> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  await c.env.VAULT_BLOCK_KV.delete(`session:${sessionId}`);
}

interface SessionJson extends Omit<Session, "expiresAt"> {
  expiresAt: string;
}

export interface Session {
  id: string;
  userId: string;
  notionToken: string;
  expiresAt: Date;
}

export const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

function newSessionExpiration() {
  const now = Math.floor(Date.now() / 1000); // Current UTC time in seconds
  const sessionExpiration = now + MAX_AGE;
  return sessionExpiration;
}
