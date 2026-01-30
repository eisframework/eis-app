# Testing Guide

## When to Use E2E vs Bun Test

### Decision Matrix

| Scenario | Use Bun Test | Use E2E (Playwright) |
|----------|--------------|----------------------|
| Testing service logic (business rules) | ✅ Primary | ❌ No |
| Testing controller responses | ✅ Primary | ❌ No |
| Testing database operations | ✅ Primary | ❌ No |
| Testing form validation | ✅ Primary | ❌ No |
| Testing API endpoints (without UI) | ✅ Primary | ❌ No |
| Testing user flows across multiple pages | ❌ No | ✅ Primary |
| Testing browser-specific behavior (localStorage, cookies) | ⚠️ Limited | ✅ Primary |
| Testing visual rendering | ❌ No | ✅ Primary |
| Testing authentication flows with real browser | ❌ No | ✅ Primary |
| Testing file uploads | ❌ No | ✅ Primary |
| Testing real-time interactions (WebSocket, SSE) | ❌ No | ✅ Primary |

### Bun Test: When to Use

**Use `bun:test` for:**

1. **Unit Tests** - Testing individual functions/classes in isolation
   - Service layer logic (auth, user management)
   - Utility functions
   - Data transformations

2. **Integration Tests** - Testing how components work together
   - Controller → Service → Database flow
   - API endpoint responses
   - Form validation logic

3. **Fast Feedback** - When you need quick results during development
   - TDD workflow
   - CI/CD pipelines (run first, fail fast)

4. **Deterministic Tests** - When you need 100% reproducible results
   - No browser dependencies
   - No network flakiness
   - No timing issues

**Example: Testing Service Logic**
```typescript
import { describe, test, expect } from 'bun:test'
import { authService } from '../../../backend/services/auth.service'

describe('AuthService', () => {
  test('should hash password correctly', async () => {
    const hash = await authService.hashPassword('password123')
    expect(hash).toBeDefined()
    expect(hash).not.toBe('password123')
  })
})
```

### E2E Testing: When to Use

**Use E2E (Playwright) for:**

1. **User Journey Testing** - Testing complete workflows
   - Login → Dashboard → Logout
   - Registration → Email verification → First login
   - Multi-step forms

2. **Browser-Specific Features**
   - localStorage/sessionStorage
   - Cookies management
   - Browser history/navigation
   - File uploads/downloads

3. **Visual Regression**
   - Page layout verification
   - Responsive design testing
   - Component rendering

4. **Real User Scenarios**
   - Testing with real browser engine
   - Network conditions
   - Cross-browser compatibility

**Example: Testing Login Flow**
```typescript
import { test, expect } from '@playwright/test'

test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})
```

### Testing Strategy Pyramid

```
        /\
       /E2E\      ← Few tests (critical user journeys)
      /------\
     /Integration\  ← Medium tests (API, controller flows)
    /------------\
   /   Unit Tests \  ← Many tests (service logic, utilities)
  /----------------\
```

**Rule of Thumb:**
- **70%** Bun Test (unit + integration)
- **20%** Component tests (Svelte components)
- **10%** E2E tests (critical user journeys)

### Common Mistakes

**❌ Don't use E2E for:**
- Testing business rules (e.g., password hashing logic)
- Testing form validation (can be tested with unit tests)
- Testing API response formats (use integration tests)
- Testing database queries (use unit tests with real DB)

**❌ Don't use Bun Test for:**
- Testing browser-specific behavior (localStorage, cookies)
- Testing visual rendering
- Testing complex user flows across multiple pages
- Testing file uploads with real browser

### Example: Same Feature Tested Both Ways

**Feature: User Registration**

**Bun Test (Service Logic)**
```typescript
test('should register user with valid data', async () => {
  const user = await authService.register({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  })
  
  expect(user).toBeDefined()
  expect(user.email).toBe('test@example.com')
})
```

**E2E Test (User Journey)**
```typescript
test('user can register through form', async ({ page }) => {
  await page.goto('/register')
  await page.fill('input[name="name"]', 'Test User')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.fill('input[name="password_confirmation"]', 'password123')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('.flash-message')).toContainText('Registration successful')
})
```

### Quick Decision Flow

```
Is this a user journey across multiple pages?
├─ Yes → Use E2E
└─ No
    ├─ Does it involve browser-specific features (localStorage, cookies)?
    │   ├─ Yes → Use E2E
    │   └─ No
    │       ├─ Is it testing business logic/service rules?
    │       │   └─ Yes → Use Bun Test
    │       ├─ Is it testing API/controller responses?
    │       │   └─ Yes → Use Bun Test
    │       └─ Is it testing form validation?
    │           └─ Yes → Use Bun Test
```

---

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

---

## Critical: vi.mock Does NOT Work Reliably in Bun Test

### The Problem

**`vi.mock` does NOT work reliably** when `setup.ts` imports the module first. This causes:
- Tests pass individually (`bun test path/to/file.test.ts`) ✅
- Tests fail when running all tests (`bun test`) ❌

### Root Cause

1. `setup.ts` is loaded first (via `setupFiles` in config)
2. `setup.ts` imports database module → module is cached
3. Test file's `vi.mock('../database')` is hoisted but **module already cached**
4. Mock doesn't apply → real database operations happen
5. Data persists to next test file → "Email already registered" errors

### Example of Broken Pattern

```typescript
// ❌ BROKEN: vi.mock doesn't work when setup.ts imports db first
import { describe, test, expect, beforeEach, vi } from 'bun:test'
import { usersController } from '../../../backend/controllers/users.controller'

// This mock will NOT work if setup.ts already imported database
vi.mock('../../../backend/database', () => ({
  default: {
    query: { users: { findMany: vi.fn() } },
    insert: vi.fn(),
    delete: vi.fn()
  }
}))

describe('Users Controller', () => {
  // Tests will use REAL database, not mock!
})
```

### Solution: Use Real Database with Cleanup

Instead of mocking database, use real database and **clean up after each test**:

```typescript
// ✅ CORRECT: Use real database with cleanup
import { describe, test, expect, beforeEach, afterEach, vi } from 'bun:test'
import { usersController } from '../../../backend/controllers/users.controller'
import db from '../../../backend/database'
import { users, sessions, passwordResetTokens } from '../../../backend/database/schema'

describe('Users Controller', () => {
  let mockContext: any

  beforeEach(() => {
    mockContext = {
      user: { id: '1', name: 'Test', email: 'test@example.com' },
      body: {},
      params: {},
      set: { headers: {} },
      inertia: vi.fn(() => new Response()),
      request: new Request('http://localhost')
    }
    vi.clearAllMocks()
  })

  // CRITICAL: Clean up database after each test
  afterEach(async () => {
    await db.delete(passwordResetTokens)
    await db.delete(sessions)
    await db.delete(users)
  })

  test('should show user page', async () => {
    // Create test data first
    const testUserId = 'test-user-id'
    await db.insert(users).values({
      id: testUserId,
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password'
    })

    mockContext.params = { id: testUserId }
    await usersController.show(mockContext)

    expect(mockContext.inertia).toHaveBeenCalledWith('users/show', expect.any(Object))
  })
})
```

### When vi.mock DOES Work

`vi.mock` works for modules that are **NOT imported by setup.ts**:

```typescript
// ✅ Works: flash.service is not imported by setup.ts
vi.mock('../../../backend/services/flash.service', () => ({
  default: { set: vi.fn() }
}))
```

### Summary Table

| Scenario | vi.mock Works? | Solution |
|----------|----------------|----------|
| Module imported by setup.ts | ❌ No | Use real module + cleanup |
| Module NOT imported by setup.ts | ✅ Yes | vi.mock works fine |
| Database operations | ❌ No | Real DB + beforeEach/afterEach cleanup |
| External services (flash, etc) | ✅ Yes | vi.mock works |

### Checklist for Controller Tests

- [ ] **DON'T** mock database with vi.mock
- [ ] **DO** import real database
- [ ] **DO** add `afterEach` to clean up database
- [ ] **DO** create test data in each test that needs it
- [ ] **DO** mock services NOT imported by setup.ts (flash, etc)
- [ ] **DO** use `vi.clearAllMocks()` in `beforeEach`

---

## Database Instance Isolation

### The Problem with `:memory:` Database

SQLite `:memory:` database creates a **new database per connection**. If `migrate.ts` creates its own connection, migrations run on a different database than tests use.

### Solution: Pass Database Instance to Migrations

**In `backend/database/index.ts`:**
```typescript
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { Database } from 'bun:sqlite'
import * as schema from './schema'

const dbPath = process.env.DB_PATH || './data/database.sqlite'
export const sqlite = new Database(dbPath)  // Export sqlite instance

// Skip WAL mode for :memory: databases
sqlite.exec('PRAGMA foreign_keys = ON')
if (dbPath !== ':memory:') {
  sqlite.exec('PRAGMA journal_mode = WAL')
}

export const db = drizzle(sqlite, { schema })
export default db
```

**In `backend/database/migrate.ts`:**
```typescript
import { Database } from 'bun:sqlite'

// Accept external database instance
async function runMigrations(externalDb?: Database) {
  const dbPath = process.env.DB_PATH || './data/database.sqlite'
  // Use external db if provided (for tests)
  const sqlite = externalDb || new Database(dbPath)
  
  // Run migrations on this instance...
}

export { runMigrations }
```

**In `tests/setup.ts`:**
```typescript
// Set DB_PATH BEFORE any imports
process.env.DB_PATH = ':memory:'

import db, { sqlite } from '../backend/database'

beforeAll(async () => {
  const { runMigrations } = await import('../backend/database/migrate')
  // Pass same sqlite instance to ensure migrations run on same database
  await runMigrations(sqlite)
})
```

---

## Global State Cleanup

### Rate Limit Stores

If your service has global state (like rate limiting), clear it in `setup.ts`:

```typescript
// In setup.ts
import { rateLimitStores } from '../backend/services/auth.service'

beforeEach(async () => {
  // Clear rate limit stores
  rateLimitStores.clear()
  
  // Clean database
  await db.delete(passwordResetTokens)
  await db.delete(sessions)
  await db.delete(users)
})
```

### Why This Matters

Without clearing global state:
1. Test A triggers rate limit (3 attempts)
2. Test B runs → immediately hits rate limit error
3. Test B fails with "Too many attempts" even though it only tried once