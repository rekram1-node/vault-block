import { useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { noAuthApi } from "~/lib/query";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";

const useFetchTokenMutation = (
  hasFiredRef?: React.MutableRefObject<boolean>,
) => {
  const { setAccessToken } = useAuth();
  const [, navigate] = useLocation();

  const mutation = useMutation({
    mutationFn: async (args?: object) => {
      const res = await noAuthApi.auth.token.$post(args ?? {});
      if (!res.ok) {
        const errorData = (await res.json()) as ErrorResponse;
        throw new Error(errorData.error);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setAccessToken(data.token);
      if (hasFiredRef) hasFiredRef.current = false;
    },
    onError: () => {
      navigate("/auth/sign-in");
      if (hasFiredRef) hasFiredRef.current = false;
    },
  });

  return mutation;
};

export function OauthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken } = useAuth();
  const hasFiredMutationRef = useRef(false);
  const mutation = useFetchTokenMutation(hasFiredMutationRef);

  const disableOAuth =
    window.location.href.includes("/auth/sign-in") ||
    window.location.href.includes("/auth/callback") ||
    window.location.href.includes("/vaults/");

  useEffect(() => {
    if (disableOAuth || hasFiredMutationRef.current) return;
    mutation.mutate(undefined);
    hasFiredMutationRef.current = true;
  }, []);

  if (disableOAuth) {
    return <>{children}</>;
  }

  return (
    <>
      {accessToken != null && children}
      {accessToken == null && (
        <div>
          {/* TODO: better loading screen */}
          <button onClick={() => console.log(accessToken, mutation.isPending)}>
            Loading...
          </button>
        </div>
      )}
    </>
  );
}

export function Callback() {
  const called = useRef(false);
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const mutation = useFetchTokenMutation(called);

  useEffect(() => {
    if (called.current || accessToken) return;
    called.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    mutation.mutate({ query: { code: searchParams.get("code") } });
  }, [accessToken, navigate]);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken, navigate]);

  return null;
}
