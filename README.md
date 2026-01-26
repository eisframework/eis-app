# Elysia Inertia Svelte (EIS)

A modern full-stack framework combining Elysia, Inertia.js and Svelte for building fast, type-safe web applications with seamless SPA experience.

## Features

- **Full-Stack TypeScript** - End-to-end type safety with TypeScript
- **Elysia Backend** - Fast, lightweight Bun-based web framework
- **Svelte Frontend** - Reactive component-based UI with Svelte 5
- **Inertia.js** - SPA-like experience without building a separate API
- **Server-Side Rendering** - SEO-friendly with Eta template engine
- **Authentication** - Built-in auth system with middleware
- **Email** - Multi-adapter email service (Resend & SMTP)
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
- **Sharp** - High-performance image processing
- **Resend** - Email service provider
- **Nodemailer** - SMTP email transport
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

### Quick Start (Recommended)

```bash
# Create a new EIS project
bun create eis my-app

cd my-app

# Install dependencies
bun install

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Manual Installation

```bash
# Clone the repository
git clone <repository-url> my-app
cd my-app

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
```

### Building

```bash
# Build for production
bun run build

# Build frontend only
bun run build:frontend 
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
│   │   ├── auth.controller.ts      # Authentication (login, register, logout, password reset)
│   │   ├── dashboard.controller.ts # Dashboard & profile pages
│   │   ├── google-auth.controller.ts # Google OAuth integration
│   │   ├── public.controller.ts    # Public pages (landing, home, about)
│   │   ├── upload.controller.ts    # File upload (images & files)
│   │   └── users.controller.ts     # User management
│   ├── database/           # Database setup
│   │   ├── migrations/
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   └── schema.ts              # Database schemas (users, sessions, assets, passwordResetTokens)
│   │   ├── index.ts
│   │   └── migrate.ts
│   ├── inertia/            # Inertia handlers
│   │   ├── handler.ts
│   │   ├── index.ts
│   │   └── response.ts 
│   ├── routes/              # Route definitions
│   │   ├── web/
│   │   │   ├── auth.ts 
│   │   │   └── public.ts
│   │   └── index.ts
│   ├── services/           # Business logic services
│   │   ├── auth.service.ts         # Authentication (login, register, password reset, OAuth)
│   │   ├── eta.service.ts         # Eta template engine (SSR)
│   │   ├── flash.service.ts       # Flash messages
│   │   ├── inertia.service.ts     # Inertia.js integration
│   │   ├── google-oauth.service.ts # Google OAuth service
│   │   ├── resend.service.ts      # Resend email provider
│   │   ├── smtp.service.ts        # SMTP email transport
│   │   ├── s3.service.ts          # S3-compatible storage
│   │   └── storage.service.ts     # Local file storage
│   ├── utils/               # Utility functions
│   ├── views/               # Eta HTML templates (SSR)
│   │   ├── about.html
│   │   ├── contact.html
│   │   ├── features.html
│   │   ├── home.html
│   │   ├── index.html
│   │   ├── inertia.html
│   │   ├── pricing.html
│   │   └── partials/        # Reusable HTML partials 
│   └── app.ts          # Server entry point
├── frontend/              # Svelte frontend
│   ├── components/        # Reusable components
│   │   ├── Layout.svelte 
│   │   └── NavLink.svelte
│   ├── pages/            # Inertia pages
│   │   ├── auth/          # Authentication pages
│   │   ├── errors/        # Error pages
│   │   ├── users/         # User management pages
│   │   ├── about.svelte
│   │   ├── dashboard.svelte
│   │   ├── home.svelte
│   │   └── profile.svelte
│   ├── entry/            # Frontend entry point
│   │   ├── app.ts
│   │   ├── index.ts
│   │   └── style.css
│   └── vite-env.d.ts      # Vite TypeScript declarations
├── data/                 # Database files (SQLite)
├── public/               # Static assets
├── storage/              # File storage (local uploads)
├── tests/                # Test files
│   ├── backend/          # Backend tests
│   ├── frontend/         # Frontend tests
│   ├── integration/      # Integration tests
│   ├── unit/             # Unit tests
│   ├── utils/            # Test utilities
│   └── setup.ts          # Test setup
├── types/                # TypeScript definitions
│   ├── controller.types.ts
│   └── inertia.d.ts
├── workflow/             # Workflow configurations
├── .env.example          # Environment variables template
├── .env.production       # Production environment
├── .env.test             # Test environment
├── .gitignore
├── bun.lock              # Dependency lock file
├── CLAUDE.md             # Claude AI configuration
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json          # Project dependencies
├── svelte.config.js      # Svelte configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── vitest.config.ts      # Vitest configuration
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

# Email Service
APP_URL=http://localhost:3000
EMAIL_FROM=no-reply@example.com

# Email Provider (Resend)
RESEND_API_KEY=your-resend-api-key

# Email Provider (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development servers (backend + frontend) |
| `bun run build` | Build for production |
| `bun run build:frontend` | Build frontend only | 
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

See the [Controller Guide](https://eisframework.github.io/guide/controllers) for detailed instructions.

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

See the [Deployment Guide](https://eisframework.github.io/guide/deployment) for detailed instructions.

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

## Email Service

The project supports email sending with two provider options:

### Resend (Recommended for Production)

For production environments, use Resend as your email provider:

```typescript
import { send } from '../services/resend.service'

await send(
  'user@example.com',
  'Welcome!',
  '<h1>Hello!</h1>',
  'Hello!'
)
```

### SMTP (For Development or Custom Mail Servers)

For development or custom SMTP servers:

```typescript
import { send } from '../services/smtp.service'

await send(
  'user@example.com',
  'Welcome!',
  '<h1>Hello!</h1>',
  'Hello!'
)
```

### Switching Between Providers

Simply change the import to switch between email providers. Both services have the same API:

```typescript
// Resend
import { send } from '../services/resend.service'

// SMTP
import { send } from '../services/smtp.service'
```

### Environment Variables

Configure email service via environment variables:

- `APP_URL` - Application URL for generating links (default: `http://localhost:3000`)
- `EMAIL_FROM` - Default sender email address
- `RESEND_API_KEY` - Resend API key (for Resend provider)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port (default: 587)
- `SMTP_SECURE` - Use SSL/TLS (default: false)
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password

### Usage Example

Sending emails with attachments:

```typescript
await send(
  'user@example.com',
  'Document Attached',
  '<h1>Your Document</h1>',
  'Your document is attached.',
  {
    attachments: [{
      filename: 'document.pdf',
      content: Buffer.from('file content')
    }]
  }
)
```

## Documentation

Full documentation is available at:

https://eisframework.github.io/guide/ 

Key topics:
- Getting Started
- Architecture
- Database Guide
- Testing Guide
- Quick Reference
- FAQ

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See the [Contributing Guide](https://eisframework.github.io/guide/contributing) for detailed guidelines.

## License

This project is licensed under the MIT License.

## Support

For questions and support, please open an issue on GitHub.

## Acknowledgments

- [Elysia](https://elysiajs.com/) - The amazing web framework
- [Svelte](https://svelte.dev/) - The reactive UI framework
- [Inertia.js](https://inertiajs.com/) - The modern monolith SPA solution
- [Bun](https://bun.sh/) - The fast JavaScript runtime