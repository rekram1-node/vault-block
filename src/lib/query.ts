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

const kyapi = ky.extend({
  throwHttpErrors: false,
  hooks: {
    beforeRequest: [
      (request) => {
        const { accessToken } = useAuth.getState();
        if (accessToken && request.headers.get("Authorization") === null) {
          request.headers.set("Authorization", "Bearer " + accessToken.raw);
        }
      },
    ],
    afterResponse: [
      async (_, __, response: Response) => {
        const { setAccessToken } = useAuth.getState();
        if (response.status !== 401) return response;

        const result = await unauthedApi.api.auth.token.$post();
        if (result.status !== 401 && result.ok) {
          const response = await result.json();
          setAccessToken(response.token);
        } else {
          window.location.href = "/auth/sign-in";
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
