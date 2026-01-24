import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Login from '../../../frontend/pages/Login.svelte'

describe('Login Page', () => {
  it('should render login form', () => {
    const { container } = render(Login)

    expect(container).toBeTruthy()
  })

  it('should have email input', () => {
    render(Login)

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toBeTruthy()
  })

  it('should have password input', () => {
    render(Login)

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toBeTruthy()
  })

  it('should have submit button', () => {
    render(Login)

    const submitButton = screen.getByRole('button', { name: /login/i })
    expect(submitButton).toBeTruthy()
  })
})
