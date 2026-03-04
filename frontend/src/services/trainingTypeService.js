import axiosInstance from "../core/api/axiosInstance";

const trainingTypeService = {
  getAll: async () => {
    const res = await axiosInstance.get("/training-types");
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/training-types/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post("/training-types", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/training-types/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/training-types/${id}`);
    return res.data;
  },

  count: async () => {
    const res = await axiosInstance.get("/training-types/count");
    return res.data.count;
  },
};

export default trainingTypeService;
