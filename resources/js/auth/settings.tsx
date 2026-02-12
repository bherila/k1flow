import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type User = {
  id: number;
  name: string;
  email: string;
};

type AuditAttempt = {
  id: number;
  event_name: string;
  is_successful: boolean;
  created_at: string;
  ip: string;
};

function Settings() {
  const mount = document.getElementById('user-settings-root');
  const userJson = mount?.getAttribute('data-user') || '{}';
  const attemptsJson = mount?.getAttribute('data-recent-attempts') || '[]';
  
  const user: User = JSON.parse(userJson);
  const recentAttempts: AuditAttempt[] = JSON.parse(attemptsJson);

  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8'>User Settings</h1>

      <div className='space-y-6'>
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your name</CardDescription>
          </CardHeader>
          <CardContent>
            <form method='POST' action='/user/settings/profile'>
              <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    name='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <Button type='submit'>Save</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent>
            <form method='POST' action='/user/settings/password'>
              <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='current_password'>Current Password</Label>
                  <Input
                    id='current_password'
                    name='current_password'
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='password'>New Password</Label>
                  <Input
                    id='password'
                    name='password'
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='password_confirmation'>Confirm New Password</Label>
                  <Input
                    id='password_confirmation'
                    name='password_confirmation'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type='submit'>Update Password</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Email */}
        <Card>
          <CardHeader>
            <CardTitle>Change Email</CardTitle>
            <CardDescription>Current: {user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <form method='POST' action='/user/settings/email'>
              <input type='hidden' name='_token' value={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='email'>New Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <p className='text-sm text-gray-500 mt-1'>
                    You will need to verify your new email address
                  </p>
                </div>
                <Button type='submit'>Request Email Change</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Recent Sign-in Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sign-in Attempts</CardTitle>
            <CardDescription>Your sign-in history from the past 60 days (max 20)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {recentAttempts.length === 0 ? (
                <p className='text-gray-500'>No recent attempts</p>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b'>
                        <th className='text-left py-2'>Date</th>
                        <th className='text-left py-2'>Status</th>
                        <th className='text-left py-2'>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttempts.map((attempt) => (
                        <tr key={attempt.id} className='border-b'>
                          <td className='py-2'>{new Date(attempt.created_at).toLocaleString()}</td>
                          <td className='py-2'>
                            <span className={attempt.is_successful ? 'text-green-600' : 'text-red-600'}>
                              {attempt.is_successful ? 'Success' : 'Failed'}
                            </span>
                          </td>
                          <td className='py-2'>{attempt.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const mount = document.getElementById('user-settings-root');
if (mount) {
  createRoot(mount).render(<Settings />);
}
