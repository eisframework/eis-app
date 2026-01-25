# Testing Guide

## Overview

EIS Framework uses **Vitest** for testing. Tests are organized into:
- **Unit tests** - Test individual functions/services
- **Integration tests** - Test API endpoints/routes
- **Frontend tests** - Test Svelte components

## Running Tests

```bash
# Run all tests
bun run test:run

# Run tests with UI (interactive mode)
bun run test:ui

# Run tests with coverage report
bun run test:coverage
```

## Test Structure

```
tests/
├── backend/          # Backend tests
│   ├── controllers/  # Controller tests
│   └── services/     # Service tests
├── frontend/         # Frontend tests
│   └── pages/        # Page tests
├── integration/      # Integration tests
└── unit/             # Unit tests
```

## Unit Tests

### Testing Controllers

Create test file in `tests/backend/controllers/`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '../../backend/database'
import { posts } from '../../backend/database/schema'

describe('Post Controller', () => {
  beforeEach(async () => {
    // Setup test database
    await db.insert(posts).values({
      id: Bun.randomUUIDv7(),
      title: 'Test Post',
      content: 'Test Content',
      userId: 'test-user-id',
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  afterEach(async () => {
    // Cleanup
    await db.delete(posts)
  })

  it('should create a new post', async () => {
    const postData = {
      id: Bun.randomUUIDv7(),
      userId: 'test-user-id',
      title: 'New Post',
      content: 'New Content'
    }

    await db.insert(posts).values(postData)

    const post = await db.query.posts.findFirst({
      where: (posts, { eq }) => eq(posts.id, postData.id)
    })
    
    expect(post).toBeDefined()
    expect(post?.title).toBe('New Post')
  })

  it('should fail on invalid title', async () => {
    const invalidData = {
      title: '', // Invalid
      content: 'Test Content'
    }

    await expect(
      db.insert(posts).values(invalidData)
    ).rejects.toThrow()
  })
})
```

### Testing Services

Create test file in `tests/backend/services/`:

```typescript
import { describe, it, expect } from 'vitest'
import authService from '../../backend/services/auth.service'

describe('Auth Service', () => {
  it('should hash password', async () => {
    const password = 'password123'
    const hash = await Bun.password.hash(password)
    
    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
  })

  it('should verify password', async () => {
    const password = 'password123'
    const hash = await Bun.password.hash(password)
    
    const isValid = await Bun.password.verify(password, hash)
    
    expect(isValid).toBe(true)
  })
})
```

## Integration Tests

### Testing API Endpoints

Create test file in `tests/integration/`:

```typescript
import { describe, it, expect } from 'vitest'

describe('POST /posts - Integration Tests', () => {
  it('should create post successfully', async () => {
    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Post',
        content: 'Test Content'
      })
    })

    expect(response.status).toBe(303)
  })

  it('should fail with invalid data', async () => {
    const response = await fetch('http://localhost:3000/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '', // Invalid
        content: ''
      })
    })

    expect(response.status).toBe(303)
  })
})
```

## Frontend Tests

### Testing Svelte Components

Create test file in `tests/frontend/pages/`:

```typescript
import { render } from '@testing-library/svelte'
import { describe, it, expect } from 'vitest'
import PostsIndex from '../../frontend/pages/posts/index.svelte'

describe('Posts Index Page', () => {
  it('should render posts list', async () => {
    const { getByText } = render(PostsIndex, {
      props: {
        posts: [
          { id: '1', title: 'Post 1', content: 'Content 1' },
          { id: '2', title: 'Post 2', content: 'Content 2' }
        ]
      }
    })

    expect(getByText('Post 1')).toBeTruthy()
    expect(getByText('Post 2')).toBeTruthy()
  })

  it('should show flash error message', async () => {
    const { getByText } = render(PostsIndex, {
      props: {
        posts: [],
        flash: { error: 'Test error message' }
      }
    })

    expect(getByText('Test error message')).toBeTruthy()
  })
})
```

## Common Test Patterns

### Testing Database Operations

```typescript
// Insert
it('should insert record', async () => {
  await db.insert(posts).values({
    id: Bun.randomUUIDv7(),
    title: 'Test',
    content: 'Content',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const count = await db.select().from(posts)
  expect(count.length).toBe(1)
})

// Find
it('should find record', async () => {
  const id = Bun.randomUUIDv7()
  await db.insert(posts).values({
    id,
    title: 'Test',
    content: 'Content',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id)
  })
  
  expect(post).toBeDefined()
  expect(post?.title).toBe('Test')
})

// Update
it('should update record', async () => {
  const id = Bun.randomUUIDv7()
  await db.insert(posts).values({
    id,
    title: 'Test',
    content: 'Content',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  await db.update(posts)
    .set({ title: 'Updated' })
    .where(eq(posts.id, id))
  
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id)
  })
  
  expect(post?.title).toBe('Updated')
})

// Delete
it('should delete record', async () => {
  const id = Bun.randomUUIDv7()
  await db.insert(posts).values({
    id,
    title: 'Test',
    content: 'Content',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  await db.delete(posts).where(eq(posts.id, id))
  
  const post = await db.query.posts.findFirst({
    where: (posts, { eq }) => eq(posts.id, id)
  })
  
  expect(post).toBeUndefined()
})
```

### Testing Validation

```typescript
it('should validate required field', async () => {
  const controller = new PostController()
  const ctx = {
    body: { title: '', content: 'Content' },
    set: { headers: {} }
  }
  
  const result = await controller.store(ctx as any)
  
  expect(result).toBeInstanceOf(Response)
})

it('should validate minimum length', async () => {
  const controller = new PostController()
  const ctx = {
    body: { title: 'a', content: 'Content' },
    set: { headers: {} }
  }
  
  const result = await controller.store(ctx as any)
  
  expect(result).toBeInstanceOf(Response)
})
```

### Testing Flash Messages

```typescript
it('should set flash error', async () => {
  const ctx = {
    set: { headers: {} }
  }
  
  await flash.set(ctx.set, 'error', 'Test error')
  
  expect(ctx.set.headers['Set-Cookie']).toContain('flash_error=Test error')
})

it('should set flash success', async () => {
  const ctx = {
    set: { headers: {} }
  }
  
  await flash.set(ctx.set, 'success', 'Test success')
  
  expect(ctx.set.headers['Set-Cookie']).toContain('flash_success=Test success')
})
```

## Test Coverage

Run coverage report:

```bash
bun run test:coverage
```

Coverage report shows:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

Aim for:
- **80%+** coverage for critical code
- **60%+** coverage for utility code
- **40%+** coverage for UI code

## Best Practices

### 1. Test Isolation

Each test should be independent:

```typescript
beforeEach(async () => {
  // Setup fresh state
  await db.delete(posts)
})

afterEach(async () => {
  // Cleanup
  await db.delete(posts)
})
```

### 2. Test Success & Failure Cases

```typescript
it('should succeed with valid data', async () => {
  const result = await createPost(validData)
  expect(result).toBeDefined()
})

it('should fail with invalid data', async () => {
  await expect(createPost(invalidData)).rejects.toThrow()
})
```

### 3. Use Descriptive Test Names

```typescript
it('should create post with valid data') // Good
it('test 1') // Bad
```

### 4. Test Edge Cases

```typescript
it('should handle empty input')
it('should handle null values')
it('should handle special characters')
it('should handle large data')
```

### 5. Mock External Dependencies

```typescript
vi.mock('../../backend/services/external-api.service', () => ({
  default: {
    fetch: vi.fn().mockResolvedValue({ data: 'mock' })
  }
}))
```

## Common Issues

### Tests Not Finding Database

Ensure database is initialized:

```typescript
beforeAll(async () => {
  await db.migrate()
})
```

### Tests Timing Out

Increase timeout:

```typescript
it('should complete within time', { timeout: 10000 }, async () => {
  // Test code
})
```

### Tests Failing in CI but Locally

- Check environment variables
- Ensure database migrations run
- Check for hardcoded paths

## CI/CD Integration

Tests run automatically on push to GitHub:

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run test:run
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

- Use Vitest for testing
- Write unit tests for controllers/services
- Write integration tests for API endpoints
- Write frontend tests for components
- Aim for 80%+ coverage on critical code
- Run tests before committing
- Tests run automatically on CI/CD