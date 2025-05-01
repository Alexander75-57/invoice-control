import { db } from '@/db';
import { Invoices } from '@/db/schema';


export default async function Dashboard() {
    const results = await db.select().from(Invoices);
    console.log('result: ', results); // for testing
    
    return (
        <main className="flex flex-col justify-center h-screen text-center gap-6 max-w-5xl mx-auto">
            <h1 className="text-5xl font-bold">Dashboard</h1>
            <p>Welcome to the dashboard!</p>
        </main>
    );
}