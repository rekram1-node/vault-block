import { useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { api } from "~/lib/api/api";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";
import { LoadingSpinner } from "../Loading";
import { toast } from "sonner";

export const useFetchTokenMutation = (
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
  const [, navigate] = useLocation();
  const { mutate, isPending, isError, error } = useFetchTokenMutation();

  const disableOAuth = excludedRoutes.some((path) =>
    window.location.href.includes(path),
  );
  const dontSendRequest = isPending || isError;

  useEffect(() => {
    if (disableOAuth || dontSendRequest || isPending) return;
    if (!accessToken) {
      mutate(undefined);
    }
  }, [disableOAuth, mutate, accessToken]);

  if (accessToken && !dontSendRequest) {
    console.log("true");
    const now = Math.floor(Date.now() / 1000);
    const exp = accessToken.body.exp;
    const refreshTime = exp - 60; // 1 min b4 expiration
    if (refreshTime <= now) {
      console.log("mutating");
      mutate(undefined);
    }
  }

  if (isError) {
    toast.error(`Failed to get access token: ${error.message}`);
    navigate("/auth/sign-in");
  }

  if (disableOAuth) {
    return <>{children}</>;
  }

  if (accessToken === undefined) {
    console.log("access token:", accessToken);
    console.log("isPending:", isPending);
    console.log("showing spinner...");
  }

  return (
    <>
      {accessToken !== undefined && children}
      {accessToken === undefined && (
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
  const { mutate } = useFetchTokenMutation(called);

  useEffect(() => {
    if (called.current || accessToken) return;
    called.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    mutate({ query: { code: searchParams.get("code") } });
  }, [accessToken, navigate]);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken, navigate]);

  return null;
}
