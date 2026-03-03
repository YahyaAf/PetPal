import axiosInstance from "../core/api/axiosInstance";

const categoryService = {
  getAll: async () => {
    const res = await axiosInstance.get("/categories");
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post("/categories", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/categories/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`);
    return res.data;
  },

  count: async () => {
    const res = await axiosInstance.get("/categories/count");
    return res.data.count;
  },
};

export default categoryService;
