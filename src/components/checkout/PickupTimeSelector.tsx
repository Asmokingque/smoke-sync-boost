import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CheckoutFormValues } from "@/components/checkout/types";

export function PickupTimeSelector({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="pickupDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pickup Date</FormLabel>
            <FormControl>
              <Input {...field} type="date" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="pickupTime"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pickup Time</FormLabel>
            <FormControl>
              <Input {...field} type="time" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
