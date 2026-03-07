import axiosInstance from "../core/api/axiosInstance";

/**
 * Training reservation service.
 *
 * POST /api/training-reservations           → create + Stripe PaymentIntent
 * GET  /api/training-reservations/my-reservations
 * GET  /api/training-reservations           → admin all
 * GET  /api/training-reservations/:id
 * DELETE /api/training-reservations/:id
 */
const trainingReservationService = {
  /** Create a training reservation — returns { reservation, paymentId, stripeClientSecret, ... } */
  create: (payload) =>
    axiosInstance.post("/training-reservations", payload).then((r) => r.data),

  /** Current authenticated client's reservations */
  getMyReservations: () =>
    axiosInstance.get("/training-reservations/my-reservations").then((r) => r.data),

  /** Admin — all reservations */
  getAll: () =>
    axiosInstance.get("/training-reservations").then((r) => r.data),

  /** Single by ID */
  getById: (id) =>
    axiosInstance.get(`/training-reservations/${id}`).then((r) => r.data),

  /** Delete (admin) */
  delete: (id) =>
    axiosInstance.delete(`/training-reservations/${id}`).then((r) => r.data),

  /** Count */
  count: () =>
    axiosInstance.get("/training-reservations/count").then((r) => r.data.count),
};

export default trainingReservationService;
