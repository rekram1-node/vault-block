import { type MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

import { req } from "shared/lib/req";
import { type TokenResponse } from "functions/src/types/tokenResponse";
import { factory, type Context } from "functions/src/hono/hono";
import { Unauthorized } from "../types/errors";
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  MAX_AGE,
} from "functions/src/hono/sessionMgmt";

const auth_url = "https://api.notion.com/v1/oauth/authorize";
const token_url = "https://api.notion.com/v1/oauth/token";
const SESSION_COOKIE = "__session_cookie";

const app = factory.createApp();

export const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (!token) {
    console.log("no cookie");
    throw Unauthorized;
  }

  const session = await validateSessionToken(c, token);
  if (!session) {
    console.log("no session");
    throw Unauthorized;
  }
  c.set("session", session);

  await next();
};

function getRedirectUri(c: Context) {
  const url = new URL(c.req.url);
  const redirect = c.env.REDIRECT_URL ?? `${url.origin}/auth/callback`;
  return redirect;
}

const auth = app
  .get("/notion", async (c) => {
    const cookie = getCookie(c, SESSION_COOKIE);
    if (cookie) {
      const session = await validateSessionToken(c, cookie);
      if (session) {
        return c.redirect("/");
      }
    }
    const url = `${auth_url}?${new URLSearchParams({
      client_id: c.env.NOTION_CLIENT_ID,
      redirect_uri: getRedirectUri(c),
      owner: "owner",
      response_type: "code",
    }).toString()}`;
    return c.json({ url });
  })

  .get("/status", authMiddleware, async (_c) => {
    return new Response(null, { status: 200 });
  })

  .post("/login", async (c) => {
    const code = c.req.query("code");
    if (!code) {
      throw Unauthorized;
    }
    if (code === "null") {
      throw new HTTPException(400, { message: "login cancelled" });
    }
    const encodedCreds = btoa(
      `${c.env.NOTION_CLIENT_ID}:${c.env.NOTION_CLIENT_SECRET}`,
    );

    const result = await req<TokenResponse>(token_url, {
      method: "POST",
      body: JSON.stringify({
        code,
        grant_type: "authorization_code",
        redirect_uri: getRedirectUri(c),
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + encodedCreds,
      },
    });
    if (!result.ok) {
      console.error("unable to fetch token:", result.error);
      throw new HTTPException(500, { message: "failed to fetch token" });
    }

    const { access_token, owner } = result.data;

    const token = generateSessionToken();
    const session = await createSession(c, token, owner.user.id, access_token);

    const domain = new URL(c.req.url).host;
    setCookie(c, SESSION_COOKIE, token, {
      path: "/",
      secure: true,
      domain: c.env.NODE_ENV === "development" ? undefined : domain,
      httpOnly: true,
      maxAge: MAX_AGE,
      expires: session.expiresAt,
      sameSite: "Strict",
    });

    const readUserResult = await c.var.db.readUser(owner.user.id);
    if (!readUserResult.ok) {
      throw new HTTPException(500, {
        message: "failed to read user from database",
      });
    }
    let signup = false;
    if (!readUserResult.data) {
      signup = true;
      const result = await c.var.db.createUser({
        id: owner.user.id,
      });
      if (!result.ok) {
        throw new HTTPException(500, { message: result.error.message });
      }
    }

    return c.json({ newSignup: signup });
  })

  .post("/logout", async (c) => {
    const cookie = getCookie(c, SESSION_COOKIE);
    if (cookie) {
      await invalidateSession(c, cookie);
      deleteCookie(c, cookie);
    }
    return new Response(null, { status: 200 });
  });

export const authRouter = auth;
