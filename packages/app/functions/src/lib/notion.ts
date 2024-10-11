import { type SearchPagesResponse } from "functions/src/types/notionSearchPagesResponse";
import { Ok, Err } from "shared/types/result";
import { type Page } from "shared/types/Page";
import { req } from "shared/lib/req";
import { type Context } from "functions/src/hono/hono";

export class Notion {
  embeddedBaseUrl: string;
  headers: HeadersInit;
  baseUrl = "https://api.notion.com/v1";
  searchUrl = this.baseUrl + "/search";
  appendToPageUrl = (pageId: string) =>
    this.baseUrl + `/blocks/${pageId}/children`;

  constructor(c: Context) {
    const token = c.var.session.notionToken;
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Notion-Version": c.env.NOTION_API_VERSION ?? "2022-06-28",
      "Content-Type": "application/json",
    };
    const url = new URL(c.req.url);
    // Ensure no trailing slash
    this.embeddedBaseUrl = (c.env.VAULT_BLOCK_URL ?? url.origin).replace(
      /\/$/,
      "",
    );
  }

  async ReadPages() {
    try {
      const url = this.baseUrl + "/search";
      const response = await req<SearchPagesResponse>(url, {
        method: "POST",
        body: `{"filter":{"value":"page","property":"object"},"sort":{"direction":"ascending","timestamp":"last_edited_time"}}`,
        headers: this.headers,
      });
      if (!response.ok) {
        return Err(
          new Error("Failed to retrieve pages", { cause: response.error }),
        );
      }

      const pages: Page[] = [];
      for (const document of response.data.results) {
        if (document.object !== "page") {
          continue;
        }

        const title =
          document.properties.title?.title[0]?.text.content ??
          document.properties.title?.title[0]?.plain_text ??
          `Page - ${document.id}`;

        pages.push({
          id: document.id,
          url: document.url,
          name: title,
        });
      }

      return Ok(pages);
    } catch (e) {
      return Err(new Error(`Failed to read pages`, { cause: e }));
    }
  }

  async AppendEmbeddedBlock(notionPageId: string, vaultId: string) {
    const embeddedUrl = this.embeddedBaseUrl + `/vaults/${vaultId}`;
    const body = `{"children":[{"object":"block","type":"embed","embed":{"url":"${embeddedUrl}"}}]}`;
    const url = this.appendToPageUrl(notionPageId);
    const response = await req<never>(url, {
      method: "PATCH",
      body,
      headers: this.headers,
    });
    if (!response.ok) {
      return Err(
        new Error(
          `Failed to append vault [${vaultId}] to block [${notionPageId}]`,
          { cause: response.error },
        ),
      );
    }
    return Ok();
  }
}
