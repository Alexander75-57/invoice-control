import { getInvoiceById } from '@/db/actions';
import { notFound } from 'next/navigation';
import InvoiceDetail from './invoice-detail';

export default async function InvoicePage({ params }: { params: { id: string } }) {
  // Wait for params to be fully available
  const resolvedParams = await params;
  
  // Convert the ID from string to number
  const id = parseInt(resolvedParams.id, 10);
  
  // Fetch the invoice by ID
  const invoice = await getInvoiceById(id);
  
  // If invoice not found, return 404
  if (!invoice) {
    notFound();
  }
  
  return (
    <main className="flex flex-col p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Invoice #{invoice.id}</h1>
      </div>
      
      <div className="rounded-md border bg-white p-6">
        <InvoiceDetail invoice={invoice} />
      </div>
    </main>
  );
}
