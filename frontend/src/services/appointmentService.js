import axiosInstance from "../core/api/axiosInstance";

const appointmentService = {
  create:            (payload)        => axiosInstance.post("/vet-appointments", payload).then((r) => r.data),
  getAll:            ()               => axiosInstance.get("/vet-appointments").then((r) => r.data),
  count:             ()               => axiosInstance.get("/vet-appointments/count").then((r) => r.data),
  getMyAppointments: ()               => axiosInstance.get("/vet-appointments/my-appointments").then((r) => r.data),
  getById:           (id)             => axiosInstance.get(`/vet-appointments/${id}`).then((r) => r.data),
  updateStatus:      (id, payload)    => axiosInstance.put(`/vet-appointments/${id}/status`, payload).then((r) => r.data),
  delete:            (id)             => axiosInstance.delete(`/vet-appointments/${id}`).then((r) => r.data),
};

export default appointmentService;
