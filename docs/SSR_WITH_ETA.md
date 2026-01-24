# Server-Side Rendering with Eta

This document explains how to use Eta template engine for server-side rendering (SSR) in this project.

## Overview

Eta is a fast, lightweight template engine used for SEO-critical pages like landing pages. It provides:

- **Server-side rendering** - HTML rendered on the server for better SEO
- **Dynamic data** - Pass data from controllers to templates
- **Type-safe** - Full TypeScript support
- **Separation of concerns** - HTML in views/, logic in controllers/

## File Structure

```
backend/
├── views/
│   ├── app.html         # Inertia root template
│   └── landing.html      # Landing page template (Eta)
└── controllers/
    └── home.controller.ts  # Controller methods
```

## Template Syntax

### Variables

Use `<%= it.variable %>` to output data:

```html
<h1><%= it.title %></h1>
<p><%= it.description %></p>
```

### Loops

Use `<% code %>` for JavaScript logic:

```html
<% it.features.forEach(function(feature) { %>
  <div>
    <span><%= feature.icon %></span>
    <h3><%= feature.title %></h3>
    <p><%= feature.desc %></p>
  </div>
<% }); %>
```

### Conditionals

```html
<% if (it.showStats) { %>
  <div>Stats: <%= it.stats.users %></div>
<% } %>
```

## Creating a New SSR Page

### 1. Create Template File

Create `backend/views/mypage.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= it.title %></title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="container mx-auto px-6 py-12">
    <h1 class="text-4xl font-bold"><%= it.title %></h1>
    <p><%= it.description %></p>
  </div>
</body>
</html>
```

### 2. Add Controller Method

In `backend/controllers/home.controller.ts`:

```typescript
import { Eta } from 'eta'

const eta = new Eta({ views: 'backend/views' })

export const homeController = {
  async myPage() {
    const data = {
      title: 'My Page',
      description: 'Page description'
    }
    const html = await eta.render('mypage.html', data)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
}
```

### 3. Add Route

In `backend/routes/web/home.ts`:

```typescript
.get('/my-page', async () => await homeController.myPage())
```

## Example: Landing Page

### Template (`backend/views/landing.html`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= it.title %> - Modern Full-Stack Framework</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <nav class="bg-white shadow-sm">
    <div class="container mx-auto px-6 py-4">
      <div class="text-2xl font-bold text-indigo-600"><%= it.title %></div>
    </div>
  </nav>

  <div class="container mx-auto px-6 py-20">
    <h1 class="text-5xl font-bold"><%= it.title %></h1>
    <p><%= it.description %></p>

    <div class="grid grid-cols-3 gap-8">
      <% it.features.forEach(function(feature) { %>
        <div class="bg-white p-6 rounded-lg">
          <div class="text-4xl mb-2"><%= feature.icon %></div>
          <h3 class="text-xl font-bold"><%= feature.title %></h3>
          <p><%= feature.desc %></p>
        </div>
      <% }); %>
    </div>
  </div>
</body>
</html>
```

### Controller (`backend/controllers/home.controller.ts`)

```typescript
async landing() {
  const data = {
    title: 'Learn Elysia',
    description: 'A modern full-stack framework...',
    features: [
      { icon: '⚡', title: 'Fast', desc: 'Built on Bun runtime' },
      { icon: '🔒', title: 'Type-Safe', desc: 'Full TypeScript support' },
      { icon: '🎨', title: 'Modern UI', desc: 'Svelte 5 + TailwindCSS' }
    ]
  }

  const html = await eta.render('landing.html', data)
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  })
}
```

## Best Practices

### 1. Keep Templates Simple

- Use TailwindCSS for styling
- Minimize JavaScript in templates
- Move complex logic to controllers

### 2. Use Type-Safe Data

```typescript
interface PageData {
  title: string
  description: string
  features: Array<{ icon: string; title: string; desc: string }>
}

const data: PageData = { ... }
```

### 3. Separate Concerns

- **Views/**: HTML templates only
- **Controllers/**: Business logic
- **Routes/**: Thin delegation to controllers

### 4. Use Consistent Naming

- Template files: `kebab-case.html`
- Controller methods: `camelCase()`
- Routes: `/kebab-case`

## Common Patterns

### Dynamic Data from Database

```typescript
async landing() {
  const users = await db.query.users.findMany()
  const data = {
    title: 'Users',
    userCount: users.length
  }
  const html = await eta.render('landing.html', data)
  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
```

### Conditional Rendering

```html
<% if (it.isAuthenticated) { %>
  <div>Welcome, <%= it.user.name %>!</div>
<% } else { %>
  <a href="/login">Login</a>
<% } %>
```

### Nested Data

```html
<% it.categories.forEach(function(category) { %>
  <h2><%= category.name %></h2>
  <ul>
    <% category.items.forEach(function(item) { %>
      <li><%= item.name %></li>
    <% }); %>
  </ul>
<% }); %>
```

## Troubleshooting

### Template Not Found

Ensure `views` path is correct:
```typescript
const eta = new Eta({ views: 'backend/views' })
```

### Data Not Showing

Check that data is passed correctly:
```typescript
const html = await eta.render('landing.html', data)
// NOT: await eta.render('landing.html', { data })
```

### TypeScript Errors

Add type definitions:
```typescript
interface PageData {
  title: string
  // ...
}
```

## Resources

- [Eta Documentation](https://eta.js.org/)
- [Elysia.js Docs](https://elysiajs.com/)
- [Svelte 5 Docs](https://svelte.dev/docs)
