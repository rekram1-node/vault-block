import { QueryClient } from "@tanstack/react-query";
import { type AppType } from "functions/api/[[route]]";
import { hc } from "hono/client";
import { isErrorResponse } from "shared/types/ErrorResponse";
import { authStore } from "~/components/auth/AuthProviderv2";

const unauthedApi = hc<AppType>("/", {
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const headers = {
      "content-type": "application/json",
      ...requestInit?.headers,
    };

    const response = await fetch(input, {
      credentials: "include",
      method: requestInit?.method,
      headers,
      body: requestInit?.body,
    });

    if (response.redirected) {
      window.location.href = response.url;
      return new Response(null);
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

class HttpError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const authedApiClient = hc<AppType>("/", {
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const fetchWithAuth = async () => {
      const headers = {
        "content-type": "application/json",
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

    const response = await fetchWithAuth();

    if (response.status === 401) {
      window.location.assign("/auth/sign-in");
      authStore.getState().setLoggedOut();
      return response;
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

export const authedApi = authedApiClient.api;
export const publicApi = unauthedApi.api;

const http_status_no_retry = [400, 401, 403, 404, 302];

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
