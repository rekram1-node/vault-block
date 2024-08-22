import type { ApiRouter } from "../../functions/src/router";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";

export const trpc = createTRPCReact<ApiRouter>();

export const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError(error, _variables, _context) {
        console.error(error);
        // notifications.show({
        //   title: 'Something went wrong',
        //   message: error.message,
        //   color: 'red'
        // });
      },
    },
  },
});

export const trpcQueryClient = trpc.createClient({
  /**
   * Links used to determine request flow from client to server.
   *
   * @see https://trpc.io/docs/links
   */
  links: [
    loggerLink({
      enabled: (opts) =>
        process.env.NODE_ENV === "development" ||
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: "/api/trpc",
      fetch(...args) {
        return fetch(...args);
      },
    }),
  ],
});
