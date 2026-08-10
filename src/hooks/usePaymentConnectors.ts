/**
 * usePaymentConnectors.ts
 * Loads connectors + payment methods and exposes the checkout-safe list.
 * `publicOnly` reads the safe public connector directory (no secret refs or
 * diagnostics) — used by storefront/checkout. Admin screens pass false.
 */
import { getErrorMessage } from "@/lib/errors";
import { useCallback, useEffect, useState } from "react";
import {
  availableMethods,
  fetchConnectors,
  fetchPublicConnectors,
  fetchPaymentMethods,
  type PaymentConnector,
  type PaymentMethod,
} from "@/lib/paymentConnectors";

export function usePaymentConnectors(onlyEnabled = false, publicOnly = false) {
  const [connectors, setConnectors] = useState<PaymentConnector[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const [c, m] = await Promise.all([
        publicOnly ? fetchPublicConnectors() : fetchConnectors(),
        fetchPaymentMethods(onlyEnabled),
      ]);
      setConnectors(c);
      setMethods(m);
    } catch (e) {
      setError(getErrorMessage(e, "Failed to load payment connectors"));
    } finally {
      setLoading(false);
    }
  }, [onlyEnabled, publicOnly]);

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
