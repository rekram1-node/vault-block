import { type Result, Ok, Err } from "shared/types/result";

export async function req<T>(
  url: string,
  options: RequestInit,
): Promise<Result<T>> {
  try {
    return fetch(url, options).then(async (response) => {
      if (!response.ok) {
        console.error(
          `failed to fetch: status: ${response.status} response: ${await response.text()}`,
        );
        return Err(
          new Error(`failed to send request: status: ${response.status}`),
        );
      }
      const jsonData = (await response.json()) as T;
      return Ok(jsonData);
    });
  } catch (e) {
    return Err(
      new Error(`Failed to process request`, {
        cause: e,
      }),
    );
  }
}
