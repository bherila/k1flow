import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

import CreateUserModal from '@/components/user-management/CreateUserModal'
import { fetchWrapper } from '@/fetchWrapper'

jest.mock('@/fetchWrapper', () => ({
  fetchWrapper: {
    post: jest.fn(),
  },
}))

describe('CreateUserModal', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders fields and validates email', async () => {
    const onClose = jest.fn()
    const onCreated = jest.fn()

    render(<CreateUserModal isOpen={true} onClose={onClose} onCreated={onCreated} />)

    // inputs present
    const email = screen.getByLabelText(/^Email$/i) as HTMLInputElement
    const name = screen.getByLabelText(/Name/i) as HTMLInputElement
    const password = screen.getByLabelText(/^Password$/i) as HTMLInputElement
    expect(email).toBeInTheDocument()
    expect(name).toBeInTheDocument()
    expect(password).toBeInTheDocument()

    // validation: empty email
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }))
    expect(screen.getByText(/Email is required/)).toBeInTheDocument()
    expect((fetchWrapper.post as jest.Mock).mock.calls.length).toBe(0)

    // invalid email
    fireEvent.change(email, { target: { value: 'not-an-email' } })
    fireEvent.click(screen.getByRole('button', { name: /Create User/i }))
    expect(screen.getByText(/valid email address/)).toBeInTheDocument()
    expect((fetchWrapper.post as jest.Mock).mock.calls.length).toBe(0)
  })

  it('submits payload and calls callbacks on success', async () => {
    (fetchWrapper.post as jest.Mock).mockResolvedValue({ id: 123, email: 'a@b.com' })

    const onClose = jest.fn()
    const onCreated = jest.fn()

    render(<CreateUserModal isOpen={true} onClose={onClose} onCreated={onCreated} />)

    const email = screen.getByLabelText(/^Email$/i) as HTMLInputElement
    const name = screen.getByLabelText(/Name/i) as HTMLInputElement
    const password = screen.getByLabelText(/^Password$/i) as HTMLInputElement

    fireEvent.change(email, { target: { value: 'new@example.com' } })
    fireEvent.change(name, { target: { value: 'New User' } })
    fireEvent.change(password, { target: { value: 'secret123' } })

    fireEvent.click(screen.getByRole('button', { name: /Create User/i }))

    await waitFor(() => expect(fetchWrapper.post).toHaveBeenCalled())

    expect(fetchWrapper.post).toHaveBeenCalledWith('/api/admin/users', {
      email: 'new@example.com',
      name: 'New User',
      password: 'secret123',
      is_admin: false,
      is_disabled: false,
      force_change_pw: false,
      email_verified: false,
    })

    expect(onCreated).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
