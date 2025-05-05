import { db } from '@/db';
import { Customers, Invoices } from '@/db/schema';
import { InvoicesTable } from '@/components/invoices/invoices-table';
import { Button } from '@/components/ui/button';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';

export default async function Dashboard() {
    // Fetch invoices with customer names using a join
    const invoices = await db
        .select({
            id: Invoices.id,
            createTS: Invoices.createTS,
            value: Invoices.value,
            description: Invoices.description,
            customerId: Invoices.customerId,
            status: Invoices.status,
            customerName: Customers.name,
        })
        .from(Invoices)
        .leftJoin(Customers, eq(Invoices.customerId, Customers.id))
        .orderBy(desc(Invoices.createTS)); // Sort by newest first
    
    return (
        <main className="flex flex-col p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Invoices Dashboard</h1>
                <div className="flex gap-3">
                    <Link href="/invoice/new">
                        <Button variant="default" size="default">
                            Create New Invoice
                        </Button>
                    </Link>
                    <Link href="/customer/new">
                        <Button variant="outline" size="default">
                            New Customer
                        </Button>
                    </Link>
                </div>
            </div>
            
            <div className="rounded-md border bg-white">
                <InvoicesTable invoices={invoices} />
            </div>
        </main>
    );
}