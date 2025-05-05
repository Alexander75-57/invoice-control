"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NewCustomerFormValues, newCustomerFormSchema } from "./schema";
import { createCustomerAction } from "./actions";
import { ArrowLeft } from "lucide-react";

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

export default function NewCustomerForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  async function onSubmit(data: NewCustomerFormValues) {
    setSubmitting(true);
    setError(null);
    
    try {
      // Create FormData for server action
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      
      // Submit form using server action
      const result = await createCustomerAction(formData);
      
      if (result && result.success) {
        // Redirect to dashboard on success
        window.location.href = "/dashboard";
      } else if (result && !result.success) {
        setError(result.message);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create customer");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackClick() {
    window.location.href = "/dashboard";
  }

  return (
    <Form {...form}>
      {/* Back Button - Moved above the form fields */}
      <div className="mb-6">
        <Button 
          type="button"
          variant="outline"
          size="sm"
          onClick={handleBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Customer name" {...field} />
              </FormControl>
              <FormDescription>
                Enter the customer's full name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="customer@example.com" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter the customer's email address
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
