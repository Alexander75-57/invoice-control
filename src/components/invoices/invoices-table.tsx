"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoiceStatus } from "@/db/schema";
import { useRouter } from "next/navigation";

type Invoice = {
  id: number;
  createTS: Date;
  value: number;
  description: string | null;
  customerId: number;
  status: InvoiceStatus;
  customerName: string | null;
};

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const router = useRouter();
  
  // Function to format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Function to render status badge
  const getStatusBadge = (status: InvoiceStatus) => {
    const statusClasses = {
      [InvoiceStatus.Open]: "bg-blue-100 text-blue-800",
      [InvoiceStatus.Paid]: "bg-green-100 text-green-800",
      [InvoiceStatus.Void]: "bg-gray-100 text-gray-800",
      [InvoiceStatus.Uncollectible]: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusClasses[status]
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  // Navigate to invoice detail page
  const handleRowClick = (invoiceId: number) => {
    router.push(`/invoice/${invoiceId}`);
  };

  return (
    <Table>
      <TableCaption>A list of your invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer Name</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No invoices found
            </TableCell>
          </TableRow>
        ) : (
          invoices.map((invoice) => (
            <TableRow 
              key={invoice.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(invoice.id)}
            >
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>{formatDate(invoice.createTS)}</TableCell>
              <TableCell>{invoice.customerName || "Unknown Customer"}</TableCell>
              <TableCell>${(invoice.value / 100).toFixed(2).replace('.', ',')}</TableCell>
              <TableCell>{getStatusBadge(invoice.status as InvoiceStatus)}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}