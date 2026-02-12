import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  return (
    <div className='max-w-md mx-auto mt-12'>
      <div className='bg-white dark:bg-[#1C1C1A] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[#3E3E3A]'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Sign Up</h1>
        
        <form method='POST' action='/sign-up'>
          <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
          
          <div className='space-y-4'>
            <div>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                name='name'
                type='text'
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete='name'
              />
            </div>

            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete='email'
              />
            </div>

            <div>
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
              />
              <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                Must be at least 8 characters
              </p>
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
                autoComplete='new-password'
              />
            </div>

            <Button type='submit' className='w-full'>
              Sign Up
            </Button>

            <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
              Already have an account?{' '}
              <a href='/sign-in' className='text-blue-600 dark:text-blue-400 hover:underline'>
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

const mount = document.getElementById('sign-up-root');
if (mount) {
  createRoot(mount).render(<SignUp />);
}
