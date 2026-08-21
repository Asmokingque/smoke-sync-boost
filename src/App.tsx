import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ContentProvider } from "@/hooks/useEditableContent";
import { AdminAuthProvider } from "@/context/AdminAuthProvider";
import { CartProvider } from "@/contexts/CartContext";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderStatus from "./pages/OrderStatus";
import Reviews from "./pages/Reviews";
import Catering from "./pages/Catering";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/AdminUsers";
import { RequireSuperAdmin } from "./components/admin/RequireSuperAdmin";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminStorage from "./pages/admin/AdminStorage";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCatering from "./pages/admin/AdminCatering";
import AdminContact from "./pages/admin/AdminContact";
import NotFound from "./pages/NotFound";
import Specials from "./pages/Specials";
import HolidayCalendar from "./pages/HolidayCalendar";
import AdminSpecials from "./pages/admin/AdminSpecials";
import AdminLunchSpecials from "./pages/admin/AdminLunchSpecials";
import AdminHolidayCalendar from "./pages/admin/AdminHolidayCalendar";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSOP from "./pages/admin/AdminSOP";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminPayments from "./pages/admin/AdminPayments";
import PaymentConnectorsPage from "./pages/admin/PaymentConnectorsPage";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminServiceArea from "./pages/admin/AdminServiceArea";
import ChangePassword from "./pages/ChangePassword";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ContentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/specials" element={<Specials />} />
              <Route path="/holiday-calendar" element={<HolidayCalendar />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/checkout/cancel" element={<CheckoutCancel />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
              <Route path="/order-status" element={<OrderStatus />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/catering" element={<Catering />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/change-password" element={<AdminAuthProvider><ChangePassword /></AdminAuthProvider>} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/admin/login" element={<AdminAuthProvider><AdminLogin /></AdminAuthProvider>} />
              <Route path="/admin" element={<AdminAuthProvider><AdminLayout /></AdminAuthProvider>}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="storage" element={<AdminStorage />} />
                <Route path="specials" element={<AdminSpecials />} />
                <Route path="lunch-specials" element={<AdminLunchSpecials />} />
                <Route path="holiday-calendar" element={<AdminHolidayCalendar />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="catering" element={<AdminCatering />} />
                <Route path="contact" element={<AdminContact />} />
                <Route path="sop" element={<AdminSOP />} />
                <Route path="homepage" element={<AdminHomepage />} />
                <Route path="service-area" element={<AdminServiceArea />} />
                <Route path="content" element={<RequireSuperAdmin><AdminContent /></RequireSuperAdmin>} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="payments" element={<RequireSuperAdmin><AdminPayments /></RequireSuperAdmin>} />
                <Route path="payment-connectors" element={<RequireSuperAdmin><PaymentConnectorsPage /></RequireSuperAdmin>} />
                <Route path="users" element={<RequireSuperAdmin><AdminUsers /></RequireSuperAdmin>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ContentProvider>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
