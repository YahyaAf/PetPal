import axiosInstance from "../core/api/axiosInstance";

const authService = {
  login: async ({ email, motDePasse }) => {
    const response = await axiosInstance.post("/auth/login", { email, motDePasse });
    return response.data;
  },

  register: async ({ nom, email, motDePasse, phone, address, dateNaissance }) => {
    const response = await axiosInstance.post("/auth/register", {
      nom,
      email,
      motDePasse,
      phone,
      address,
      dateNaissance,
    });
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await axiosInstance.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
  },
};

export default authService;
