import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const CART_COOKIE_NAME = "jukskei_cart";
const CART_COOKIE_DAYS = 30;

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length !== 2) return "";

  return parts.pop().split(";").shift() || "";
}

function setCookie(name, value, days) {
  const maxAge = days * 24 * 60 * 60;

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function readCartFromCookie() {
  try {
    const raw = getCookie(CART_COOKIE_NAME);

    if (!raw) return [];

    const parsed = JSON.parse(decodeURIComponent(raw));

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read cart cookie:", error);
    return [];
  }
}

function writeCartToCookie(items) {
  try {
    setCookie(CART_COOKIE_NAME, JSON.stringify(items), CART_COOKIE_DAYS);
  } catch (error) {
    console.error("Could not save cart cookie:", error);
  }
}

function createCartKey(item) {
  return `${item.source}:${item.id}`;
}

function normaliseCartItem(item) {
  return {
    id: String(item.id),
    source: item.source || "menu",
    name: item.name || "Item",
    subtitle: item.subtitle || "",
    details: item.details || "",
    category: item.category || "",
    image: item.image || item.image_url || "/logo.webp",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartFromCookie());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    writeCartToCookie(items);
  }, [items]);

  const addToCart = (item, quantity = 1) => {
    const cleanItem = normaliseCartItem({
      ...item,
      quantity,
    });

    setItems((currentItems) => {
      const key = createCartKey(cleanItem);
      const existingItem = currentItems.find(
        (cartItem) => createCartKey(cartItem) === key,
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          createCartKey(cartItem) === key
            ? {
                ...cartItem,
                quantity: Number(cartItem.quantity || 0) + quantity,
              }
            : cartItem,
        );
      }

      return [...currentItems, cleanItem];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (key) => {
    setItems((currentItems) =>
      currentItems.filter((item) => createCartKey(item) !== key),
    );
  };

  const updateQuantity = (key, nextQuantity) => {
    const quantity = Number(nextQuantity);

    if (quantity <= 0) {
      removeFromCart(key);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        createCartKey(item) === key
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    );
  };

  const increaseQuantity = (key) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        createCartKey(item) === key
          ? {
              ...item,
              quantity: Number(item.quantity || 0) + 1,
            }
          : item,
      ),
    );
  };

  const decreaseQuantity = (key) => {
    setItems((currentItems) =>
      currentItems
        .map((item) =>
          createCartKey(item) === key
            ? {
                ...item,
                quantity: Number(item.quantity || 0) - 1,
              }
            : item,
        )
        .filter((item) => Number(item.quantity || 0) > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
    deleteCookie(CART_COOKIE_NAME);
  };

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [items]);

  const cartTotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0,
    );
  }, [items]);

  const value = {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    checkoutOpen,
    setIsCartOpen,
    setCheckoutOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    createCartKey,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return value;
}
