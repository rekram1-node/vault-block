import { create } from "zustand";
import { Jwt } from "shared/types/jwt";

interface AuthState {
  accessToken: Jwt | null;
  setAccessToken: (token: string) => Jwt;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => {
    const jwt = new Jwt(token);
    set({ accessToken: jwt });
    return jwt;
  },
}));
