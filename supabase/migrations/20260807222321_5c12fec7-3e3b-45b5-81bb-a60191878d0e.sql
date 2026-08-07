CREATE TABLE public.payment_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  display_name text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  test_mode boolean NOT NULL DEFAULT true,
  supported_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  public_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  secret_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  webhook_status text NOT NULL DEFAULT 'not_configured',
  connection_status text NOT NULL DEFAULT 'not_configured',
  last_tested_at timestamptz,
  last_test_result text,
  notes text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_connectors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_connectors TO authenticated;
GRANT ALL ON public.payment_connectors TO service_role;
ALTER TABLE public.payment_connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled connectors"
ON public.payment_connectors FOR SELECT USING (enabled = true);
CREATE POLICY "Super admins can view all connectors"
ON public.payment_connectors FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can manage connectors"
ON public.payment_connectors FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_payment_connectors_updated_at
BEFORE UPDATE ON public.payment_connectors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  method_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  provider text NOT NULL,
  category text NOT NULL DEFAULT 'standard',
  is_manual boolean NOT NULL DEFAULT false,
  instructions text,
  enabled boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled payment methods"
ON public.payment_methods FOR SELECT USING (enabled = true);
CREATE POLICY "Super admins can view all payment methods"
ON public.payment_methods FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "Super admins can manage payment methods"
ON public.payment_methods FOR ALL TO authenticated
USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.payment_connectors (provider, display_name, supported_methods, secret_refs, display_order) VALUES
('stripe','Stripe','["stripe_checkout","apple_pay_stripe","google_pay_stripe","ach_stripe"]','["STRIPE_SANDBOX_API_KEY","STRIPE_LIVE_API_KEY","PAYMENTS_SANDBOX_WEBHOOK_SECRET"]',1),
('square','Square','["square_payments","cash_app_pay","apple_pay_square","google_pay_square","afterpay_square"]','["SQUARE_ACCESS_TOKEN","SQUARE_WEBHOOK_SIGNATURE_KEY"]',2),
('paypal','PayPal','["paypal_checkout","venmo_paypal"]','["PAYPAL_CLIENT_SECRET","PAYPAL_WEBHOOK_ID"]',3),
('manual','Manual Payments','["pay_at_pickup","manual_cash","zelle_manual","cashapp_manual","venmo_manual"]','[]',4),
('catering','Catering Payments','["catering_deposit","catering_balance","invoice_payment","quote_required"]','[]',5);

UPDATE public.payment_connectors SET enabled = true, connection_status = 'active', test_mode = false WHERE provider IN ('manual','catering');

INSERT INTO public.payment_methods (method_key, label, description, provider, category, is_manual, instructions, enabled, display_order) VALUES
('pay_at_pickup','Pay at Pickup','Pay in person when you pick up your order.','manual','manual',true,'Please have cash or card ready when you arrive. Your order is not marked paid until we confirm payment.',true,1),
('manual_cash','Manual Cash Payment','Pay with cash on pickup or delivery.','manual','manual',true,'Have exact cash ready if possible. Our team will confirm payment at handoff.',true,2),
('zelle_manual','Zelle Manual Payment','Send payment by Zelle.','manual','manual',true,'Send your Zelle payment to the number provided by Anderson''s Smoking Que and include your order number in the memo.',false,3),
('cashapp_manual','Cash App Manual Payment','Send payment through Cash App.','manual','manual',true,'Send your Cash App payment to our $Cashtag and include your order number in the note.',false,4),
('venmo_manual','Venmo Manual Payment','Send payment through Venmo.','manual','manual',true,'Send your Venmo payment to our handle and include your order number in the note.',false,5),
('stripe_checkout','Stripe Checkout','Pay by card securely with Stripe.','stripe','standard',false,null,false,10),
('apple_pay_stripe','Apple Pay (Stripe)','Pay with Apple Pay through Stripe.','stripe','standard',false,null,false,11),
('google_pay_stripe','Google Pay (Stripe)','Pay with Google Pay through Stripe.','stripe','standard',false,null,false,12),
('ach_stripe','ACH / Bank Transfer','Pay directly from a bank account.','stripe','standard',false,null,false,13),
('square_payments','Square Payments','Pay by card with Square.','square','standard',false,null,false,20),
('cash_app_pay','Cash App Pay (Square)','Pay with Cash App Pay through Square.','square','standard',false,null,false,21),
('apple_pay_square','Apple Pay (Square)','Pay with Apple Pay through Square.','square','standard',false,null,false,22),
('google_pay_square','Google Pay (Square)','Pay with Google Pay through Square.','square','standard',false,null,false,23),
('afterpay_square','Afterpay / Clearpay','Buy now, pay later with Afterpay.','square','standard',false,null,false,24),
('paypal_checkout','PayPal Checkout','Pay with your PayPal account.','paypal','standard',false,null,false,30),
('venmo_paypal','Venmo (PayPal)','Pay with Venmo through PayPal.','paypal','standard',false,null,false,31),
('catering_deposit','Catering Deposit','Pay a deposit to reserve your catering date.','catering','catering',false,null,false,40),
('catering_balance','Catering Final Balance','Pay the remaining catering balance.','catering','catering',false,null,false,41),
('invoice_payment','Invoice Payment','Pay an invoice issued by our team.','catering','catering',true,'We will email you an invoice. Your order is not marked paid until payment is received and confirmed.',false,42),
('quote_required','Quote Required','Request a custom quote before payment.','catering','catering',true,'Our catering team will contact you with a quote before any payment is due.',false,43);