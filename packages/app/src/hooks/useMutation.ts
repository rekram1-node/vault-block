import { type InferRequestType, type InferResponseType } from "hono/client";
import { useMutation as useReactMutation } from "@tanstack/react-query";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMutation<T extends (...args: any[]) => Promise<any>>(
  _apiMethod: T,
) {
  return useReactMutation<InferResponseType<T>, Error, InferRequestType<T>>;
}
