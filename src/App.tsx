import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderStatus from "./pages/OrderStatus";
import Reviews from "./pages/Reviews";
import Catering from "./pages/Catering";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCatering from "./pages/admin/AdminCatering";
import AdminContact from "./pages/admin/AdminContact";
import NotFound from "./pages/NotFound";
import Specials from "./pages/Specials";
import HolidayCalendar from "./pages/HolidayCalendar";
import AdminSpecials from "./pages/admin/AdminSpecials";
import AdminSOP from "./pages/admin/AdminSOP";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/specials" element={<Specials />} />
          <Route path="/holiday-calendar" element={<HolidayCalendar />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/order-status" element={<OrderStatus />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/catering" element={<Catering />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOrders />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="specials" element={<AdminSpecials />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="catering" element={<AdminCatering />} />
            <Route path="contact" element={<AdminContact />} />
            <Route path="sop" element={<AdminSOP />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
