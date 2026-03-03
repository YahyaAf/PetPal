import axiosInstance from "../core/api/axiosInstance";

const cityService = {
  getAll: async () => {
    const response = await axiosInstance.get("/cities");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/cities/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/cities", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/cities/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await axiosInstance.delete(`/cities/${id}`);
  },

  count: async () => {
    const response = await axiosInstance.get("/cities/count");
    return response.data.count;
  },
};

export default cityService;
