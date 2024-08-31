import { type AppType } from "functions/api/[[route]]";
import { hc } from "hono/client";
import ky from "ky";
import { useAuth } from "~/hooks/useAuth";

const unauthedApi = hc<AppType>("/", {
  fetch: (input: RequestInfo | URL, requestInit?: RequestInit) => {
    return ky.extend({
      throwHttpErrors: false,
    })(input, {
      method: requestInit?.method,
      headers: {
        "content-type": "application/json",
        ...requestInit?.headers,
      },
      body: requestInit?.body,
    });
  },
});

class RedirectError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RedirectError";
  }
}

const kyapi = ky.extend({
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      async (request) => {
        const { accessToken, refreshAccessToken } = useAuth.getState();
        if (accessToken && request.headers.get("Authorization") === null) {
          let token = accessToken.raw;
          const now = Math.floor(Date.now() / 1000);
          const difference = now - accessToken.body.exp;

          if (difference > 0 || Math.abs(difference) <= 60) {
            const jwt = await refreshAccessToken();
            if (jwt) {
              token = jwt.raw;
            } else {
              throw new RedirectError("Redirecting to sign-in");
            }
          }

          request.headers.set("Authorization", "Bearer " + token);
        }
      },
    ],
  },
});

const client = hc<AppType>("/", {
  fetch: (input: RequestInfo | URL, requestInit?: RequestInit) => {
    return kyapi(input, {
      method: requestInit?.method,
      headers: {
        "content-type": "application/json",
        ...requestInit?.headers,
      },
      body: requestInit?.body,
    });
  },
});

export const api = client.api;
export const noAuthApi = unauthedApi.api;
