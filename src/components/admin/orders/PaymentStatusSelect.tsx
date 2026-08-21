import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const paymentStatuses = [
  { value: "unpaid", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
] as const;

export function PaymentStatusSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {paymentStatuses.map((status) => (
          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
