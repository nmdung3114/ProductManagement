import { create } from 'zustand';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CART_STORAGE_KEY = 'pm_cart_items';

const loadCartFromStorage = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage write errors
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCartFromStorage(),

  addItem: (product: Product, quantity = 1) => {
    const currentItems = get().items;
    const existingIndex = currentItems.findIndex(i => i.product.id === product.id);

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = [...currentItems];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [...currentItems, { product, quantity }];
    }

    saveCartToStorage(updated);
    set({ items: updated });
  },

  removeItem: (productId: string) => {
    const updated = get().items.filter(i => i.product.id !== productId);
    saveCartToStorage(updated);
    set({ items: updated });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    const updated = get().items.map(i => 
      i.product.id === productId ? { ...i, quantity } : i
    );
    saveCartToStorage(updated);
    set({ items: updated });
  },

  clearCart: () => {
    localStorage.removeItem(CART_STORAGE_KEY);
    set({ items: [] });
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  }
}));
