import axiosInstance from "../core/api/axiosInstance";

const userService = {
  getAll: async () => {
    const response = await axiosInstance.get("/users");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/users", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await axiosInstance.delete(`/users/${id}`);
  },

  count: async () => {
    const response = await axiosInstance.get("/users/count");
    return response.data.count;
  },
};

export default userService;
