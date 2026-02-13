'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { fetchWrapper } from '@/fetchWrapper'
import UserFormFields, { type UserFormData } from '@/components/user-management/UserFormFields'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreated,
}: CreateUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    is_admin: false,
    is_disabled: false,
    force_change_pw: false,
    email_verified: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!formData.email) {
      setError('Email is required')
      return
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await fetchWrapper.post('/api/admin/users', {
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        password: formData.password || undefined,
        is_admin: formData.is_admin,
        is_disabled: formData.is_disabled,
        force_change_pw: formData.force_change_pw,
        email_verified: formData.email_verified,
      })

      setFormData({
        name: '',
        email: '',
        password: '',
        is_admin: false,
        is_disabled: false,
        force_change_pw: false,
        email_verified: false,
      })

      onCreated()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create user'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      is_admin: false,
      is_disabled: false,
      force_change_pw: false,
      email_verified: false,
    })
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. If no password is provided, the user will need to use password reset.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <UserFormFields formData={formData} setFormData={setFormData} showAdminOptions={true} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
