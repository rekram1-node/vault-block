import React from "react";
import { Redirect, Route } from "wouter";
import { useAuth } from "src/hooks/useAuth";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { accessToken } = useAuth();

  if (!accessToken) {
    return <Redirect to="/auth/sign-in" />;
  }

  return <Route>{children}</Route>;
};
