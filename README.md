# Klaro Booking System

A production-oriented product-rental monorepo with secure cookie authentication, email verification, password recovery, role-based access, stock-aware reservations, and a responsive inventory dashboard.

## Organization onboarding and isolation

New accounts are intentionally created without an organization. After email verification and first login, the frontend routes them to `/onboarding/organization`. Creating an organization atomically attaches the account, promotes the creator to organization admin, refreshes the authenticated session, and opens the dashboard.

Products, SKUs, bookings, availability calculations, and admin user queries are scoped by organization in backend services. A user cannot access another organization's inventory or rentals by changing request identifiers. Existing installations are migrated into a default organization so prior data remains connected.

## Stack

- Next.js 16 App Router, React 19, Tailwind CSS 4, React Hook Form, and Zod
- NestJS 11, JWT, Argon2, class-validator, Swagger, and rate limiting
- PostgreSQL 17 and Prisma ORM 7
- npm workspaces with a single root dependency installation

NestJS 11 is intentionally used because the current stable `@nestjs/config` package does not yet declare compatibility with NestJS 12. This keeps the installation peer-clean.

## Structure

```text
api/        NestJS API, Prisma schema, migration, and seed
frontend/   Next.js application and component tests
```

## Local setup

1. Copy `.env.example` to `.env` and replace both JWT secrets.
2. Start PostgreSQL and Mailpit: `docker compose up -d`.
3. Install all workspace dependencies: `npm install`.
4. Generate the Prisma client: `npm run db:generate`.
5. Apply the database migration: `npm run db:migrate`.
6. Optionally create the development admin: `npm run db:seed`.
7. Start both applications: `npm run dev`.

The frontend runs at `http://localhost:3000`, the API at `http://localhost:3001/api/v1`, Swagger at `http://localhost:3001/api/docs`, and local email previews at `http://localhost:8025`.

The seed account is `admin@example.com` / `ChangeMe123!`. Change this password immediately outside local development.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run API and frontend together |
| `npm run build` | Generate Prisma Client and production-build both apps |
| `npm run lint` | Lint both workspaces |
| `npm test` | Run backend and frontend tests |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:seed` | Seed the local admin account |

## Security model

Passwords use Argon2. Access and rotating refresh tokens are stored only in HTTP-only cookies; refresh sessions and one-time email tokens are stored as SHA-256 digests. Mutating authenticated requests use a double-submit CSRF token. Auth endpoints are rate-limited, protected resources use authentication and role guards, password resets revoke active sessions, and API errors use a consistent envelope.

For production, set `COOKIE_SECURE=true`, use long random JWT secrets, configure a real SMTP provider, allow only the deployed frontend origin, and terminate TLS at the ingress.

## Flexible products

Products use common inventory fields (`SKU`, name, category, total quantity, active state) plus a JSON metadata object. Metadata can describe any domain without database changes—for example a car's fuel type and seats, a notebook's CPU and RAM, or a tool's power and weight. A booking can reserve multiple products with different quantities.

Admins manage the catalog through `/dashboard/products`. Active products are available to users when creating a rental.

## Rental conflict safety

Creation and time/item edits run in serializable transactions and acquire PostgreSQL advisory transaction locks for every requested product in stable ID order. Availability is calculated by summing quantities from all overlapping active bookings. This allows valid overlaps while inventory remains and prevents concurrent requests from overbooking stock. Cancelled bookings remain in history and immediately release their reserved quantities.

## Testing

`npm test` covers booking interval validation, overlap detection, ownership enforcement, and frontend booking-form validation. Integration tests require a disposable PostgreSQL database and can be added under `api/test` using the provided Jest toolchain.
