/**
 * usePaymentConnectors.ts
 * Loads connectors + payment methods and exposes the checkout-safe list.
 */
import { useCallback, useEffect, useState } from "react";
import {
  availableMethods,
  fetchConnectors,
  fetchPaymentMethods,
  type PaymentConnector,
  type PaymentMethod,
} from "@/lib/paymentConnectors";

export function usePaymentConnectors(onlyEnabled = false) {
  const [connectors, setConnectors] = useState<PaymentConnector[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const [c, m] = await Promise.all([fetchConnectors(), fetchPaymentMethods(onlyEnabled)]);
      setConnectors(c);
      setMethods(m);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load payment connectors");
    } finally {
      setLoading(false);
    }
  }, [onlyEnabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    connectors,
    methods,
    checkoutMethods: availableMethods(methods, connectors),
    loading,
    error,
    reload,
  };
}
