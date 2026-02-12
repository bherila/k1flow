import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { fetchWrapper } from '@/fetchWrapper';

interface DeleteUserDialogProps {
  userId: number;
  userName: string;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ userId, userName, onSuccess }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetchWrapper.delete(`/api/admin/users/${userId}`);
      setOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant='destructive'>Delete User</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{userName}</strong> and all their associated data, including:
            <ul className='list-disc list-inside mt-2 space-y-1'>
              <li>All companies owned by this user</li>
              <li>All ownership interests</li>
              <li>All K-1 forms and income sources</li>
              <li>All outside basis records and adjustments</li>
              <li>All loss limitations and carryforwards</li>
              <li>All Form 461 worksheets</li>
            </ul>
            <p className='mt-2 font-semibold text-red-600'>This action cannot be undone.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleting} className='bg-red-600 hover:bg-red-700'>
            {deleting ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
