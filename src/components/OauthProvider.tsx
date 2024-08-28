import { useLocation } from "wouter";
import React, { useEffect, useRef } from "react";
import { noAuthApi } from "~/lib/query";
import { useAuth } from "~/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { type ErrorResponse } from "shared/types/ErrorResponse";
import { toast } from "sonner";

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
        toast.error(errorData.error);
        throw new Error(errorData.error);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      const token = setAccessToken(data.token);
      if (hasFiredRef) hasFiredRef.current = false;

      if (token.body?.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = token.body.exp - currentTime;
        const refreshTime = timeUntilExpiration - 60; // 1 minute before expiration

        if (refreshTime > 0) {
          setTimeout(() => {
            mutation.mutate(undefined);
          }, refreshTime * 1000);
        }
      }
    },
    onError: () => {
      navigate("/auth/sign-in");
      if (hasFiredRef) hasFiredRef.current = false;
    },
  });

  return mutation;
};

export const OauthProvider = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuth();
  const hasFiredMutationRef = useRef(false);
  const mutation = useFetchTokenMutation(hasFiredMutationRef);

  const pageIsAuthing =
    window.location.href.includes("/auth/sign-in") ||
    window.location.href.includes("/auth/callback");

  useEffect(() => {
    if (pageIsAuthing || hasFiredMutationRef.current) return;
    mutation.mutate(undefined);
    hasFiredMutationRef.current = true;
  }, []);

  if (pageIsAuthing) {
    return <>{children}</>;
  }
  return <>{accessToken && !mutation.isPending && children}</>;
};

export const Login = () => {
  const handleLogin = async () => {
    const result = await noAuthApi.auth.url.$get();

    if (result.ok) {
      window.location.assign((await result.json()).url);
    } else {
      toast.error("failed to login, contact support");
    }
  };

  return (
    <>
      <h3>Login to Dashboard</h3>
      <button className="btn" onClick={handleLogin}>
        Login
      </button>
    </>
  );
};

export const Callback = () => {
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
};
