import { create } from "zustand";
import { Jwt } from "shared/types/jwt";
import { api } from "~/lib/api/api";

interface AuthState {
  newSignup: boolean;
  setNewSignup: (_: boolean) => void;
  accessToken: Jwt | undefined;
  setAccessToken: (token: string) => Jwt;
  refreshAccessToken: () => Promise<Jwt | undefined>;
  reset: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  newSignup: false,
  setNewSignup(newSignup) {
    set({ newSignup });
  },
  accessToken: undefined,
  setAccessToken: (token) => {
    const jwt = new Jwt(token);
    set({ accessToken: jwt });
    return jwt;
  },
  refreshAccessToken: async () => {
    const result = await api.auth.token.$post();
    if (result.status === 401 || !result.ok) {
      window.location.href = "/auth/sign-in";
      return undefined;
    }
    const response = await result.json();
    const token = new Jwt(response.token);
    set({ accessToken: token });
    return token;
  },
  reset() {
    set({ accessToken: undefined });
  },
}));

// import create from "zustand"
// import { persist } from "zustand/middleware"

// const defaultState = {
//   foo: "bar"
// }

// export const useStore = create(persist(
//   (set) => ({
//     ...defaultState,
//     reset: () => {
//       useStore.persist.clearStorage();
//       set(defaultState);
//     }
//   }),
//   {
//     ...
//   }
// ))

// // then somewhere in your app
// const myStore = useStore()

// useEffect(() => {
//   const intervalId = setInterval(() => {
//     myStore.reset()
//   }, 1000 * 60 * 5);

//   return () => {
//     clearInterval(intervalId)
//   }
// }, [])
