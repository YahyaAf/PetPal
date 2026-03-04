import axiosInstance from "../core/api/axiosInstance";

const cartService = {
  getCart: () =>
    axiosInstance.get("/cart").then((r) => r.data),

  addItem: (productId, quantite) =>
    axiosInstance.post("/cart/items", { productId, quantite }).then((r) => r.data),

  updateItem: (cartItemId, quantite) =>
    axiosInstance.put(`/cart/items/${cartItemId}`, { quantite }).then((r) => r.data),

  removeItem: (cartItemId) =>
    axiosInstance.delete(`/cart/items/${cartItemId}`).then((r) => r.data),

  clearCart: () =>
    axiosInstance.delete("/cart").then((r) => r.data),

  validateCart: () =>
    axiosInstance.post("/cart/validate").then((r) => r.data),
};

export default cartService;
