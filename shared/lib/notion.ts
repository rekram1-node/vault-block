// import { type SearchPagesResponse } from "functions/src/types/notionSearchPagesResponse";
// import { ok, error } from "functions/src/types/result";
// import { api } from "shared/lib/api";
// import { Clerk } from "functions/src/clerk/readToken";

// export class Notion {
//   embeddedBaseUrl: string;
//   headers: HeadersInit;
//   baseUrl = "https://api.notion.com/v1";
//   searchUrl = this.baseUrl + "/search";
//   appendToPageUrl = (pageId: string) =>
//     this.baseUrl + `/blocks/${pageId}/children`;

//   constructor(token: string) {
//     this.headers = {
//       Authorization: `Bearer ${token}`,
//       "Notion-Version": process.env.NOTION_API_VERSION ?? "2022-06-28",
//       "Content-Type": "application/json",
//     };
//     this.embeddedBaseUrl =
//       process.env.NOTION_VAULT_URL ?? "https://cipher-scribe-sp2b.vercel.app";
//   }

//   static async New(clerkUserId: string, clerkSecretKey: string) {
//     const clerk = new Clerk(clerkSecretKey);
//     const token = await clerk.readToken(clerkUserId);
//     if (!token.isOk) {
//       return error(new Error("failed to read token", { cause: token.error }));
//     }

//     return ok(new Notion(token.data));
//   }

//   async ReadPages() {
//     try {
//       const url = this.baseUrl + "/search";
//       const response = await api<SearchPagesResponse>(url, {
//         method: "POST",
//         body: `{"filter":{"value":"page","property":"object"},"sort":{"direction":"ascending","timestamp":"last_edited_time"}}`,
//         headers: this.headers,
//       });
//       if (!response.isOk) {
//         return error(
//           new Error("failed to retrieve pages", { cause: response.error }),
//         );
//       }

//       const pages: Page[] = [];
//       for (const document of response.data.results) {
//         if (document.object !== "page") {
//           continue;
//         }

//         const title =
//           document.properties.title?.title[0]?.text.content ??
//           document.properties.title?.title[0]?.plain_text ??
//           `Page - ${document.id}`;

//         pages.push({
//           id: document.id,
//           url: document.url,
//           name: title,
//         });
//       }

//       return ok(pages);
//     } catch (e) {
//       return error(new Error(`failed to read pages`, { cause: e }));
//     }
//   }

//   async AppendEmbeddedBlock(notionPageId: string, encryptedDocumentId: string) {
//     const embeddedUrl =
//       this.embeddedBaseUrl + `/protected/${encryptedDocumentId}`;
//     const body = `{"children":[{"object":"block","type":"embed","embed":{"url":"${embeddedUrl}"}}]}`;
//     const url = this.appendToPageUrl(notionPageId);
//     const response = await api<never>(url, {
//       method: "PATCH",
//       body,
//       headers: this.headers,
//     });
//     if (!response.isOk) {
//       return error(
//         new Error("failed to append to block", { cause: response.error }),
//       );
//     }
//     return ok();
//   }
// }

// export interface Page {
//   id: string;
//   url: string;
//   name: string;
// }
