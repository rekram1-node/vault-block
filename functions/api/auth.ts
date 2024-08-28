import { type MiddlewareHandler } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { type JwtPayload, type JwtHeader } from "shared/types/jwt";
import { api } from "shared/lib/api";
import { type TokenResponse } from "functions/src/types/tokenResponse";
import { factory, type Context } from "functions/api/hono";

const auth_url = "https://api.notion.com/v1/oauth/authorize";
const token_url = "https://api.notion.com/v1/oauth/token";
const refresh_token_cookie = "refresh_token";
const iss = "https://vault-block.com";
const aud = ["https://vault-block.com"];

const app = factory.createApp();

const unauthorized = (c: Context) => c.json({ error: "Unauthorized" }, 401);

export const authMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const headerToken = c.req.header().authorization;
  if (!headerToken?.startsWith("Bearer ")) {
    return unauthorized(c);
  }
  const accessToken = headerToken.slice(7);

  const isValid = await jwt.verify(accessToken, c.env.ACCESS_TOKEN_SECRET);
  if (!isValid) {
    return unauthorized(c);
  }

  const t = jwt.decode<JwtPayload, JwtHeader>(accessToken);
  if (!t.header || !t.payload) {
    return unauthorized(c);
  }

  c.set("jwtHeader", t.header);
  c.set("jwtPayload", t.payload);

  await next();
};

const auth = app
  .get("/url", async (c) => {
    return c.json({
      url: `${auth_url}?${new URLSearchParams({
        client_id: c.env.NOTION_CLIENT_ID,
        redirect_uri: c.env.REDIRECT_URL,
        owner: "owner",
        response_type: "code",
      }).toString()}`,
    });
  })

  .post("/token", async (c) => {
    const refreshToken = getCookie(c, refresh_token_cookie);
    const code = c.req.query("code");
    if (!code && !refreshToken) {
      return unauthorized(c);
    }

    let token: string;
    if (!refreshToken) {
      const encodedCreds = btoa(
        `${c.env.NOTION_CLIENT_ID}:${c.env.NOTION_CLIENT_SECRET}`,
      );
      const result = await api<TokenResponse>(token_url, {
        method: "POST",
        body: JSON.stringify({
          code,
          grant_type: "authorization_code",
          redirect_uri: c.env.REDIRECT_URL,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + encodedCreds,
        },
      });
      if (!result.isOk) {
        return c.json({ error: "failed to fetch token" }, 500);
      }

      const { access_token, owner } = result.data;

      const now = Math.floor(Date.now() / 1000); // Current UTC time in seconds
      token = await jwt.sign<JwtPayload, JwtHeader>(
        {
          iat: now,
          exp: now + 15 * 60,
          tokenType: "access_token",
          sub: owner.user.id,
          token: access_token,
          aud,
          iss,
        },
        c.env.ACCESS_TOKEN_SECRET,
      );

      const refreshTokenExpiration = now + 7 * 24 * 60 * 60;
      const newRefreshToken = await jwt.sign<JwtPayload, JwtHeader>(
        {
          iat: now,
          exp: refreshTokenExpiration,
          sub: owner.user.id,
          token: access_token,
          tokenType: "refresh_token",
          aud,
          iss,
        },
        c.env.REFRESH_TOKEN_SECRET,
      );

      setCookie(c, refresh_token_cookie, newRefreshToken, {
        path: "/",
        secure: true,
        // domain: "example.com",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        expires: new Date(refreshTokenExpiration),
        sameSite: "Strict",
      });
    } else {
      const t = jwt.decode<JwtPayload, JwtHeader>(refreshToken);
      if (!t.header || !t.payload || t.payload.tokenType != "refresh_token") {
        return unauthorized(c);
      }

      const isValid = await jwt.verify(
        refreshToken,
        c.env.REFRESH_TOKEN_SECRET,
      );
      if (!isValid) return unauthorized(c);

      // add a db check later
      //   if (t.payload.sub) << find refresh token based on sub, if it doesn't match... unauthorized
      const now = Math.floor(Date.now() / 1000); // Current UTC time in seconds
      token = await jwt.sign<JwtPayload, JwtHeader>(
        {
          iat: now,
          exp: now + 15 * 60,
          tokenType: "access_token",
          sub: t.payload.sub,
          token: t.payload.token,
          aud,
          iss,
        },
        c.env.ACCESS_TOKEN_SECRET,
      );
    }

    return c.json({ token });
  })

  .post("/logout", authMiddleware, async (c) => {
    deleteCookie(c, refresh_token_cookie);
    return new Response(null, { status: 200 });
  });

export const authRouter = auth;
