'use server';

import { updateInvoiceStatus as dbUpdateInvoiceStatus, deleteInvoice as dbDeleteInvoice } from '@/db/actions';
import { InvoiceStatus } from '@/db/schema';
import { revalidatePath } from 'next/cache';

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

export async function deleteInvoice(id: number) {
  try {
    // Delete the invoice from the database
    const deletedInvoice = await dbDeleteInvoice(id);
    
    if (!deletedInvoice || deletedInvoice.length === 0) {
      throw new Error('Failed to delete invoice');
    }
    
    // Revalidate the dashboard path to update the UI
    revalidatePath('/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    
    throw new Error('Failed to delete invoice');
  }
}
