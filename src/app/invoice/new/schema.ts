import { z } from "zod";
import { InvoiceStatus } from "@/db/schema";

// Define a schema for the new invoice form
export const newInvoiceFormSchema = z.object({
  customerId: z.coerce.number({
    required_error: "Please select a customer",
  }),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  value: z.string()
    .min(1, "Please enter an invoice value")
    .transform((val) => {
      // Replace comma with dot for number parsing
      const normalizedValue = val.replace(",", ".");
      const parsed = parseFloat(normalizedValue);
      // Round to 2 decimal places
      return Math.round(parsed * 100) / 100;
    })
    .refine(
      (val) => !isNaN(val),
      {
        message: "Please enter a valid number",
      }
    )
    .refine(
      (val) => val > 0,
      {
        message: "Value must be a positive number",
      }
    )
    .refine(
      (val) => {
        // Check if the value has no more than 2 decimal places
        const str = val.toString();
        const decimalPart = str.includes(".") ? str.split(".")[1] : "";
        return decimalPart.length <= 2;
      },
      {
        message: "Value can have a maximum of 2 decimal places",
      }
    ),
  description: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus, {
    required_error: "Please select an invoice status",
  }).default(InvoiceStatus.Open),
});

export type NewInvoiceFormValues = z.infer<typeof newInvoiceFormSchema>;