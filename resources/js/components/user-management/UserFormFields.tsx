'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export type UserFormData = {
  name: string
  email: string
  password: string
  is_admin: boolean
  is_disabled: boolean
  force_change_pw: boolean
  email_verified: boolean
}

type Props = {
  formData: UserFormData
  setFormData: (next: UserFormData) => void
  showAdminOptions?: boolean
}

export default function UserFormFields({ formData, setFormData, showAdminOptions = true }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="password">Password { /* leave blank to keep current */ }</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder={formData.password ? undefined : 'Leave blank to keep current / optional for new users'}
        />
      </div>

      {showAdminOptions && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_admin"
              checked={formData.is_admin}
              onCheckedChange={(checked) => setFormData({ ...formData, is_admin: checked === true })}
            />
            <Label htmlFor="is_admin" className="font-normal">
              Admin User
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_disabled"
              checked={formData.is_disabled}
              onCheckedChange={(checked) => setFormData({ ...formData, is_disabled: checked === true })}
            />
            <Label htmlFor="is_disabled" className="font-normal">
              Account Disabled
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="force_change_pw"
              checked={formData.force_change_pw}
              onCheckedChange={(checked) => setFormData({ ...formData, force_change_pw: checked === true })}
            />
            <Label htmlFor="force_change_pw" className="font-normal">
              Force Password Change
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="email_verified"
              checked={formData.email_verified}
              onCheckedChange={(checked) => setFormData({ ...formData, email_verified: checked === true })}
            />
            <Label htmlFor="email_verified" className="font-normal">
              Email Verified
            </Label>
          </div>
        </div>
      )}
    </div>
  )
}
