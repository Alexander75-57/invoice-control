import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
    return (
        <main className="flex flex-col justify-center h-screen text-center gap-6 max-w-5xl mx-auto">
            <h1 className="text-5xl font-bold">Invoice-Control</h1>
            <p>
                <Button asChild>
                    <Link href="/dashboard">Sign in</Link>
                </Button>
            </p>
        </main>
    );
}