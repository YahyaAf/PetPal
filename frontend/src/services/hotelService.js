import axiosInstance from "../core/api/axiosInstance";

const hotelService = {
  getAll: async () => {
    const res = await axiosInstance.get("/hotels");
    return res.data;
  },

  getById: async (id) => {
    const res = await axiosInstance.get(`/hotels/${id}`);
    return res.data;
  },

  getByCity: async (cityId) => {
    const res = await axiosInstance.get(`/hotels/city/${cityId}`);
    return res.data;
  },

  create: async (payload) => {
    const res = await axiosInstance.post("/hotels", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await axiosInstance.put(`/hotels/${id}`, payload);
    return res.data;
  },

  delete: async (id) => {
    const res = await axiosInstance.delete(`/hotels/${id}`);
    return res.data;
  },

  count: async () => {
    const res = await axiosInstance.get("/hotels/count");
    return res.data.count;
  },
};

export default hotelService;
