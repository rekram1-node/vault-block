import { type Result, ok, error } from "shared/types/result";

export async function api<T>(
  url: string,
  options: RequestInit,
): Promise<Result<T>> {
  // TODO: setup ky for requests?
  try {
    return fetch(url, options).then(async (response) => {
      if (!response.ok) {
        console.error(
          `failed to fetch: status: ${response.status} response: ${await response.text()}`,
        );
        return error(
          new Error(`failed to send request: status: ${response.status}`),
        );
      }
      const jsonData = (await response.json()) as T;
      return ok(jsonData);
    });
  } catch (e) {
    return error(new Error("failed to process request", { cause: e }));
  }
}
