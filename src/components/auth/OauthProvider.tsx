import { useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { api } from "~/lib/api/query";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";
import { LoadingSpinner } from "../Loading";

const useFetchTokenMutation = (
  hasFiredRef?: React.MutableRefObject<boolean>,
) => {
  const { setAccessToken, setNewSignup } = useAuth();
  const [, navigate] = useLocation();

  const mutation = useMutation({
    mutationFn: async (args?: object) => {
      const res = await api.auth.token.$post(args ?? {});
      if (!res.ok) {
        const errorData = (await res.json()) as ErrorResponse;
        throw new Error(errorData.error);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setNewSignup(data.newSignup);
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

export function OauthProvider({
  children,
  excludedRoutes,
}: {
  children: React.ReactNode;
  excludedRoutes: string[];
}) {
  const { accessToken } = useAuth();
  const hasFiredMutationRef = useRef(false);
  const mutation = useFetchTokenMutation(hasFiredMutationRef);

  const disableOAuth = excludedRoutes.some((path) =>
    window.location.href.includes(path),
  );

  useEffect(() => {
    if (disableOAuth || hasFiredMutationRef.current) return;
    mutation.mutate(undefined);
    hasFiredMutationRef.current = true;
  }, []);

  // useEffect(() => {

  // }, [])

  if (disableOAuth) {
    return <>{children}</>;
  }

  return (
    <>
      {accessToken != null && children}
      {accessToken == null && (
        <div className="flex min-h-screen items-center justify-center">
          {/* TODO: better loading screen */}
          <LoadingSpinner size={100} />
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
