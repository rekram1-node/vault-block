import { Route, Switch } from "wouter";
import { Home } from "~/pages/Home/Home";

export function Router() {
  return (
    <Switch>
      <Route path="/">
        <Home />
      </Route>
    </Switch>
  );
}
