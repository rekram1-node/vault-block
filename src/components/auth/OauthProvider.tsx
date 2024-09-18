import { useLocation } from "wouter";
import React, { useEffect, useState } from "react";
import { api } from "~/lib/api/api";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";
import { LoadingSpinner } from "../Loading";
import { toast } from "sonner";
import {
  useRefreshTokenMutation,
  useRefreshTokenQuery,
} from "~/lib/api/authApi";

export function OauthProvider({
  children,
  excludedRoutes,
}: {
  children: React.ReactNode;
  excludedRoutes: string[];
}) {
  const { accessToken } = useAuth();
  const { mutate, isPending, isError, error } = useRefreshTokenMutation();

  const disableOAuth = excludedRoutes.some((path) =>
    window.location.pathname.includes(path),
  );
  const dontSendRequest = disableOAuth || isPending || isError;

  const [pollingEnabled, setPollingEnabled] = useState(false);
  const { isError: isPollingError, error: pollingError } = useRefreshTokenQuery(
    pollingEnabled && !dontSendRequest,
    4 * 60 * 1000, // refresh every 4 minutes
  );

  useEffect(() => {
    if (dontSendRequest) return;
    if (!accessToken && !isPending) {
      mutate(undefined);
    } else {
      setPollingEnabled(true);
    }
  }, [mutate, accessToken, dontSendRequest]);

  useEffect(() => {
    if (isError) {
      toast.error(`Failed to get access token: ${error.message}`);
    }
    if (isPollingError) {
      toast.error(`Failed to get access token: ${pollingError.message}`);
    }
  }, [isError, error, isPollingError, pollingError]);

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
    if (isPending || accessToken) return;
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
