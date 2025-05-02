import { getCustomers } from "@/db/actions";
import NewInvoiceForm from "./form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create New Invoice",
  description: "Create a new invoice in the invoice control system",
};

export default async function NewInvoicePage() {
  // Fetch all customers for the dropdown
  const customers = await getCustomers();
  
  return (
    <main className="flex flex-col p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Invoice</h1>
      
      <div className="rounded-md border bg-white p-6">
        <NewInvoiceForm customers={customers} />
      </div>
    </main>
  );
}