"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewInvoiceFormValues, newInvoiceFormSchema } from "./schema";
import { createInvoiceAction } from "./actions";
import { CustomerType, InvoiceStatus } from "@/db/schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface NewInvoiceFormProps {
  customers: CustomerType[];
}

export default function NewInvoiceForm({ customers }: NewInvoiceFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewInvoiceFormValues>({
    resolver: zodResolver(newInvoiceFormSchema),
    defaultValues: {
      customerId: undefined,
      value: undefined,
      description: "",
      status: InvoiceStatus.Open,
    },
  });

  async function onSubmit(data: NewInvoiceFormValues) {
    setSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("customerId", String(data.customerId));
      formData.append("value", String(data.value));
      if (data.description) formData.append("description", data.description);
      formData.append("status", data.status);
      
      // Submit form using server action
      const result = await createInvoiceAction(formData);
      
      if (result && result.success) {
        // Redirect on success
        window.location.href = "/dashboard";
      } else if (result && !result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  // Find selected customer data
  const handleCustomerChange = (customerId: string) => {
    const id = parseInt(customerId, 10);
    const selectedCustomer = customers.find(c => c.id === id);
    
    if (selectedCustomer) {
      form.setValue("customerName", selectedCustomer.name);
      form.setValue("customerEmail", selectedCustomer.email);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleCustomerChange(value);
                }}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem 
                      key={customer.id} 
                      value={customer.id?.toString() || ""}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the customer for this invoice
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer Email (Read-only) */}
        {form.watch("customerEmail") && (
          <FormItem>
            <FormLabel>Customer Email</FormLabel>
            <Input 
              value={form.watch("customerEmail") || ""} 
              readOnly 
              disabled
            />
          </FormItem>
        )}

        {/* Invoice Value */}
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Value</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter invoice value (e.g. 12,64)"
                  {...field}
                  // Handle comma as decimal separator and convert to number
                  onChange={e => {
                    const inputValue = e.target.value;
                    if (inputValue === "") {
                      field.onChange(undefined);
                    } else {
                      // Allow only digits, comma and dot
                      const sanitizedValue = inputValue.replace(/[^0-9.,]/g, '');
                      // Allow only one decimal separator (either comma or dot)
                      const parts = sanitizedValue.split(/[,.]/).filter(Boolean);
                      if (parts.length <= 2) {
                        // If there are exactly two parts, make sure the second part is no more than 2 digits
                        if (parts.length === 2 && parts[1].length > 2) {
                          parts[1] = parts[1].substring(0, 2);
                          field.onChange(parts.join(','));
                        } else {
                          field.onChange(sanitizedValue);
                        }
                      } else {
                        // If there are too many separators, just use the first two parts
                        field.onChange(parts[0] + ',' + parts[1]);
                      }
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter the invoice value (maximum 2 decimal places)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Invoice Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter invoice description"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional description for this invoice
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Invoice Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(InvoiceStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the status for this invoice
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Submit"}
        </Button>
      </form>
    </Form>
  );
}