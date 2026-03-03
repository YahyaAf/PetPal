import axiosInstance from "../core/api/axiosInstance";

const clientService = {
  getAll: async () => {
    const response = await axiosInstance.get("/clients");
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/clients/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post("/clients", data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await axiosInstance.delete(`/clients/${id}`);
  },

  count: async () => {
    const response = await axiosInstance.get("/clients/count");
    return response.data.count;
  },
};

export default clientService;
