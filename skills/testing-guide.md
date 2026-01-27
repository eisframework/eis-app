# Testing Guide

## AI Agent Guide: Creating Unit Tests

### When AI Agent Creates Tests

**Purpose:** This guide helps AI agents create reliable, error-free unit tests that pass consistently.

### Critical Rules (MUST FOLLOW)

1. **Use Bun Test, NOT Vitest**
   ```typescript
   // ✅ Correct
   import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

   // ❌ Wrong
   import { describe, it, expect } from 'vitest'
   ```

2. **Use Named Imports (Avoid Caching Issues)**
   ```typescript
   // ✅ Correct - Named import
   import { authService } from '../../../backend/services/auth.service'

   // ❌ Wrong - Default import (causes caching issues)
   import authService from '../../../backend/services/auth.service'
   ```

3. **Use `describe.serial` for Database Tests**
   ```typescript
   // ✅ Correct - Serial execution for database tests
   describe.serial('Auth Service', () => {
     // Tests run sequentially
   })

   // ❌ Wrong - Concurrent execution causes database conflicts
   describe.concurrent('Auth Service', () => {
     // Tests run concurrently - BAD for database tests
   })
   ```

4. **Clean Up Database in Correct Order**
   ```typescript
   beforeEach(async () => {
     // Delete child tables first due to foreign keys
     await db.delete(sessions)
     await db.delete(passwordResetTokens)
     await db.delete(users)
   })

   afterEach(async () => {
     // Clean up after each test
     await db.delete(sessions)
     await db.delete(passwordResetTokens)
     await db.delete(users)
   })
   ```

5. **Initialize Objects Properly**
   ```typescript
   // ✅ Correct
   const cookie: any = {
     auth_token: {}
   }

   // ❌ Wrong
   const cookie: any = {}
   ```

6. **Handle Void Returns Correctly**
   ```typescript
   // ✅ Correct - Method returns void
   const result = await authService.forgotPassword(email)
   expect(result).toBeUndefined()

   // ❌ Wrong - Don't expect promise
   await expect(authService.forgotPassword(email)).resolves.toBeUndefined()
   ```

### Test Structure Template

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { serviceName } from '../../../backend/services/serviceName.service'
import db from '../../../backend/database'
import { table1, table2, table3 } from '../../../backend/database/schema'

describe.serial('Service Name', () => {
  let testId: string
  let testToken: string

  beforeEach(async () => {
    // Clear rate limit stores if any
    // rateLimitStores.clear()

    // Clean up any existing test data (delete in correct order due to foreign keys)
    await db.delete(table3)
    await db.delete(table2)
    await db.delete(table1)
  })

  afterEach(async () => {
    // Clean up after each test (delete in correct order due to foreign keys)
    await db.delete(table3)
    await db.delete(table2)
    await db.delete(table1)
  })

  describe('featureName', () => {
    test('should do something successfully', async () => {
      // Arrange
      const input = { /* test data */ }

      // Act
      const result = await serviceName.method(input)

      // Assert
      expect(result).toBeDefined()
      expect(result.property).toBe('expected value')
    })

    test('should throw error for invalid input', async () => {
      // Arrange
      const invalidInput = { /* invalid data */ }

      // Act & Assert
      await expect(serviceName.method(invalidInput)).rejects.toThrow('Expected error message')
    })
  })
})
```

### Common Test Patterns

**Pattern 1: Service with Database Operations**
```typescript
describe.serial('UserService', () => {
  beforeEach(async () => {
    await db.delete(sessions)
    await db.delete(users)
  })

  test('should create user', async () => {
    const user = await userService.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    })

    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })
})
```

**Pattern 2: Controller with Mocks**
```typescript
describe('AuthController', () => {
  let mockContext: ControllerContext

  beforeEach(() => {
    mockContext = {
      inertia: vi.fn(),
      user: { id: 'test-id', email: 'test@example.com' },
      set: {},
      cookie: { auth_token: {} }
    }
  })

  test('should return login page', async () => {
    await authController.getLogin(mockContext)

    expect(mockContext.inertia).toHaveBeenCalledWith('auth/login', {
      auth: { user: null }
    })
  })
})
```

**Pattern 3: Testing Error Cases**
```typescript
test('should throw error if email exists', async () => {
  const input = {
    email: 'test@example.com',
    password: 'password123'
  }

  // First registration
  await authService.register(input)

  // Second should fail
  await expect(authService.register(input)).rejects.toThrow('Email already exists')
})
```

### Testing Checklist

Before creating tests, ensure:

- [ ] Import from `bun:test` (not `vitest`)
- [ ] Use named imports for services
- [ ] Use `describe.serial` for database tests
- [ ] Add `beforeEach` to clean up database
- [ ] Add `afterEach` to clean up database
- [ ] Delete tables in correct order (child → parent)
- [ ] Initialize objects properly (cookie, etc.)
- [ ] Handle void returns correctly
- [ ] Test success cases
- [ ] Test error cases
- [ ] Mock external dependencies when needed

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test tests/backend/services/auth.service.test.ts

# Run with module reload (if caching issues)
bun test --reload

# Clear cache first
rm -rf node_modules/.cache
bun test
```

---

## Bun Test Best Practices

### Module Cache Issues

**Problem:** Tests pass individually but fail when running all tests together.

**Root Cause:** Bun caches imported modules and doesn't reload them when running multiple test files. This causes tests to use outdated versions of modules.

**Solution:** Use named imports instead of default imports:

```typescript
// ❌ Avoid: Default import (can cause caching issues)
import authService from '../../../backend/services/auth.service'

// ✅ Use: Named import (avoids caching issues)
import { authService } from '../../../backend/services/auth.service'
```

### Test Isolation

**Problem:** Database state leaks between tests when running all tests together.

**Solution 1: Serial Execution**
Use `describe.serial` for database-dependent tests:

```typescript
describe.serial('Auth Service', () => {
  // Tests run sequentially, not concurrently
})
```

**Solution 2: Configuration**
Add to `bun-test.config.ts`:

```typescript
export default {
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts,svelte}'],
    exclude: ['node_modules', 'dist', '.svelte-kit'],
    setupFiles: ['./tests/setup.ts'],
    cache: false,              // Disable cache for development
    maxConcurrency: 1          // Force sequential execution
  }
}
```

### Database Cleanup

**Problem:** Foreign key constraint failures due to incorrect deletion order.

**Solution:** Delete in correct order (child tables first):

```typescript
beforeEach(async () => {
  // Clear rate limit stores
  rateLimitStores.clear()

  // Clean up any existing test data (delete in correct order due to foreign keys)
  await db.delete(sessions)
  await db.delete(passwordResetTokens)
  await db.delete(users)
})

afterEach(async () => {
  // Clean up after each test (delete in correct order due to foreign keys)
  await db.delete(sessions)
  await db.delete(passwordResetTokens)
  await db.delete(users)
})
```

### Common Pitfalls

1. **Cookie Object Initialization**
   ```typescript
   // ❌ Wrong: Empty object
   const cookie: any = {}

   // ✅ Correct: Initialize with auth_token
   const cookie: any = {
     auth_token: {}
   }
   ```

2. **Void Return Methods**
   ```typescript
   // ❌ Wrong: Expect promise
   await expect(authService.forgotPassword(email)).resolves.toBeUndefined()

   // ✅ Correct: Direct check
   const result = await authService.forgotPassword(email)
   expect(result).toBeUndefined()
   ```

3. **User Validation Before Insert**
   ```typescript
   // Always validate user exists before inserting dependent records
   const user = await db.query.users.findFirst({
     where: (users, { eq }) => eq(users.email, 'test@example.com')
   })

   if (!user) {
     throw new Error('Test user not found')
   }

   await db.insert(passwordResetTokens).values({
     id: Bun.randomUUIDv7(),
     userId: user.id,
     token: resetToken,
     expiresAt
   })
   ```

### Debugging Test Failures

1. **Clear Cache First**
   ```bash
   rm -rf node_modules/.cache
   bun pm cache rm
   ```

2. **Run Individual Tests**
   ```bash
   bun test tests/backend/services/auth.service.test.ts
   ```

3. **Force Module Reload**
   ```bash
   bun test --reload
   ```

4. **Check Import Style**
   - Default imports can cause caching issues
   - Named imports are more reliable

### Test Structure

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { authService } from '../../../backend/services/auth.service'
import db from '../../../backend/database'
import { users, sessions, passwordResetTokens } from '../../../backend/database/schema'

describe.serial('Service Name', () => {
  let testId: string
  let testToken: string

  beforeEach(async () => {
    // Clear state
    // Clean up database
  })

  afterEach(async () => {
    // Clean up database
  })

  describe('feature', () => {
    test('should do something', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Mocking Bun APIs

In `tests/setup.ts`:

```typescript
import { expect, afterEach } from 'bun:test'
import { cleanup } from '@testing-library/svelte'
import '@testing-library/jest-dom/vitest'

declare global {
  var Bun: {
    file: (path: string) => {
      text: () => Promise<string>
      arrayBuffer: () => Promise<ArrayBuffer>
    }
    write: (path: string, data: Buffer) => Promise<number>
    randomUUIDv7: () => string
    password: {
      hash: (password: string) => Promise<string>
      verify: (password: string, hash: string) => Promise<boolean>
    }
  }
}

global.Bun = {
  file: (path: string) => ({
    text: async () => {
      const fs = await import('fs/promises')
      return await fs.readFile(path, 'utf-8')
    },
    arrayBuffer: async () => new ArrayBuffer(10)
  }),
  write: async (path: string, data: Buffer) => data.length,
  randomUUIDv7: () => 'test-uuid-' + Math.random().toString(36).substring(7),
  password: {
    hash: async (password: string) => `hashed_${password}`,
    verify: async (password: string, hash: string) => hash === `hashed_${password}`
  }
}

afterEach(() => {
  cleanup()
})
```