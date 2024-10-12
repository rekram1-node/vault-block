import React from "react";
import { create } from "zustand";

interface AuthProviderValue {
  signedIn: boolean;
  newSignup: boolean;

  setSignedIn(_newSignup?: boolean): void;
  setNewSignup(newSignup: boolean): void;
  setLoggedOut(): void;
}

const Context = React.createContext<AuthProviderValue | null>(null);

const authStore = create<AuthProviderValue>((set) => ({
  signedIn: false,
  newSignup: false,
  setSignedIn(newSignup) {
    set({
      signedIn: true,
      newSignup,
    });
  },
  setNewSignup(newSignup) {
    set({ newSignup });
  },
  setLoggedOut() {
    set({
      signedIn: false,
      newSignup: false,
    });
  },
}));

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const store = authStore();

  return <Context.Provider value={store}>{children}</Context.Provider>;
};

const useAuthProvider = (): AuthProviderValue => {
  const ctx = React.useContext(Context);

  if (!ctx) throw Error("Lack of provider");

  return ctx;
};

export { AuthProvider, useAuthProvider, authStore };
