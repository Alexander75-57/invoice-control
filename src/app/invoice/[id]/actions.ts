'use server';

import { updateInvoiceStatus as dbUpdateInvoiceStatus } from '@/db/actions';
import { InvoiceStatus } from '@/db/schema';

export async function updateInvoiceStatus(id: number, status: InvoiceStatus) {
  try {
    // Update the invoice status in the database
    const updatedInvoice = await dbUpdateInvoiceStatus(id, status);
    
    if (!updatedInvoice) {
      throw new Error('Failed to update invoice status');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice status:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to update invoice status');
  }
}
