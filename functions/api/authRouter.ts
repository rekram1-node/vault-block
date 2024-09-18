import { type MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import jwt from "@tsndr/cloudflare-worker-jwt";

import { type JwtPayload, type JwtHeader } from "shared/types/jwt";
import { req } from "shared/lib/req";
import { type TokenResponse } from "functions/src/types/tokenResponse";
import { factory, type Context } from "functions/api/hono";
import { Unauthorized } from "./errors";

const auth_url = "https://api.notion.com/v1/oauth/authorize";
const token_url = "https://api.notion.com/v1/oauth/token";
const refresh_token_cookie = "__refresh_token";
const iss = "https://vault-block.com";
const aud = ["https://vault-block.com"];

const app = factory.createApp();

export const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const headerToken = c.req.header().authorization;
  if (!headerToken?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  const accessToken = headerToken.slice(7);

  const isValid = await jwt.verify(accessToken, c.env.ACCESS_TOKEN_SECRET);
  if (!isValid) {
    throw Unauthorized;
  }

  const t = jwt.decode<JwtPayload, JwtHeader>(accessToken);
  if (!t.header || !t.payload) {
    throw Unauthorized;
  }

  c.set("jwtHeader", t.header);
  c.set("jwtPayload", t.payload);
  c.set("userId", t.payload.sub);

  await next();
};

function getRedirectUri(c: Context) {
  const url = new URL(c.req.url);
  const redirect = c.env.REDIRECT_URL ?? `${url.origin}/auth/callback`;
  return redirect;
}

async function mintJwt(c: Context, sub: string, token: string, now?: number) {
  if (!now) {
    now = Math.floor(Date.now() / 1000); // Current UTC time in seconds
  }
  return jwt.sign<JwtPayload, JwtHeader>(
    {
      iat: now,
      // exp: now + 15 * 60,
      exp: now + 5 * 60, // UNDO THIS<<<<
      token_type: "access_token",
      sub: sub,
      token,
      aud,
      iss,
    },
    c.env.ACCESS_TOKEN_SECRET,
  );
}

const auth = app
  .get("/notion", async (c) => {
    const url = `${auth_url}?${new URLSearchParams({
      client_id: c.env.NOTION_CLIENT_ID,
      redirect_uri: getRedirectUri(c),
      owner: "owner",
      response_type: "code",
    }).toString()}`;
    return c.json({ url });
  })

  .post("/sign-in", async (c) => {
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
      return c.json({ error: "failed to fetch token" }, 500);
    }

    const { access_token, owner } = result.data;
    const now = Math.floor(Date.now() / 1000); // Current UTC time in seconds
    const token = await mintJwt(c, owner.user.id, access_token, now);

    const refreshTokenExpiration = now + 7 * 24 * 60 * 60;
    const newRefreshToken = await jwt.sign<JwtPayload, JwtHeader>(
      {
        iat: now,
        exp: refreshTokenExpiration,
        sub: owner.user.id,
        token: access_token,
        token_type: "refresh_token",
        aud,
        iss,
      },
      c.env.REFRESH_TOKEN_SECRET,
    );

    // add cookie to cache
    await c.env.VAULT_BLOCK.put(
      getKVKey(owner.user.id, newRefreshToken),
      "true",
      {
        expiration: refreshTokenExpiration,
      },
    );

    const domain = new URL(c.req.url).host;
    console.log(c.env);
    setCookie(c, refresh_token_cookie, newRefreshToken, {
      path: "/",
      secure: true,
      domain: c.env.NODE_ENV === "development" ? undefined : domain,
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      expires: new Date(refreshTokenExpiration),
      sameSite: "Strict",
    });

    const user = await c.var.db.readUser(owner.user.id);
    let signup = false;
    if (!user) {
      signup = true;
      const result = await c.var.db.createUser({
        id: owner.user.id,
      });
      if (!result.ok) {
        return c.json({ error: result.error.message }, 500);
      }
    }
    return c.json({ token, newSignup: signup });
  })

  .post("/refresh", async (c) => {
    const refreshToken = getCookie(c, refresh_token_cookie);
    if (!refreshToken) {
      return c.redirect("/auth/sign-in");
    }

    const t = jwt.decode<JwtPayload, JwtHeader>(refreshToken);
    if (!t.header || !t.payload || t.payload.token_type != "refresh_token") {
      console.error("missing relavent token attributes:", t);
      throw Unauthorized;
    }

    const isValid = await jwt.verify(refreshToken, c.env.REFRESH_TOKEN_SECRET);
    if (!isValid) {
      console.error("invalid refresh JWT:", refreshToken);
      throw Unauthorized;
    }

    const realToken = await c.env.VAULT_BLOCK.get(
      getKVKey(t.payload.sub, refreshToken),
    );
    if (!realToken) {
      console.error("token doesn't exist...");
      throw Unauthorized;
    }

    const token = await mintJwt(c, t.payload.sub, t.payload.token);
    return c.json({ token });
  })

  .post("/logout", async (c) => {
    const cookie = getCookie(c, refresh_token_cookie);
    if (cookie) {
      deleteCookie(c, refresh_token_cookie);
      await c.env.VAULT_BLOCK.delete(getKVKey(c.var.userId, cookie));
    }
    return new Response(null, { status: 200 });
  });

export const authRouter = auth;

function getKVKey(userId: string, token: string) {
  return `${userId}:${token}`;
}
