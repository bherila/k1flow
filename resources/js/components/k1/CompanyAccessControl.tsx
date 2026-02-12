import React, { useState, useEffect } from 'react';
import { Key, Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CompanyAccessControlProps {
  companyId: number;
}

export default function CompanyAccessControl({ companyId }: CompanyAccessControlProps) {
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState<User | null>(null);
  const [sharedUsers, setSharedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadUsers();
    }
  }, [open, companyId]);

  useEffect(() => {
    if (email.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [email]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/companies/${companyId}/users`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setOwner(data.owner);
      setSharedUsers(data.shared_users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(email)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleGrantAccess = async (userId: number) => {
    setError('');
    try {
      const response = await fetch(`/api/companies/${companyId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to grant access');
      }

      setEmail('');
      setSearchResults([]);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRevokeAccess = async (userId: number) => {
    setError('');
    try {
      const response = await fetch(`/api/companies/${companyId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to revoke access');
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          Access
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Users with Access</DialogTitle>
          <DialogDescription>
            Manage who can access this company and its data.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Add user section */}
            <div className="space-y-2">
              <Label htmlFor="email">Add email:</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#1C1C1A] border border-gray-200 dark:border-[#3E3E3A] rounded-md shadow-lg max-h-60 overflow-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.id}
                          className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-[#262625] text-sm"
                          onClick={() => handleGrantAccess(user.id)}
                        >
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Owner info */}
            {owner && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <p className="text-sm font-medium">Owner</p>
                <p className="text-sm text-muted-foreground">
                  {owner.name} ({owner.email})
                </p>
              </div>
            )}

            {/* Shared users table */}
            {sharedUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sharedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRevokeAccess(user.id)}
                          title="Remove access"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Only you can access this company.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
