import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create();

export const apiRouter = t.router({
  hello: t.procedure.input(z.string()).query((opts) => {
    return `hello person ${opts.input}`;
  }),
  goodbye: t.procedure.query(() => {
    return { message: `goodbye stranger` };
  }),
});

export type ApiRouter = typeof apiRouter;
