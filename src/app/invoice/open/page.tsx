import { getInvoicesByStatus } from '@/db/actions';
import { InvoiceStatus } from '@/db/schema';
import { InvoicesTable } from '@/components/invoices/invoices-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function OpenInvoicesPage() {
  // Fetch only open invoices
  const openInvoices = await getInvoicesByStatus(InvoiceStatus.Open);
  
  return (
    <main className="flex flex-col p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Open Invoices</h1>
        <div className="flex gap-3">
          <Link href="/dashboard">
            <Button variant="outline" size="default">
              All Invoices
            </Button>
          </Link>
          <Link href="/invoice/new">
            <Button variant="default" size="default">
              Create New Invoice
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="rounded-md border bg-white">
        <InvoicesTable invoices={openInvoices} />
      </div>
    </main>
  );
}