import axiosInstance from "../core/api/axiosInstance";

const orderService = {
  /**
   * Créer une commande + PaymentIntent Stripe en une seule requête.
   * Retourne : { idOrder, total, stripeClientSecret, paymentId, paymentStatus, orderStatus }
   */
  createOrder: (orderRequest) =>
    axiosInstance.post("/orders", orderRequest).then((r) => r.data),

  /** Toutes les commandes — usage admin */
  getAll: () =>
    axiosInstance.get("/orders").then((r) => r.data),

  /** Commandes d'un utilisateur */
  getMyOrders: (userId) =>
    axiosInstance.get(`/orders/user/${userId}`).then((r) => r.data),

  /** Détail d'une commande */
  getById: (id) =>
    axiosInstance.get(`/orders/${id}`).then((r) => r.data),

  /** Annuler une commande (PENDING uniquement) */
  cancelOrder: (id) =>
    axiosInstance.patch(`/orders/${id}/cancel`).then((r) => r.data),

  /** Nombre total de commandes */
  count: () =>
    axiosInstance.get("/orders/count").then((r) => r.data.count),
};

// ─────────────────────────────────────────────
//  Helpers paiement — appelés depuis CheckoutPage
// ─────────────────────────────────────────────
export const paymentApi = {
  /**
   * Confirmer le paiement côté backend après que Stripe l'a accepté.
   * Déclenche : payment → SUCCES, order → PAYEE, stock décrémenté.
   */
  confirm: (paymentId, stripePaymentIntentId) =>
    axiosInstance
      .post(`/payments/${paymentId}/confirm`, { stripePaymentIntentId })
      .then((r) => r.data),

  /**
   * Marquer le paiement comme échoué (refus carte, fermeture, etc.).
   * Déclenche : payment → ECHEC, order → ANNULEE.
   */
  cancel: (paymentId) =>
    axiosInstance.post(`/payments/${paymentId}/cancel`).then((r) => r.data),

  /** Récupérer un paiement par son ID */
  getById: (paymentId) =>
    axiosInstance.get(`/payments/${paymentId}`).then((r) => r.data),

  /** Récupérer le paiement lié à une commande */
  getByOrderId: (orderId) =>
    axiosInstance.get(`/payments/order/${orderId}`).then((r) => r.data),
};

export default orderService;
