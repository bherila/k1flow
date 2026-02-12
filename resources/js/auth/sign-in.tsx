import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    try {
      const response = await fetch('/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken || '',
        },
        body: JSON.stringify({ email: resetEmail || email }),
      });

      if (response.ok) {
        setForgotPasswordOpen(false);
        alert('Password reset link sent! Please check your email.');
      } else {
        alert('Error sending password reset link. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending password reset link. Please try again.');
    }
  };

  return (
    <div className='max-w-md mx-auto mt-12'>
      <div className='bg-white dark:bg-[#1C1C1A] p-8 rounded-lg shadow-lg border border-gray-200 dark:border-[#3E3E3A]'>
        <h1 className='text-2xl font-bold mb-6 text-center'>Sign In</h1>
        
        <form method='POST' action='/sign-in'>
          <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
          
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='current-password'
              />
            </div>

            <Button type='submit' className='w-full'>
              Sign In
            </Button>

            <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
              <DialogTrigger asChild>
                <button
                  type='button'
                  className='text-sm text-blue-600 dark:text-blue-400 hover:underline block text-center w-full'
                >
                  Forgot Password?
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we'll send you a link to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleForgotPassword}>
                  <div className='space-y-4'>
                    <div>
                      <Label htmlFor='reset-email'>Email</Label>
                      <Input
                        id='reset-email'
                        type='email'
                        required
                        value={resetEmail || email}
                        onChange={(e) => setResetEmail(e.target.value)}
                      />
                    </div>
                    <Button type='submit' className='w-full'>
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
              Don't have an account?{' '}
              <a href='/sign-up' className='text-blue-600 dark:text-blue-400 hover:underline'>
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

const mount = document.getElementById('sign-in-root');
if (mount) {
  createRoot(mount).render(<SignIn />);
}
