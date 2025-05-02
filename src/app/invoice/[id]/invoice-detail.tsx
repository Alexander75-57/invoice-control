"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { updateInvoiceStatus } from './actions';
import { InvoiceStatus } from '@/db/schema';

type Invoice = {
  id: number;
  createTS: Date;
  value: number;
  description: string | null;
  customerId: number;
  status: string;
  customerName: string | null;
};

export default function InvoiceDetail({ invoice }: { invoice: Invoice }) {
  const [status, setStatus] = useState(invoice.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };
  
  // Format currency with comma as decimal separator
  const formatCurrency = (value: number) => {
    // Convert from cents to dollars
    const amount = value / 100;
    // Format with 2 decimal places and replace period with comma
    return `$${amount.toFixed(2).replace('.', ',')}`;
  };
  
  // Update invoice status
  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await updateInvoiceStatus(invoice.id, newStatus);
      setStatus(newStatus);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice status');
    } finally {
      setLoading(false);
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusClasses = {
      [InvoiceStatus.Open]: "bg-blue-100 text-blue-800",
      [InvoiceStatus.Paid]: "bg-green-100 text-green-800",
      [InvoiceStatus.Void]: "bg-gray-100 text-gray-800",
      [InvoiceStatus.Uncollectible]: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status as InvoiceStatus] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Invoice Details</h2>
          <p><span className="font-medium">Invoice #:</span> {invoice.id}</p>
          <p><span className="font-medium">Date:</span> {formatDate(invoice.createTS)}</p>
          <p><span className="font-medium">Value:</span> {formatCurrency(invoice.value)}</p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Status:</span> 
            {getStatusBadge(status)}
          </p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-1">Customer Information</h2>
          <p><span className="font-medium">Name:</span> {invoice.customerName || 'Unknown'}</p>
        </div>
      </div>
      
      {/* Description */}
      {invoice.description && (
        <div>
          <h2 className="text-lg font-semibold mb-1">Description</h2>
          <p className="whitespace-pre-wrap">{invoice.description}</p>
        </div>
      )}
      
      {/* Status Updates */}
      <div className="pt-4 border-t">
        <h2 className="text-lg font-semibold mb-3">Update Status</h2>
        
        <div className="flex flex-wrap gap-2">
          {Object.values(InvoiceStatus).map((statusOption) => (
            <Button 
              key={statusOption}
              variant={status === statusOption ? "default" : "outline"}
              size="sm"
              disabled={loading || status === statusOption}
              onClick={() => handleStatusUpdate(statusOption)}
            >
              {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
            </Button>
          ))}
        </div>
        
        {/* Success/Error Messages */}
        {success && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
            Invoice status updated successfully!
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Back Button */}
      <div className="pt-4 mt-6 flex justify-start">
        <Button 
          variant="outline" 
          size="default"
          onClick={() => window.location.href = "/dashboard"}
        >
          Back to Invoices Dashboard
        </Button>
      </div>
    </div>
  );
}
