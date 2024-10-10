import React from "react";
import { Route, Switch, Redirect } from "wouter";

import { Home } from "~/pages/Home/Home";
import { Callback } from "~/components/auth/Callback";
import { Login } from "~/pages/Login/Login";
import { VaultPage } from "~/pages/Vault/VaultPage";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth/sign-in" component={Login} />
        <Route path="/auth/callback" component={Callback} />

        <Route path="/">
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        </Route>

        <Route path="/vaults/:id">
          <VaultPage />
        </Route>

        <Route path="/404" component={NotFound} />

        {/* TODO: Make a better 404 */}
        <Route path="*">
          <Redirect to="/404" />
        </Route>
      </Switch>
    </>
  );
}
