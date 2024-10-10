export type Result<T, E extends Error = Error> = Readonly<
  { ok: true; data: T } | { ok: false; error: E }
>;

export function Ok<T>(data: T): Result<T, never>;
export function Ok(): Result<never, never>;
export function Ok<T>(data?: T): Result<T, never> {
  return { ok: true, data: data as T };
}

export function Err<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}
