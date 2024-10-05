export type ErrorResponse = { error: string };

export const isErrorResponse = (data: unknown): data is ErrorResponse => {
  return (data as ErrorResponse).error !== undefined;
};
