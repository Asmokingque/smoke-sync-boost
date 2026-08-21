import type { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { CheckoutFormValues } from "@/components/checkout/types";

export function DeliveryAddressForm({ form }: { form: UseFormReturn<CheckoutFormValues> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FormField
        control={form.control}
        name="deliveryAddress.street"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Street Address</FormLabel>
            <FormControl>
              <Input {...field} placeholder="123 Smokehouse Lane" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="deliveryAddress.apt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Apt / Suite</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Optional" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div />
      <FormField
        control={form.control}
        name="deliveryAddress.city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Input {...field} placeholder="City" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="deliveryAddress.state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Input {...field} placeholder="State" className="h-12" maxLength={2} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="deliveryAddress.zip"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ZIP</FormLabel>
            <FormControl>
              <Input {...field} placeholder="ZIP code" className="h-12" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
