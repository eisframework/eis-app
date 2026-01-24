# Elysia Inertia Stack (EIS)

A modern full-stack framework combining Elysia, Svelte, and Inertia.js for building fast, type-safe web applications with seamless SPA experience.

## Features

- **Full-Stack TypeScript** - End-to-end type safety with TypeScript
- **Elysia Backend** - Fast, lightweight Bun-based web framework
- **Svelte Frontend** - Reactive component-based UI with Svelte 5
- **Inertia.js** - SPA-like experience without building a separate API
- **Server-Side Rendering** - SEO-friendly with Eta template engine
- **Authentication** - Built-in auth system with middleware
- **Database** - SQLite with Drizzle ORM and migrations
- **Testing** - Vitest with coverage support
- **TailwindCSS** - Utility-first CSS framework
- **Hot Reload** - Instant development feedback

## Tech Stack

### Backend
- **Elysia** - Modern Bun-based web framework
- **Drizzle ORM** - Type-safe SQL toolkit
- **SQLite** - Lightweight database
- **Eta** - Fast, lightweight template engine
- **TypeScript** - Type-safe development

### Frontend
- **Svelte 5** - Reactive UI framework
- **Inertia.js** - SPA without API separation
- **Vite** - Fast build tool
- **TailwindCSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon library

### Development
- **Bun** - Fast JavaScript runtime
- **Vitest** - Unit and integration testing
- **TypeScript** - Static type checking
- **ESLint/Prettier** - Code quality tools

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd laju-elysia

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

## Usage

### Development

```bash
# Start both backend and frontend with hot reload
bun run dev

# Backend only
bun run dev:backend

# Frontend only
bun run dev:frontend
```

### Building

```bash
# Build for production
bun run build

# Build frontend only
bun run build:frontend

# Build backend only
bun run build:backend
```

### Testing

```bash
# Run tests
bun run test

# Run tests with UI
bun run test:ui

# Run tests once
bun run test:run

# Generate coverage report
bun run test:coverage
```

### Database

```bash
# Generate migrations
bun run db:generate

# Run migrations
bun run db:migrate

# Open Drizzle Studio
bun run db:studio
```

## Project Structure

```
laju-elysia/
├── backend/                 # Elysia backend
│   ├── controllers/         # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── public.controller.ts
│   │   └── users.controller.ts
│   ├── database/           # Database setup
│   │   ├── migrations/
│   │   ├── schema/
│   │   ├── index.ts
│   │   └── migrate.ts
│   ├── inertia/            # Inertia handlers
│   │   ├── handler.ts
│   │   ├── index.ts
│   │   └── response.ts
│   ├── middleware/         # Route middleware
│   │   └── auth.middleware.ts
│   ├── app.ts             # Main Elysia app
│   └── index.ts           # Backend entry point
├── frontend/              # Svelte frontend
│   ├── components/        # Reusable components
│   │   ├── Layout.svelte
│   │   └── NavLink.svelte
│   ├── entry/            # Frontend entry point
│   │   ├── app.ts
│   │   └── index.ts
│   ├── pages/            # Inertia pages
│   │   ├── auth/
│   │   ├── errors/
│   │   ├── users/
│   │   ├── about.svelte
│   │   ├── dashboard.svelte
│   │   ├── home.svelte
│   │   └── profile.svelte
│   └── styles/           # Global styles
│       └── app.css
├── docs/                 # Documentation
├── tests/                # Test files
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# App
APP_NAME="Elysia Inertia App"
APP_ENV=development
APP_DEBUG=true
APP_KEY=change-this-to-a-random-32-character-string
APP_VERSION=1.0.0

# Database
DB_PATH=./database.sqlite

# Server
PORT=3000
HOST=localhost
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development servers (backend + frontend) |
| `bun run dev:backend` | Start backend only |
| `bun run dev:frontend` | Start frontend only |
| `bun run build` | Build for production |
| `bun run build:frontend` | Build frontend only |
| `bun run build:backend` | Build backend only |
| `bun run preview` | Preview production build |
| `bun run test` | Run tests |
| `bun run test:ui` | Run tests with UI |
| `bun run test:coverage` | Generate coverage report |
| `bun run db:generate` | Generate database migrations |
| `bun run db:migrate` | Run database migrations |
| `bun run db:studio` | Open Drizzle Studio |

## Development Workflow

### Creating a New Page

1. Create a Svelte component in `frontend/pages/`
2. Add a controller in `backend/controllers/`
3. Register the route in `backend/routes/index.ts`

Example:

```typescript
// backend/controllers/example.controller.ts
export const exampleController = {
  async index(ctx: ControllerContext) {
    return ctx.inertia('example/index', {
      auth: { user: ctx.user },
      message: 'Hello World'
    })
  }
}
```

```svelte
<!-- frontend/pages/example/index.svelte -->
<script>
  import { page } from '@inertiajs/svelte'
  
  let { message } = $props()
</script>

<h1>{message}</h1>
```

### Creating a Controller

Use the skill guide in `skills/create-controller.md` for detailed instructions.

### Database Migrations

```bash
# Create a new migration
bun run db:generate

# Apply migrations
bun run db:migrate
```

## Testing

The project uses Vitest for testing. Tests are located in the `tests/` directory.

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test --watch

# Run specific test file
bun run test path/to/test.test.ts
```

## Deployment

See `skills/deployment-guide.md` for detailed deployment instructions.

### Production Build

```bash
# Build the application
bun run build

# Preview the production build
bun run preview
```

## Documentation

- [Getting Started](docs/GETTING_STARTED.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Database Guide](docs/DATABASE.md)
- [Testing Guide](docs/TESTING.md)
- [Quick Reference](docs/QUICK_REFERENCE.md)
- [FAQ](docs/FAQ.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License.

## Support

For questions and support, please open an issue on GitHub.

## Acknowledgments

- [Elysia](https://elysiajs.com/) - The amazing web framework
- [Svelte](https://svelte.dev/) - The reactive UI framework
- [Inertia.js](https://inertiajs.com/) - The modern monolith SPA solution
- [Bun](https://bun.sh/) - The fast JavaScript runtime