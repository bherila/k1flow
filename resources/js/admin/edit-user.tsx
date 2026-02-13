import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchWrapper } from '@/fetchWrapper';
import { DeleteUserDialog } from '@/components/user-management/DeleteUserDialog';
import UserFormFields from '@/components/user-management/UserFormFields';

type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  is_disabled: boolean;
  force_change_pw: boolean;
  email_verified_at: string | null;
};

type Company = {
  id: number;
  name: string;
  ein: string | null;
  permission: 'owner' | 'shared';
  deleted_at: string | null;
};

function EditUser({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    is_disabled: false,
    force_change_pw: false,
    email_verified: false,
  });

  useEffect(() => {
    loadUser();
    loadCompanies();
  }, [userId]);

  const loadUser = async () => {
    try {
      const data = await fetchWrapper.get(`/api/admin/users/${userId}`);
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        is_admin: data.is_admin,
        is_disabled: data.is_disabled,
        force_change_pw: data.force_change_pw,
        email_verified: !!data.email_verified_at,
      });
    } catch (error) {
      console.error('Error loading user:', error);
      alert('Error loading user');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await fetchWrapper.get(`/api/admin/users/${userId}/companies`);
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        is_admin: formData.is_admin,
        is_disabled: formData.is_disabled,
        force_change_pw: formData.force_change_pw,
        email_verified: formData.email_verified,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      await fetchWrapper.put(`/api/admin/users/${userId}`, payload);
      alert('User updated successfully');
      loadUser();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSuccess = () => {
    window.location.href = '/admin/users';
  };

  if (loading) {
    return (
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex items-center justify-between mb-8'>
          <div className='space-y-2'>
            <Skeleton className='h-8 w-56' />
            <Skeleton className='h-4 w-40' />
          </div>
          <div className='flex gap-2'>
            <Skeleton className='h-10 w-28 rounded' />
            <Skeleton className='h-10 w-36 rounded' />
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] p-6'>
            <Skeleton className='h-6 w-40 mb-4' />
            <div className='space-y-4'>
              <Skeleton className='h-10' />
              <Skeleton className='h-10' />
              <Skeleton className='h-10' />
              <Skeleton className='h-10' />
            </div>
          </div>

          <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] p-6'>
            <Skeleton className='h-6 w-36 mb-4' />
            <div className='space-y-3'>
              <Skeleton className='h-8' />
              <Skeleton className='h-8' />
              <Skeleton className='h-8' />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className='max-w-7xl mx-auto'>User not found</div>;
  }

  return (
    <div className='max-w-7xl mx-auto'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold'>Edit User</h1>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={() => (window.location.href = '/admin/users')}>
            Back to Users
          </Button>
          <DeleteUserDialog userId={userId} userName={user.name} onSuccess={handleDeleteSuccess} />
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* User Details Form */}
        <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] p-6'>
          <h2 className='text-xl font-semibold mb-4'>User Details</h2>
          <form onSubmit={handleSubmit}>
            <div className='space-y-4'>
              {/* Reusable form fields */}
              <UserFormFields formData={formData} setFormData={(next) => setFormData(next)} showAdminOptions={true} />

              <Button type='submit' disabled={saving} className='w-full'>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        {/* Companies List */}
        <div className='bg-white dark:bg-[#1C1C1A] rounded-lg shadow border border-gray-200 dark:border-[#3E3E3A] p-6'>
          <h2 className='text-xl font-semibold mb-4'>Companies ({companies.length})</h2>
          {companies.length === 0 ? (
            <p className='text-gray-500'>No companies associated with this user</p>
          ) : (
            <div className='space-y-2'>
              {companies.map((company) => (
                <div
                  key={company.id}
                  className='p-3 border border-gray-200 dark:border-[#3E3E3A] rounded-lg'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='font-medium'>{company.name}</div>
                      {company.ein && <div className='text-sm text-gray-500'>EIN: {company.ein}</div>}
                      <div className='flex items-center gap-2 mt-1'>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            company.permission === 'owner'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {company.permission === 'owner' ? 'Owner' : 'Shared Access'}
                        </span>
                        {company.deleted_at && (
                          <span className='text-xs px-2 py-0.5 rounded bg-red-100 text-red-800'>
                            Deleted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mount = document.getElementById('edit-user-root');
if (mount) {
  const userId = parseInt(mount.getAttribute('data-user-id') || '0', 10);
  createRoot(mount).render(<EditUser userId={userId} />);
}
