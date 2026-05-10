import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../../context/CartContext";
import {
  buildOrderPayload,
  openWhatsAppOrder,
  sendOrderToGoogleSheet,
} from "../../services/orderService";
import "./Cart.css";

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
};

function CartDrawer() {
  const {
    items,
    cartCount,
    cartTotal,
    isCartOpen,
    checkoutOpen,
    setIsCartOpen,
    setCheckoutOpen,
    clearCart,
    createCartKey,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

  const [customer, setCustomer] = useState(emptyCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const closeDrawer = () => {
    setIsCartOpen(false);
    setCheckoutOpen(false);
    setError("");
    setMessage("");
  };

  const validateCheckout = () => {
    if (!customer.name.trim()) return "Please enter your name.";
    if (!customer.phone.trim()) return "Please enter your phone number.";
    if (!customer.email.trim()) return "Please enter your email address.";
    if (!/^\S+@\S+\.\S+$/.test(customer.email.trim())) {
      return "Please enter a valid email address.";
    }
    if (items.length === 0) return "Your cart is empty.";

    return "";
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    const validationError = validateCheckout();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const orderPayload = buildOrderPayload({
        customer,
        items,
        total: cartTotal,
      });

      await sendOrderToGoogleSheet(orderPayload);
      openWhatsAppOrder(orderPayload);

      setMessage(
        "Order prepared. WhatsApp has opened with your order details. Please tap Send in WhatsApp to complete the order.",
      );

      clearCart();
      setCustomer(emptyCustomer);
      setCheckoutOpen(false);
    } catch (err) {
      setError(err.message || "Could not complete checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={closeDrawer}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-header">
          <div>
            <p className="cart-kicker">Current order</p>
            <h2>Cart</h2>
          </div>

          <button
            type="button"
            className="cart-icon-button"
            onClick={closeDrawer}
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </header>

        {message && <p className="cart-success">{message}</p>}
        {error && <p className="cart-error">{error}</p>}

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={34} />
            <h3>Your cart is empty</h3>
            <p>Tap a menu or shop item to add it to your cart.</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => {
                const key = createCartKey(item);
                const lineTotal =
                  Number(item.price || 0) * Number(item.quantity || 0);

                return (
                  <article className="cart-item" key={key}>
                    <img
                      src={item.image || "/logo.webp"}
                      alt={item.name}
                      onError={(event) => {
                        event.currentTarget.src = "/logo.webp";
                      }}
                    />

                    <div className="cart-item-main">
                      <p className="cart-item-name">{item.name}</p>

                      <p className="cart-item-meta">
                        {item.source === "menu" ? "Menu" : "Shop"} · N$
                        {Number(item.price || 0).toFixed(2)}
                      </p>

                      <div className="cart-qty-row">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(key)}
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus size={14} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(key)}
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-side">
                      <strong>N${lineTotal.toFixed(2)}</strong>

                      <button
                        type="button"
                        className="cart-remove-button"
                        onClick={() => removeFromCart(key)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="cart-footer">
              <div className="cart-total-row">
                <span>{cartCount} item(s)</span>
                <strong>N${cartTotal.toFixed(2)}</strong>
              </div>

              {!checkoutOpen ? (
                <div className="cart-actions">
                  <button
                    type="button"
                    className="cart-secondary-button"
                    onClick={clearCart}
                  >
                    Clear cart
                  </button>

                  <button
                    type="button"
                    className="cart-primary-button"
                    onClick={() => setCheckoutOpen(true)}
                  >
                    Checkout
                  </button>
                </div>
              ) : (
                <form className="checkout-form" onSubmit={handleCheckout}>
                  <label>
                    <span>Full name</span>
                    <input
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer("name", event.target.value)
                      }
                      placeholder="Enter your full name"
                    />
                  </label>

                  <label>
                    <span>Phone number</span>
                    <input
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer("phone", event.target.value)
                      }
                      placeholder="081 234 5678"
                    />
                  </label>

                  <label>
                    <span>Email address</span>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(event) =>
                        updateCustomer("email", event.target.value)
                      }
                      placeholder="you@example.com"
                    />
                  </label>

                  <div className="cart-actions">
                    <button
                      type="button"
                      className="cart-secondary-button"
                      onClick={() => setCheckoutOpen(false)}
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="cart-primary-button"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Send order"}
                    </button>
                  </div>
                </form>
              )}
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
