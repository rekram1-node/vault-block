import React, { useEffect, useRef, useState } from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "src/hooks/useAuth";

export function ProtectedRoute({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  const [redirect, setRedirect] = useState(false);
  const { accessToken, refreshAccessToken } = useAuth();
  const fetchCalled = useRef(false);

  useEffect(() => {
    if (!accessToken) {
      setRedirect(false);
    }
    if (accessToken) return;
    const fetch = async () => {
      fetchCalled.current = true;
      const token = await refreshAccessToken();
      if (!token) {
        setRedirect(true);
      }
    };
    void fetch();
  }, [accessToken]);

  if (redirect) {
    return <Redirect to="/auth/sign-in" />;
  }

  return <Route path={path}>{children}</Route>;
}
