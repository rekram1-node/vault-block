import { QueryClient } from "@tanstack/react-query";
import { type AppType } from "functions/api/[[route]]";
import { hc } from "hono/client";
import { isErrorResponse } from "shared/types/ErrorResponse";
import { useAuth } from "~/hooks/useAuth";

const unauthedApi = hc<AppType>("/", {
  fetch: (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const headers = {
      "content-type": "application/json",
      ...requestInit?.headers,
    };

    return fetch(input, {
      credentials: "include",
      method: requestInit?.method,
      headers,
      body: requestInit?.body,
    });
  },
});

class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const oauthClient = hc<AppType>("/", {
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const { accessToken, setAccessToken } = useAuth.getState();

    const fetchWithAuth = async (token: string | undefined) => {
      const headers = {
        "content-type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...requestInit?.headers,
      };

      const response = await fetch(input, {
        credentials: "include",
        method: requestInit?.method,
        headers,
        body: requestInit?.body,
      });

      return response;
    };

    let response = await fetchWithAuth(accessToken?.raw);

    // If 401, try refreshing the token
    if (response.status === 401) {
      console.log("refresh on interceptor");
      const res = await api.auth.refresh.$post();
      if (res.ok) {
        const { token } = await res.json();
        setAccessToken(token);
        // retry request
        response = await fetchWithAuth(token);
      }
    }

    if (!response.ok) {
      const err = await response.json();
      if (isErrorResponse(err)) {
        throw new HttpError(err.error, response.status);
      } else {
        throw new HttpError(
          `HTTP error! status: ${response.status}`,
          response.status,
        );
      }
    }

    return response;
  },
});

export const oauthApi = oauthClient.api;
export const api = unauthedApi.api;

const http_status_no_retry = [400, 403, 404, 302];

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // TODO: evaluate what defaults we want
      // refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof HttpError) {
          if (http_status_no_retry.includes(error.statusCode)) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (retryCount) => (retryCount === 0 ? 200 : 300),
    },
  },
});

export const keys = {
  notion: ["notion"],
  vaults: ["vaults"],
  password: ["password"],
};
