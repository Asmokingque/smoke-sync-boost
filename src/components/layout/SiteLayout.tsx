import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartButton } from "@/components/cart/FloatingCartButton";
import { FlyingCartLayer } from "@/components/cart/FlyingCartLayer";
import { useCartUI } from "@/store/cartUi";
import { useCart } from "@/hooks/useCart";
import { trackEvent } from "@/lib/analytics";

export function SiteLayout({ children }: { children: ReactNode }) {
  const pulseKey = useCartUI((state) => state.pulseKey);
  const { isOpen: cartOpen, openCart, closeCart, itemCount: cartCount, estimatedSubtotal: cartTotal } = useCart();

  return (
    <div className="luxury-page-bg min-h-screen flex flex-col">
      <Header onCartClick={() => { trackEvent("cart_opened", { source: "header" }); openCart(); }} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={(open) => (open ? openCart() : closeCart())} />
      <FloatingCartButton
        cartCount={cartCount}
        cartTotal={cartTotal}
        pulseKey={pulseKey}
        onClick={() => { trackEvent("cart_opened", { source: "floating_button" }); openCart(); }}
      />
      <FlyingCartLayer />
      <a
        href="/menu"
        className="md:hidden fixed bottom-4 left-4 right-20 z-40 luxury-primary-btn h-12 inline-flex items-center justify-center font-stencil text-xs tracking-widest"
      >
        Order Now
      </a>
    </div>
  );
}
