"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

export type CartState = {
  storeId: number | null;
  storeName?: string;
  items: CartItem[];
};

type CartContextValue = {
  cart: CartState;
  addItem: (
    storeId: number,
    storeName: string,
    item: Omit<CartItem, "quantity">,
    quantity: number
  ) => void;
  setItemQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    storeId: null,
    storeName: undefined,
    items: [],
  });

  const addItem = (
    storeId: number,
    storeName: string,
    item: Omit<CartItem, "quantity">,
    quantity: number
  ) => {
    setCart((prev) => {
      // enforce single-store cart
      if (prev.storeId && prev.storeId !== storeId) {
        const ok = window.confirm(
          "السلة تحتوي على منتجات من متجر آخر.\nهل تريد مسح السلة الحالية والبدء من هذا المتجر؟"
        );
        if (!ok) {
          return prev;
        }
        // clear and start new store
        return {
          storeId,
          storeName,
          items: [
            {
              ...item,
              quantity: quantity,
            },
          ],
        };
      }

      const existing = prev.items.find((i) => i.productId === item.productId);
      if (existing) {
        return {
          ...prev,
          storeId: storeId,
          storeName,
          items: prev.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        };
      } else {
        return {
          ...prev,
          storeId: storeId,
          storeName,
          items: [
            ...prev.items,
            {
              ...item,
              quantity,
            },
          ],
        };
      }
    });
  };

  const setItemQuantity = (productId: number, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return {
          ...prev,
          items: prev.items.filter((i) => i.productId !== productId),
        };
      }
      return {
        ...prev,
        items: prev.items.map((i) =>
          i.productId === productId ? { ...i, quantity } : i
        ),
      };
    });
  };

  const removeItem = (productId: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.productId !== productId),
    }));
  };

  const clearCart = () => {
    setCart({
      storeId: null,
      storeName: undefined,
      items: [],
    });
  };

  const value = useMemo(
    () => ({
      cart,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
    }),
    [cart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
