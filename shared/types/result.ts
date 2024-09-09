export type Result<T, E extends Error = Error> = Readonly<
  { isOk: true; data: T } | { isOk: false; error: E }
>;

export function ok<T>(data: T): Result<T, never>;
export function ok(): Result<never, never>;
export function ok<T>(data?: T): Result<T, never> {
  return { isOk: true, data: data as T };
}

export function error<E extends Error>(error: E): Result<never, E> {
  return { isOk: false, error };
}
