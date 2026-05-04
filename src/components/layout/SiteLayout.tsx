import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FloatingCartButton } from "@/components/retina/FloatingCartButton";
import { FlyingCartLayer } from "@/components/cart/FlyingCartLayer";
import { useCartUI } from "@/store/cartUi";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export function SiteLayout({ children }: { children: ReactNode }) {
  const cartOpen = useCartUI((s) => s.drawerOpen);
  const setCartOpen = useCartUI((s) => s.setDrawerOpen);
  return (
    <div className="luxury-page-bg min-h-screen flex flex-col">
      <PaymentTestModeBanner />
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <FloatingCartButton onClick={() => setCartOpen(true)} />
      <FlyingCartLayer />
      {/* Mobile sticky Order Now CTA */}
      <a
        href="/menu"
        className="md:hidden fixed bottom-4 left-4 right-20 z-40 luxury-primary-btn h-12 inline-flex items-center justify-center font-stencil text-xs tracking-widest"
      >
        Order Now
      </a>
    </div>
  );
}
