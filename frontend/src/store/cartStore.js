import { create } from "zustand";
import cartService from "../services/cartService";

const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  // ─────────────────────────────────────────────
  //  Getters dérivés
  // ─────────────────────────────────────────────
  get totalItems() {
    return get().cart?.nombreArticles ?? 0;
  },

  // ─────────────────────────────────────────────
  //  Charger le panier en cours
  // ─────────────────────────────────────────────
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.getCart();
      set({ cart, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message ?? "Erreur lors du chargement du panier.",
      });
    }
  },

  // ─────────────────────────────────────────────
  //  Ajouter un produit
  // ─────────────────────────────────────────────
  addItem: async (productId, quantite) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.addItem(productId, quantite);
      set({ cart, loading: false });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Impossible d'ajouter ce produit au panier.";
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  // ─────────────────────────────────────────────
  //  Modifier la quantité d'un article
  // ─────────────────────────────────────────────
  updateItem: async (cartItemId, quantite) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.updateItem(cartItemId, quantite);
      set({ cart, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message ?? "Erreur lors de la mise à jour.",
      });
    }
  },

  // ─────────────────────────────────────────────
  //  Supprimer un article
  // ─────────────────────────────────────────────
  removeItem: async (cartItemId) => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.removeItem(cartItemId);
      set({ cart, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message ?? "Erreur lors de la suppression.",
      });
    }
  },

  // ─────────────────────────────────────────────
  //  Vider le panier
  // ─────────────────────────────────────────────
  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.clearCart();
      set({ cart, loading: false });
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message ?? "Erreur lors du vidage du panier.",
      });
    }
  },

  // ─────────────────────────────────────────────
  //  Valider le panier
  // ─────────────────────────────────────────────
  validateCart: async () => {
    set({ loading: true, error: null });
    try {
      const cart = await cartService.validateCart();
      set({ cart, loading: false });
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.message ?? "Erreur lors de la validation du panier.";
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useCartStore;
