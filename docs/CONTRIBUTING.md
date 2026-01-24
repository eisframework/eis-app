# Contributing Guide

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to build something great together.

## Development Setup

### 1. Fork and Clone

```bash
git clone https://github.com/your-username/learn-elysia.git
cd learn-elysia
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 4. Database Setup

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start Development

```bash
bun run dev
```

## Coding Standards

### TypeScript

**Use Type Definitions:**

```typescript
// ✅ Good
interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): User | null {
  // ...
}

// ❌ Bad
function getUser(id) {
  // ...
}
```

**Avoid `any` Type:**

```typescript
// ✅ Good
interface Props {
  user: User | null
  error?: string
}

// ❌ Bad
const data: any = await fetchData()
```

### Backend (Elysia.js)

**Keep Routes Thin:**

```typescript
// ✅ Good
.get('/users', async ({ render }) => {
  const users = await userController.index()
  return render('Users/Index', { users })
})

// ❌ Bad
.get('/users', async ({ render }) => {
  const db = getDatabase()
  const users = await db.query.users.findMany()
  const processed = users.map(/* complex logic */)
  return render('Users/Index', { users: processed })
})
```

**Use Controllers for Business Logic:**

```typescript
// ✅ Good
export const userController = {
  async index() {
    return await db.query.users.findMany()
  }
}

// ❌ Bad
.get('/users', async ({ render }) => {
  // All logic here
})
```

**Validate Input:**

```typescript
// ✅ Good
import { registerSchema } from '../validators/auth.validator'

.post('/register', async ({ body }) => {
  const validated = validate(registerSchema, body)
  // ...
})

// ❌ Bad
.post('/register', async ({ body }) => {
  // No validation
  const { email, password } = body
  // ...
})
```

### Frontend (Svelte)

**Use Svelte 5 Runes Syntax:**

```svelte
<!-- ✅ Good - Modern Svelte 5 -->
<script lang="ts">
  let count = $state(0)
  let doubled = $derived(count * 2)
</script>

<button on:click={() => count++}>
  {doubled}
</button>

<!-- ❌ Bad - Old Svelte syntax -->
<script lang="ts">
  export let count = 0
  $: doubled = count * 2
</script>
```

**Component Organization:**

```svelte
<!-- ✅ Good - Clear structure -->
<script lang="ts">
  // 1. Imports
  import { onMount } from 'svelte'

  // 2. Props
  export let user: User

  // 3. State
  let loading = $state(true)

  // 4. Lifecycle
  onMount(async () => {
    // load data
  })

  // 5. Functions
  async function refresh() {
    // ...
  }
</script>

<!-- Markup -->
{#if loading}
  <p>Loading...</p>
{:else}
  <p>{user.name}</p>
{/if}

<!-- Styles (if needed) -->
<style>
  p {
    color: blue;
  }
</style>

<!-- ❌ Bad - No organization -->
<script lang="ts">
  // Everything mixed together
</script>
```

**Props Typing:**

```svelte
<!-- ✅ Good -->
<script lang="ts">
  interface Props {
    user: User
    onAction: (id: number) => void
  }

  export let user: Props['user']
  export let onAction: Props['onAction']
</script>

<!-- ❌ Bad -->
<script lang="ts">
  export let user: any
  export let onAction: any
</script>
```

### CSS (TailwindCSS)

**Prefer Utility Classes:**

```svelte
<!-- ✅ Good -->
<div class="bg-blue-500 text-white p-4 rounded">
  Content
</div>

<!-- ❌ Bad -->
<div style="background-color: blue; color: white;">
  Content
</div>
```

**Extract Reusable Patterns:**

```svelte
<!-- ✅ Good - Component -->
<Card title="Title">
  Content
</Card>

<!-- ❌ Bad - Repeated markup -->
<div class="bg-white shadow rounded p-4 mb-4">
  <h2 class="text-xl font-bold mb-2">Title</h2>
  <p>Content</p>
</div>
```

### File Naming

**Backend:**
- Controllers: `*.controller.ts` (e.g., `user.controller.ts`)
- Routes: `*.ts` (e.g., `users.ts`)
- Validators: `*.validator.ts` (e.g., `user.validator.ts`)
- Utils: `*.ts` (e.g., `hash.ts`)

**Frontend:**
- Pages: `PascalCase.svelte` (e.g., `UserProfile.svelte`)
- Components: `PascalCase.svelte` (e.g., `Button.svelte`)
- Utils: `*.ts` (e.g., `format.ts`)

## Commit Guidelines

### Commit Message Format

```
type(scope): brief description

Detailed explanation (optional)

Refs: #issue
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**

```
feat(auth): add password reset functionality

- Add reset password email
- Add reset password form
- Add token expiration logic

Refs: #123

fix(database): handle migration errors gracefully

- Catch and log migration errors
- Rollback on failure

docs(readme): update installation instructions

- Add bun installation step
- Fix broken links
```

### Commit Best Practices

```bash
# ✅ Good - Atomic commits
git commit -m "feat(users): add user profile page"

# ❌ Bad - Vague commits
git commit -m "update stuff"

# ✅ Good - Descriptive
git commit -m "fix(auth): redirect to login after registration"

# ❌ Bad - Too broad
git commit -m "fix bugs"
```

## Pull Request Process

### 1. Branch Naming

```
feature/your-feature-name
fix/your-bug-fix
docs/your-doc-change
```

### 2. Before Submitting PR

- [ ] Code follows style guidelines
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated
- [ ] Commits are clear and atomic
- [ ] No merge conflicts

### 3. PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this change?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
```

### 4. Review Process

1. Automated checks (CI/CD) must pass
2. At least one approval required
3. Resolve all review comments
4. Squash commits if needed
5. Merge when approved

## Testing Guidelines

### Unit Tests

Test individual functions/components:

```typescript
// Example: Unit test for utility function
import { describe, expect, test } from 'bun:test'
import { hashPassword } from '../utils/hash'

describe('hashPassword', () => {
  test('should hash password', async () => {
    const password = 'secret123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
  })
})
```

### Integration Tests

Test request/response flow:

```typescript
// Example: Integration test for route
import { describe, expect, test } from 'bun:test'
import { app } from '../app'

describe('POST /register', () => {
  test('should create new user', async () => {
    const response = await app
      .handle(
        new Request('http://localhost/register', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
          })
        })
      )

    expect(response.status).toBe(303)
  })
})
```

### Frontend Tests

Test Svelte components:

```typescript
// Example: Component test
import { render, screen } from '@testing-library/svelte'
import Button from '../Button.svelte'

describe('Button', () => {
  test('renders children', () => {
    render(Button, { children: 'Click me' })
    expect(screen.getByText('Click me')).toBeTruthy()
  })
})
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific file
bun test path/to/test.test.ts

# Watch mode
bun test --watch
```

## Code Review Guidelines

### For Reviewers

1. **Be Constructive** - Provide specific, actionable feedback
2. **Explain Why** - Help author understand the reasoning
3. **Acknowledge Good Work** - Positive reinforcement
4. **Check Key Areas:**
   - Security implications
   - Performance impact
   - Breaking changes
   - Test coverage
   - Documentation

### For Authors

1. **Be Open** - Accept feedback gracefully
2. **Ask Questions** - Clarify if you don't understand
3. **Explain Decisions** - Help reviewers understand your approach
4. **Make Changes** - Address feedback promptly

## Adding Features

### Step 1: Discuss First

Open an issue to discuss the feature before implementing.

### Step 2: Create Branch

```bash
git checkout -b feature/your-feature-name
```

### Step 3: Implement

- Follow coding standards
- Add tests
- Update documentation

### Step 4: Test

```bash
bun test
bun run typecheck
```

### Step 5: Submit PR

- Fill out PR template
- Link to related issues
- Request reviewers

## Reporting Issues

### Before Creating Issue

1. Search existing issues
2. Check if it's expected behavior
3. Try to reproduce it

### Issue Template

```markdown
## Description
Clear description of the problem

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Linux, Windows]
- Bun version: [e.g., 1.0.0]
- Node version (if applicable): [e.g., 20.0.0]

## Additional Context
Logs, screenshots, etc.
```

## Questions?

- Open an issue with "question" label
- Ask in discussions
- Check documentation first

Thank you for contributing! 🎉
