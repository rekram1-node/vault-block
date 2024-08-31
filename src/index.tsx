import "~/styles/globals.css";
import "~/styles/prosemirror.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { App } from "~/App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
