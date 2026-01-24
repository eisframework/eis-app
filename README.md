# Elysia Inertia Svelte (EIS)

A modern full-stack framework combining Elysia, Inertia.js and Svelte for building fast, type-safe web applications with seamless SPA experience.

## Features

- **Full-Stack TypeScript** - End-to-end type safety with TypeScript
- **Elysia Backend** - Fast, lightweight Bun-based web framework
- **Svelte Frontend** - Reactive component-based UI with Svelte 5
- **Inertia.js** - SPA-like experience without building a separate API
- **Server-Side Rendering** - SEO-friendly with Eta template engine
- **Authentication** - Built-in auth system with middleware
- **File Upload** - Support for local and S3 storage with image processing
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
- **bun-image-turbo** - Fast Rust-powered image processing
- **AWS SDK v3** - S3 storage support
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
│   │   ├── auth.controller.ts      # Authentication (login, register, logout)
│   │   ├── dashboard.controller.ts # Dashboard & profile pages
│   │   ├── public.controller.ts    # Public pages (landing, home, about)
│   │   ├── upload.controller.ts    # File upload (images & files)
│   │   └── users.controller.ts     # User management
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
│   ├── services/           # Business logic services
│   │   ├── eta.service.ts         # Eta template engine (SSR)
│   │   ├── flash.service.ts       # Flash messages
│   │   ├── inertia.service.ts     # Inertia.js integration
│   │   ├── s3.service.ts          # S3-compatible storage
│   │   └── storage.service.ts     # Local file storage
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
│   └── entry/            # Frontend entry point
│       ├── app.ts
│       ├── index.ts
│       └── style.css
├── data/                 # Database files
├── dist/                 # Production build output
├── docs/                 # Documentation
├── public/               # Static assets
├── storage/              # File storage
├── tests/                # Test files
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

# Storage (Local)
LOCAL_STORAGE_PATH=./storage
LOCAL_STORAGE_PUBLIC_URL=/storage

# Storage (S3/Wasabi)
WASABI_ENDPOINT=https://s3.wasabisys.com
WASABI_REGION=us-east-1
WASABI_BUCKET=your-bucket-name
WASABI_ACCESS_KEY=your-access-key
WASABI_SECRET_KEY=your-secret-key
CDN_URL=https://cdn.example.com
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

## File Upload

The project supports file uploads with two storage options:

### Local Storage

For development, use local file storage:

```typescript
import { uploadBuffer, getPublicUrl } from '../services/storage.service'
```

### S3 Storage

For production, use S3-compatible storage (AWS S3, Wasabi, etc.):

```typescript
import { uploadBuffer, getPublicUrl } from '../services/s3.service'
```

### Upload Routes

- `POST /upload/image` - Upload images with automatic WebP conversion and resizing
- `POST /upload/file` - Upload files (PDF, Word, Excel, etc.)
- `DELETE /upload/:id` - Delete uploaded assets

### Environment Variables

Configure storage via environment variables:

- `LOCAL_STORAGE_PATH` - Local storage directory (default: `./storage`)
- `LOCAL_STORAGE_PUBLIC_URL` - Public URL prefix (default: `/storage`)
- `WASABI_ENDPOINT` - S3 endpoint URL
- `WASABI_REGION` - S3 region
- `WASABI_BUCKET` - S3 bucket name
- `WASABI_ACCESS_KEY` - S3 access key
- `WASABI_SECRET_KEY` - S3 secret key
- `CDN_URL` - Optional CDN URL for public assets

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