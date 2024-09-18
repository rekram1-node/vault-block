import { useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { api } from "~/lib/api/api";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";
import { LoadingSpinner } from "../Loading";
import { toast } from "sonner";
import { useRefreshTokenMutation } from "~/lib/api/authApi";

export function OauthProvider({
  children,
  excludedRoutes,
}: {
  children: React.ReactNode;
  excludedRoutes: string[];
}) {
  const { accessToken } = useAuth();
  const hasSentRefreshRequest = useRef(false);
  const { mutate, isPending, isError, error } = useRefreshTokenMutation(() => hasSentRefreshRequest.current = false);

  const disableOAuth = excludedRoutes.some((path) =>
    window.location.pathname.includes(path),
  );
  const dontSendRequest = disableOAuth || isPending || isError;

  useEffect(() => {
    if (dontSendRequest || hasSentRefreshRequest.current) return;
    if (!accessToken) {
      mutate(undefined);
      hasSentRefreshRequest.current = true;
    }
  }, [mutate, accessToken, dontSendRequest]);

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to get access token: ${error.message}`);
    }
  }, [isError, error]);

  if (disableOAuth) {
    return <>{children}</>;
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
  const { accessToken } = useAuth();
  const [, navigate] = useLocation();
  const { setAccessToken, setNewSignup } = useAuth();

  const hasMutated = useRef(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (args?: object) => {
      const res = await api.auth["sign-in"].$post(args ?? {});
      if (!res.ok) {
        const errorData = (await res.json()) as ErrorResponse;
        throw new Error(errorData.error);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      setNewSignup(data.newSignup);
      setAccessToken(data.token);
    },
    onError: () => {
      navigate("/auth/sign-in");
    },
  });

  useEffect(() => {
    if (hasMutated.current || isPending || accessToken) return;

    const searchParams = new URLSearchParams(window.location.search);
    mutate({ query: { code: searchParams.get("code") } });
    hasMutated.current = true;
  }, [accessToken, navigate, isPending]);

  useEffect(() => {
    if (accessToken) {
      navigate("/");
    }
  }, [accessToken, navigate]);

  return null;
}
