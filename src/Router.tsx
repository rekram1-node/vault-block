import { Route, Switch } from "wouter";
import { Home } from "~/pages/Home/Home";
import { Vault } from "~/pages/Vault/Vault";
import { Callback } from "~/components/OauthProvider";
import { Login } from "~/pages/Login/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Page } from "./pages/Example/Page";

export function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth/sign-in" component={Login} />
        <Route path="/auth/callback" component={Callback} />

        <ProtectedRoute path="/">
          <Home />
        </ProtectedRoute>
        <ProtectedRoute path="/vault">
          <Vault />
        </ProtectedRoute>
        <ProtectedRoute path="/page">
          <Page />
        </ProtectedRoute>

        {/* TODO: Make a better 404 */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  );
}
