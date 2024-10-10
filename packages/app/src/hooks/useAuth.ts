import { create } from "zustand";

interface AuthState {
  newSignup: boolean;
  setNewSignup: (_: boolean) => void;
  reset: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  newSignup: false,
  setNewSignup(newSignup) {
    set({ newSignup });
  },

  reset() {
    set({ newSignup: undefined });
  },
}));
