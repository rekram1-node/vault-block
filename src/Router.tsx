import { Route, Switch } from "wouter";
import { Home } from "~/pages/Home/Home";
import { Vault } from "~/pages/Vault/Vault";
import { Login, Callback } from "~/components/OauthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";

export function Router() {
  return (
    <>
      <Switch>
        <Route path="/auth/sign-in" component={Login} />
        <Route path="/auth/callback" component={Callback} />

        <ProtectedRoute>
          <Route path="/" component={Home} />
          <Route path="/vault" component={Vault} />
        </ProtectedRoute>

        {/* TODO: Make a better 404 */}
        <Route>404: No such page!</Route>
      </Switch>
    </>
  );
}
