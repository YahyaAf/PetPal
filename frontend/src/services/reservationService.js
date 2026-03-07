import axiosInstance from "../core/api/axiosInstance";

/**
 * Hotel reservation service.
 *
 * POST /api/reservations          → create reservation + Stripe PaymentIntent
 * GET  /api/reservations/my-reservations → current user's reservations
 * GET  /api/reservations/:id      → single reservation
 * PUT  /api/reservations/:id/cancel
 */
const reservationService = {
  /**
   * Create a hotel reservation.
   * Returns: { reservation, paymentId, stripeClientSecret, stripePaymentIntentId, message }
   */
  create: (payload) =>
    axiosInstance.post("/reservations", payload).then((r) => r.data),

  /** Current authenticated user's reservations */
  getMyReservations: () =>
    axiosInstance.get("/reservations/my-reservations").then((r) => r.data),

  /** Single reservation by ID */
  getById: (id) =>
    axiosInstance.get(`/reservations/${id}`).then((r) => r.data),

  /** Cancel a reservation */
  cancel: (id) =>
    axiosInstance.put(`/reservations/${id}/cancel`).then((r) => r.data),
};

export default reservationService;
