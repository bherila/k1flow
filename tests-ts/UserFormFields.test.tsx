import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import UserFormFields, { type UserFormData } from '@/components/user-management/UserFormFields'

describe('UserFormFields', () => {
  it('renders values and calls setFormData on input change', () => {
    const initial: UserFormData = {
      name: 'Alice',
      email: 'alice@example.com',
      password: '',
      is_admin: true,
      is_disabled: false,
      force_change_pw: false,
      email_verified: true,
    }

    const setFormData = jest.fn()

    render(<UserFormFields formData={initial} setFormData={setFormData} showAdminOptions={true} />)

    const name = screen.getByLabelText(/Name/i) as HTMLInputElement
    const email = screen.getByLabelText(/^Email$/i) as HTMLInputElement
    const pwd = screen.getByLabelText(/^Password$/i) as HTMLInputElement
    const isAdmin = screen.getByLabelText(/Admin User/i) as HTMLInputElement
    const isDisabled = screen.getByLabelText(/Account Disabled/i) as HTMLInputElement
    const forcePw = screen.getByLabelText(/Force Password Change/i) as HTMLInputElement
    const verified = screen.getByLabelText(/Email Verified/i) as HTMLInputElement

    expect(name.value).toBe('Alice')
    expect(email.value).toBe('alice@example.com')
    expect(pwd.value).toBe('')
    expect(isAdmin).toHaveAttribute('aria-checked', 'true')
    expect(isDisabled).toHaveAttribute('aria-checked', 'false')
    expect(forcePw).toHaveAttribute('aria-checked', 'false')
    expect(verified).toHaveAttribute('aria-checked', 'true')

    // change name
    fireEvent.change(name, { target: { value: 'Bob' } })
    expect(setFormData).toHaveBeenCalled()

    // toggle a checkbox
    fireEvent.click(isDisabled)
    expect(setFormData).toHaveBeenCalled()
  })
})
