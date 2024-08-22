import "~/styles/globals.css";
import "~/styles/prosemirror.css";

import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { App } from "~/App";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <App />
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </ClerkProvider>
  </StrictMode>,
);
