import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

function FloatingCartButton() {
  const { cartCount, setIsCartOpen } = useCart();

  if (cartCount <= 0) return null;

  return (
    <button
      type="button"
      className="floating-cart-button"
      onClick={() => setIsCartOpen(true)}
      aria-label="Open cart"
    >
      <ShoppingCart size={18} strokeWidth={2.4} />

      <span>{cartCount}</span>
    </button>
  );
}

export default FloatingCartButton;
