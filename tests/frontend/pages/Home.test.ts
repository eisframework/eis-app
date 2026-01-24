import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Home from '../../../frontend/pages/Home.svelte'

describe('Home Page', () => {
  it('should render home page', () => {
    const { container } = render(Home, {
      props: {
        auth: {
          user: null
        }
      }
    })

    expect(container).toBeTruthy()
  })

  it('should display user info when authenticated', () => {
    render(Home, {
      props: {
        auth: {
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com'
          }
        }
      }
    })

    expect(screen.getByText('Test User')).toBeTruthy()
  })
})
