# Testing Guide

This guide covers how to write and run tests in this project.

## Test Structure

```
tests/
├── setup.ts              # Global test setup
├── utils/
│   └── test-helpers.ts   # Reusable test utilities
├── backend/              # Backend tests
│   ├── home.controller.test.ts
│   └── routes/
│       └── home.test.ts
└── frontend/             # Frontend tests
    └── pages/
        ├── Home.test.ts
        └── Login.test.ts
```

## Available Scripts

```bash
# Run tests in watch mode
bun run test

# Run tests once
bun run test:run

# Run tests with UI
bun run test:ui

# Run tests with coverage
bun run test:coverage
```

## Writing Backend Tests

### Controller Tests

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { homeController } from '../../backend/controllers/home.controller'

vi.mock('../../backend/middleware/auth', () => ({
  getSessionUser: vi.fn()
}))

describe('HomeController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render Home page', async () => {
    const response = await homeController.index(cookie, request, set)
    expect(response).toBeInstanceOf(Response)
  })
})
```

### Route Tests

```typescript
import { describe, it, expect } from 'vitest'
import { Elysia } from 'elysia'
import { homeRoutes } from '../../../backend/routes/web/home'

describe('Home Routes', () => {
  let app: Elysia

  beforeEach(() => {
    app = new Elysia()
    homeRoutes(app)
  })

  it('should respond to GET /', async () => {
    const response = await app.handle(new Request('http://localhost:3000/'))
    expect(response.status).toBe(200)
  })
})
```

## Writing Frontend Tests

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import Home from '../../../frontend/pages/Home.svelte'

describe('Home Page', () => {
  it('should render home page', () => {
    const { container } = render(Home, {
      props: {
        auth: { user: null }
      }
    })
    expect(container).toBeTruthy()
  })

  it('should display user info', () => {
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
```

## Test Utilities

Use the provided test helpers in `tests/utils/test-helpers.ts`:

```typescript
import { createTestApp, mockRequest, mockCookie, mockSet } from '../utils/test-helpers'

// Create test app
const app = createTestApp()

// Mock request
const request = mockRequest({ method: 'POST' })

// Mock cookie
const cookie = mockCookie('test-token')

// Mock set object
const set = mockSet()
```

## Best Practices

1. **Mock external dependencies**: Use `vi.mock()` for services, databases, etc.
2. **Clean up mocks**: Use `beforeEach(() => vi.clearAllMocks())`
3. **Test both success and failure cases**: Cover happy paths and error scenarios
4. **Keep tests focused**: Each test should verify one specific behavior
5. **Use descriptive test names**: Make it clear what each test verifies

## Coverage

Run tests with coverage report:

```bash
bun run test:coverage
```

Coverage reports are generated in `coverage/` directory.

## Troubleshooting

### Tests failing due to Inertia responses

The Inertia adapter returns different response types. Check the actual response type before asserting:

```typescript
const response = await homeController.index(cookie, request, set)
if (response instanceof Response) {
  expect(response.status).toBe(200)
}
```

### Happy-DOM issues

If you encounter issues with Happy-DOM, ensure your test files are properly importing from `@testing-library/svelte` and `@testing-library/jest-dom/vitest`.

## Next Steps

- Add more backend tests for controllers, routes, and validators
- Add frontend tests for components and pages
- Add integration tests for full user flows
- Set up CI/CD to run tests automatically
