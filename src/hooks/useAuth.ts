import { create } from "zustand";
import { Jwt } from "shared/types/jwt";
import { noAuthApi } from "~/lib/query";

interface AuthState {
  accessToken: Jwt | null;
  setAccessToken: (token: string) => Jwt;
  refreshAccessToken: () => Promise<Jwt | null>;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => {
    const jwt = new Jwt(token);
    set({ accessToken: jwt });
    return jwt;
  },
  refreshAccessToken: async () => {
    const result = await noAuthApi.auth.token.$post();
    if (result.status === 401 || !result.ok) {
      window.location.href = "/auth/sign-in";
      return null;
    }
    const response = await result.json();
    const token = new Jwt(response.token);
    set({ accessToken: token });
    return token;
  },
}));
