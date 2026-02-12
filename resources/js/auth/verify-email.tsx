import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';

function VerifyEmail() {
  const handleResend = async () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    try {
      const response = await fetch('/email/verification-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Verification link sent!');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className='max-w-md mx-auto mt-12'>
      <div className='bg-white dark:bg-[#1C1C1A] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[#3E3E3A]'>
        <h1 className='text-2xl font-bold mb-4'>Verify Your Email</h1>
        <p className='mb-6 text-gray-600 dark:text-gray-400'>
          Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you?
        </p>
        <p className='mb-6 text-gray-600 dark:text-gray-400'>
          If you didn't receive the email, we will gladly send you another.
        </p>
        <Button onClick={handleResend} className='w-full'>
          Resend Verification Email
        </Button>
      </div>
    </div>
  );
}

const mount = document.getElementById('verify-email-root');
if (mount) {
  createRoot(mount).render(<VerifyEmail />);
}
