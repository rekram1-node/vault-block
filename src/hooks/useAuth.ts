import { create } from "zustand";
import { Jwt } from "shared/types/jwt";
import { noAuthApi } from "~/lib/query";

interface AuthState {
  accessToken: Jwt | undefined;
  setAccessToken: (token: string) => Jwt;
  refreshAccessToken: () => Promise<Jwt | undefined>;
}

export const useAuth = create<AuthState>((set) => ({
  accessToken: undefined,
  setAccessToken: (token) => {
    const jwt = new Jwt(token);
    set({ accessToken: jwt });
    return jwt;
  },
  refreshAccessToken: async () => {
    const result = await noAuthApi.auth.token.$post();
    if (result.status === 401 || !result.ok) {
      window.location.href = "/auth/sign-in";
      return undefined;
    }
    const response = await result.json();
    const token = new Jwt(response.token);
    set({ accessToken: token });
    return token;
  },
}));
