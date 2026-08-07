/**
 * PaymentConnectorStatusBadge.tsx
 * Small pill showing a connector's status.
 */
import { StatusBadge } from "@/components/shared/StatusBadge";
import { STATUS_LABEL, type ConnectorStatus } from "@/lib/paymentConnectors";

const tone: Record<ConnectorStatus, "neutral" | "success" | "warning" | "danger" | "gold"> = {
  not_configured: "neutral",
  test_mode: "warning",
  active: "success",
  disabled: "neutral",
  error: "danger",
};

export function PaymentConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
  return <StatusBadge label={STATUS_LABEL[status]} tone={tone[status]} />;
}
