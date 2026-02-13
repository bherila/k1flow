import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { fetchWrapper } from '@/fetchWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import CreateUserModal from '@/components/user-management/CreateUserModal';

type User = {
  id: number;
  name: string;
  email: string;
  last_login_at: string | null;
  is_admin: boolean;
  is_disabled: boolean;
  email_verified_at: string | null;
};

type PaginatedResponse = {
  data: User[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: Partial<PaginatedResponse> | any = await fetchWrapper.get(`/api/admin/users?page=${currentPage}`);

      const data = response && Array.isArray(response.data) ? response.data : [];
      const lastPage = response && typeof response.last_page === 'number' ? response.last_page : 1;

      setUsers(data);
      setTotalPages(lastPage);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold'>Manage Users</h1>
        <>
          <Button onClick={() => setCreateOpen(true)}>+ New User</Button>
          <CreateUserModal
            isOpen={createOpen}
            onClose={() => setCreateOpen(false)}
            onCreated={() => {
              setCurrentPage(1);
              loadUsers();
            }}
          />
        </>
      </div>

      {loading ? (
        <div className='space-y-3'>
          <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] overflow-hidden p-4'>
            <div className='grid grid-cols-4 gap-4'>
              <Skeleton className='h-6 col-span-1' />
              <Skeleton className='h-6 col-span-1' />
              <Skeleton className='h-6 col-span-1' />
              <Skeleton className='h-6 col-span-1' />
            </div>
            <div className='mt-4 space-y-3'>
              <Skeleton className='h-8' />
              <Skeleton className='h-8' />
              <Skeleton className='h-8' />
            </div>
          </div>
          <div className='flex justify-end'>
            <Skeleton className='h-8 w-32 rounded' />
          </div>
        </div>
      ) : (
        <>
          <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] overflow-hidden'>
            <table className='w-full'>
              <thead className='bg-gray-50 dark:bg-[#262625] border-b border-gray-200 dark:border-[#3E3E3A]'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Name</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Email</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Last Login</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-[#3E3E3A]'>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {user.name}
                      {user.is_admin && <span className='ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded'>Admin</span>}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>{user.email}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_disabled ? 'bg-red-100 text-red-800' : 
                        user.email_verified_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.is_disabled ? 'Disabled' : user.email_verified_at ? 'Active' : 'Unverified'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm'>
                      <Button 
                        variant='outline' 
                        size='sm' 
                        className='mr-2'
                        onClick={() => window.location.href = `/admin/user/${user.id}`}
                      >
                        Edit
                      </Button>
                      <Button variant='outline' size='sm'>Audit Log</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-end gap-2 mt-4'>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className='text-sm'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const mount = document.getElementById('admin-users-root');
if (mount) {
  createRoot(mount).render(<AdminUsers />);
}
