import axiosInstance from "../core/api/axiosInstance";

const productService = {
  getAll: async () => {
    const res = await axiosInstance.get("/products");
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post("/products", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/products/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/products/${id}`);
    return res.data;
  },

  count: async () => {
    const res = await axiosInstance.get("/products/count");
    return res.data.count;
  },
};

export default productService;
