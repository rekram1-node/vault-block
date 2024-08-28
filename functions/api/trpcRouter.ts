// import { type Context, type Env as HonoEnv } from "hono";
// import { initTRPC, TRPCError } from "@trpc/server";
// import { z, ZodError } from "zod";
// import { createClient } from "@libsql/client";
// import { Queries } from "functions/src/db/queries";
// import { drizzle } from "drizzle-orm/libsql";
// import * as schema from "functions/src/db/schema";
// import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
// import { type HonoContext, type Env } from "./hono";
// // import { Notion } from "shared/lib/notion";

// const vaultSchema = z.object({
//   id: z.string().cuid2(),
//   name: z.string().min(1).max(280),
//   encryptedContent: z.string(),
//   passwordHash: z.string().length(98),
//   passwordSalt: z.string().length(24),
//   iv: z.string().length(24),
//   documentSalt: z.string().length(24),
// });

// const t = initTRPC.context<HonoContext>().create({
//   errorFormatter({ shape, error }) {
//     return {
//       ...shape,
//       data: {
//         ...shape.data,
//         zodError:
//           error?.cause instanceof ZodError ? error?.cause?.flatten() : null,
//       },
//     };
//   },
// });

// const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
//   // if (!ctx.userId) {
//   //   throw new TRPCError({
//   //     code: "UNAUTHORIZED",
//   //     message: "Missing userId in context...",
//   //   });
//   // }

//   return next({
//     ctx: {
//       userId: ctx.userId,
//       token: ctx.token,
//     },
//   });
// });

// const privateProcedure = t.procedure.use(enforceUserIsAuthed);
// const publicProcedure = t.procedure;

// const vaultRouter = t.router({
//   // addToNotionDocument: privateProcedure
//   //   .input(
//   //     z.object({
//   //       pageId: z.string(),
//   //       vaultId: z.string().cuid2(),
//   //     }),
//   //   )
//   //   .mutation(async ({ ctx, input }) => {
//   //     const { userId } = ctx;
//   //     const notion = await Notion.New(userId);
//   //     if (!notion.isOk) {
//   //       console.error(notion.error);
//   //       throw new TRPCError({
//   //         code: "INTERNAL_SERVER_ERROR",
//   //         message: "failed to get notion connection",
//   //       });
//   //     }
//   //     const result = await notion.data.AppendEmbeddedBlock(
//   //       input.pageId,
//   //       input.vaultId,
//   //     );
//   //     if (!result.isOk) {
//   //       console.error(result.error);
//   //       throw new TRPCError({
//   //         code: "INTERNAL_SERVER_ERROR",
//   //         message: "failed to append to notion",
//   //       });
//   //     }
//   //   }),

//   getAll: privateProcedure.query(async ({ ctx }) => {
//     const { userId } = ctx;
//     return await ctx.queries.readAllVaults(userId);
//   }),

//   getBase: publicProcedure
//     .input(vaultSchema.pick({ id: true }))
//     .query(async ({ ctx, input }) => {
//       const passwordSalt = await ctx.queries.readPasswordSalt(input.id);

//       if (!passwordSalt)
//         throw new TRPCError({
//           code: "NOT_FOUND", // error code is used by frontend
//           message: "document does not exist",
//         });

//       return passwordSalt;
//     }),

//   validatePassword: publicProcedure
//     .input(vaultSchema.pick({ id: true, passwordHash: true }))
//     .mutation(async ({ ctx, input }) => {
//       const document = await ctx.queries.readVault(input.id);

//       if (!document)
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "document does not exist",
//         });

//       if (
//         !document.documentSalt ||
//         !document.encryptedContent ||
//         !document.iv ||
//         !document.serverSidePasswordSalt
//       ) {
//         throw new TRPCError({
//           message: "document has not been initialized",
//           code: "INTERNAL_SERVER_ERROR",
//         });
//       }

//       if (input.passwordHash !== document.passwordHash)
//         throw new TRPCError({
//           code: "UNAUTHORIZED",
//           message: "invalid password",
//         });

//       const { encryptedContent, iv, documentSalt } = document;

//       return {
//         name: document.name,
//         encryptedContent: encryptedContent.toString("base64"),
//         iv,
//         documentSalt,
//       };
//     }),

//   update: publicProcedure
//     .input(vaultSchema.pick({ id: true, encryptedContent: true }))
//     .mutation(async ({ ctx, input }) => {
//       const result = await ctx.queries.updateVault(
//         input.id,
//         Buffer.from(input.encryptedContent, "base64"),
//       );

//       if (result.rowsAffected === 0)
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "document does not exist",
//         });
//     }),

//   // initialize: publicProcedure
//   //   .input(
//   //     vaultSchema.pick({
//   //       id: true,
//   //       encryptedContent: true,
//   //       passwordHash: true,
//   //       passwordSalt: true,
//   //       iv: true,
//   //       documentSalt: true,
//   //     }),
//   //   )
//   //   .mutation(async ({ ctx, input }) => {
//   //     const serverSidePasswordSalt = createSalt();
//   //     const passwordHash = await hashPassword(
//   //       input.passwordHash,
//   //       serverSidePasswordSalt,
//   //     );

//   //     const document = await ctx.queries.activateVault(input.id, {
//   //       encryptedContent: input.encryptedContent,
//   //       passwordHash,
//   //       passwordSalt: input.passwordSalt,
//   //       serverSidePasswordSalt,
//   //       iv: input.iv,
//   //       documentSalt: input.documentSalt,
//   //     });

//   //     if (!document) {
//   //       throw new TRPCError({
//   //         code: "NOT_FOUND",
//   //         message: "document does not exist",
//   //       });
//   //     }

//   //     return {
//   //       name: document.name,
//   //       decryptedContent: "",
//   //       iv: input.iv,
//   //       documentSalt: input.documentSalt,
//   //     };
//   //   }),

//   // delete: privateProcedure
//   //   .input(vaultSchema.pick({ id: true }))
//   //   .mutation(async ({ ctx, input }) => {
//   //     const { userId } = ctx;
//   //     const result = await ctx.queries.deleteVault(userId, input.id);

//   //     if (result.rowsAffected === 0)
//   //       throw new TRPCError({
//   //         code: "NOT_FOUND",
//   //         message: "document does not exist",
//   //       });
//   //   }),

//   // // We could make this more strict
//   // create: privateProcedure
//   //   .input(
//   //     vaultSchema.pick({
//   //       name: true,
//   //       encryptedContent: true,
//   //       passwordHash: true,
//   //       passwordSalt: true,
//   //       iv: true,
//   //       documentSalt: true,
//   //     }),
//   //   )
//   //   .mutation(async ({ ctx, input }) => {
//   //     const { userId, queries } = ctx;

//   //     const numberOfDocuments = await queries.readNumberOfVaults(userId);

//   //     if (numberOfDocuments === ctx.env.MAX_PAGES) {
//   //       throw new TRPCError({
//   //         code: "CONFLICT",
//   //         message: "you have reached the max number of protected pages",
//   //       });
//   //     }

//   //     const serverSidePasswordSalt = createSalt();
//   //     const passwordHash = await hashPassword(
//   //       input.passwordHash,
//   //       serverSidePasswordSalt,
//   //     );

//   //     await queries.createVault({
//   //       userId,
//   //       name: input.name,
//   //       encryptedContent: Buffer.from(input.encryptedContent, "base64"),
//   //       passwordHash,
//   //       passwordSalt: input.passwordSalt,
//   //       serverSidePasswordSalt,
//   //       iv: input.iv,
//   //       documentSalt: input.documentSalt,
//   //       notionPageId: "",
//   //     });
//   //   }),
// });

// export const apiRouter = t.router({
//   vault: vaultRouter,
//   hello: privateProcedure.input(z.string()).query((opts) => {
//     return `hello person ${opts.input}`;
//   }),
//   goodbye: publicProcedure.query(async ({ ctx }) => {
//     console.log(ctx.env.MAX_PAGES);
//     return { message: `goodbye ${ctx.userId}` };
//   }),
// });

// export type ApiRouter = typeof apiRouter;

// export async function createContext(
//   _opts: FetchCreateContextFnOptions,
//   c: Context<HonoEnv>,
// ): Promise<Record<string, unknown>> {
//   const auth = getAuth(c);
//   const userId = auth?.userId;
//   const token = await auth?.getToken();
//   const queries = buildQueries(c.get("env"));

//   return {
//     userId,
//     token,
//     queries,
//   };
// }

// function buildQueries(env: Env): Queries {

// }
