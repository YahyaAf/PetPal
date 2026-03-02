import { create } from "zustand";
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from "../core/utils/constants";

const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || null,
  user: JSON.parse(localStorage.getItem(USER_KEY)) || null,

  setAuth: (authResponse) => {
    const user = {
      id: authResponse.userId,
      email: authResponse.email,
      nom: authResponse.nom,
      role: authResponse.role,
    };
    localStorage.setItem(TOKEN_KEY, authResponse.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ token: authResponse.accessToken, refreshToken: authResponse.refreshToken, user });
  },

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, refreshToken: null, user: null });
  },
}));

export default useAuthStore;
