import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ResetPassword() {
  const mount = document.getElementById('reset-password-root');
  const token = mount?.getAttribute('data-token') || '';
  const initialEmail = mount?.getAttribute('data-email') || '';
  
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <div className='max-w-md mx-auto mt-12'>
      <div className='bg-white dark:bg-[#1C1C1A] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[#3E3E3A]'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Reset Password</h1>
        
        <form method='POST' action='/reset-password'>
          <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
          <input type='hidden' name='token' value={token} />
          
          <div className='space-y-4'>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor='password'>New Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor='password_confirmation'>Confirm Password</Label>
              <Input
                id='password_confirmation'
                name='password_confirmation'
                type='password'
                required
                minLength={8}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>

            <Button type='submit' className='w-full'>
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const mount = document.getElementById('reset-password-root');
if (mount) {
  createRoot(mount).render(<ResetPassword />);
}
