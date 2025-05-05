# Delete Invoice Functionality

This document explains how to implement the delete invoice functionality in the invoice-control app.

## Overview

The delete invoice feature allows users to delete invoices from the system. This functionality is implemented on the invoice detail page and includes:

1. A delete button in the invoice detail page
2. A confirmation dialog to prevent accidental deletions
3. Server action to handle the deletion
4. Redirect to dashboard after successful deletion

## Implementation Steps

### 1. Create Server Action to Delete Invoice

First, we add a server action to handle the invoice deletion:

```typescript
// src/app/invoice/[id]/actions.ts
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
```

This server action uses the `deleteInvoice` function from the database actions to delete the invoice from the database.

### 2. Add Delete Button to Invoice Detail Page

Next, we update the invoice detail page to include a delete button and the logic to handle the deletion:

```typescript
// Import the deleteInvoice action
import { updateInvoiceStatus, deleteInvoice } from './actions';
import { useRouter } from 'next/navigation';

// Add state for tracking delete operation
const [isDeleting, setIsDeleting] = useState(false);
const router = useRouter();

// Add delete handler function
const handleDeleteInvoice = async () => {
  if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
    return;
  }
  
  setIsDeleting(true);
  setError(null);
  
  try {
    await deleteInvoice(invoice.id);
    // Redirect to dashboard after successful deletion
    router.push('/dashboard');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    setIsDeleting(false);
  }
};

// Add delete button to UI
<Button 
  variant="destructive" 
  size="default"
  onClick={handleDeleteInvoice}
  disabled={isDeleting}
  className="bg-red-600 hover:bg-red-700 text-white"
>
  {isDeleting ? 'Deleting...' : 'Delete Invoice'}
</Button>
```

### 3. Database Action

The database already has a function to delete invoices in `src/db/actions.ts`:

```typescript
export async function deleteInvoice(id: number) {
  return await db.delete(Invoices).where(eq(Invoices.id, id)).returning();
}
```

## Testing the Delete Feature

To test the delete invoice functionality:

1. Navigate to the invoice detail page for any invoice
2. Click the "Delete Invoice" button
3. Confirm the deletion in the confirmation dialog
4. Verify that you are redirected to the dashboard
5. Verify that the deleted invoice no longer appears in the invoice list

## Security Considerations

- We should ensure that only authorized users can delete invoices
- We might want to add additional safeguards for important invoices
- Consider adding logging for audit purposes when invoices are deleted