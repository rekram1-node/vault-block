import { useLocation } from "wouter";
import React, { useEffect } from "react";
import { api } from "~/lib/api/api";
import { useQuery } from "@tanstack/react-query";
import { LinearProgress } from "../LinearProgress";
import { useAuthProvider } from "./AuthProviderv2";

export function Callback() {
  const [, navigate] = useLocation();
  const authProvider = useAuthProvider();

  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");

  const { data, isError } = useQuery({
    queryKey: [],
    queryFn: async () => {
      const res = await api.auth.login.$post({ query: { code } });
      return await res.json();
    },
    enabled: !!code, // Ensures the query only runs if a code is present
  });

  useEffect(() => {
    if (isError) navigate("/auth/sign-in");
  }, [isError]);

  useEffect(() => {
    if (data) {
      authProvider.setSignedIn(data.newSignup);
      navigate("/");
    }
  }, [data]);

  return (
    <div className="min-h-screen">
      <LinearProgress />
    </div>
  );
}
