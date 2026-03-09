import axiosInstance from "../core/api/axiosInstance";

const paymentService = {
  /** Tous les paiements */
  getAll: () =>
    axiosInstance.get("/payments").then((r) => r.data),

  /** Paiements filtrés par type de réservation (HOTEL | TRAINING | ORDER) */
  getByType: (type) =>
    axiosInstance.get(`/payments?reservationType=${type}`).then((r) => r.data),

  /** Nombre total de paiements */
  count: () =>
    axiosInstance.get("/payments/count").then((r) => r.data?.count ?? 0),

  /** Nombre de paiements par type */
  countByType: (type) =>
    axiosInstance
      .get(`/payments/count?reservationType=${type}`)
      .then((r) => r.data?.count ?? 0),
};

export default paymentService;
