import NewCustomerForm from "./form";

export default function NewCustomerPage() {
  return (
    <main className="flex flex-col p-6 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Customer</h1>
        <p className="text-slate-500 mt-2">
          Add a new customer to your invoice system
        </p>
      </div>
      
      <div className="rounded-md border bg-white p-6">
        <NewCustomerForm />
      </div>
    </main>
  );
}
