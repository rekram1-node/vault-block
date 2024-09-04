import { Route, Switch } from "wouter";

import { Home } from "~/pages/Home/Home";
import { Callback } from "~/components/auth/OauthProvider";
import { Login } from "~/pages/Login/Login";
import { VaultPage } from "~/pages/Vault/VaultPage";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth/sign-in" component={Login} />
        <Route path="/auth/callback" component={Callback} />

        <ProtectedRoute path="/">
          <Home />
        </ProtectedRoute>
        {/* <ProtectedRoute path="/vault">
          <Vault />
        </ProtectedRoute>
        <ProtectedRoute path="/page">
          <Page />
        </ProtectedRoute> */}
        <Route path="/vaults/:id">
          <VaultPage />
        </Route>

        {/* TODO: Make a better 404 */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  );
}
