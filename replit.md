# Overview

This is a wholesale e-commerce mobile application called "Sary" (ساري) built for the Saudi Arabian market. The application is designed for businesses and facilities to purchase bulk products at wholesale prices. It features a complete e-commerce flow including product browsing, shopping cart, checkout, order management, wallet system, and user authentication.

The application is built as a full-stack TypeScript application with a React frontend (using Vite) and an Express.js backend, with PostgreSQL as the database layer managed through Drizzle ORM. The UI is styled with Tailwind CSS and uses shadcn/ui components, with right-to-left (RTL) Arabic language support throughout.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Right-to-left (RTL) layout support with Arabic language as the primary language
- Mobile-first responsive design targeting phone form factors (max-width: 768px)

**Routing & State Management**
- Wouter for lightweight client-side routing without React Router overhead
- TanStack Query (React Query) for server state management, caching, and data fetching
- Local storage-based authentication context for user session persistence
- Custom AuthContext provider wrapping the application for authentication state

**UI Component System**
- shadcn/ui component library (New York style variant) with Radix UI primitives
- Tailwind CSS v4 with custom design tokens aligned to a purple/blue brand palette
- Class Variance Authority (CVA) for component variant management
- Lucide icons for consistent iconography
- Framer Motion for animations and transitions

**Key Design Decisions**
- Mobile-only layout with bottom navigation bar for core sections (Home, Categories, Cart, Profile)
- Path aliases configured for clean imports (`@/` for client code, `@shared/` for shared schemas)
- Custom Vite plugin for meta image URL updates in Replit deployment environments
- Replit-specific development tooling (cartographer, dev banner) enabled only in development

## Backend Architecture

**Server Framework**
- Express.js as the HTTP server framework
- Node.js HTTP server for WebSocket support capability
- Middleware stack includes JSON body parsing with raw body preservation for webhook handling
- Custom logging middleware for API request tracking with timestamps

**API Design**
- RESTful API structure under `/api` prefix
- Route organization in `server/routes.ts` with grouped endpoints by resource
- Error handling with Zod validation error formatting using `zod-validation-error`
- Session-based authentication approach (infrastructure for sessions visible but not fully implemented)

**Database Layer**
- Drizzle ORM as the type-safe query builder and schema manager
- PostgreSQL as the relational database (configured via `DATABASE_URL` environment variable)
- node-postgres (pg) driver with connection pooling
- Database schema defined in shared TypeScript files for type safety across client/server

**Storage Abstraction**
- Storage interface pattern (`server/storage.ts`) abstracting database operations
- Methods for CRUD operations on all major entities (users, products, categories, orders, etc.)
- Transaction support for complex operations like order creation

**Key Design Decisions**
- Separation of database connection (`db.ts`) from storage operations for testability
- Schema-first approach with Drizzle schemas driving both database migrations and TypeScript types
- Build process bundles select dependencies while externalizing most for faster cold starts
- Static file serving from `dist/public` in production with SPA fallback routing

## Data Model

**Core Entities**

Users & Authentication:
- `users`: Phone-based authentication with facility information (commercial register, tax number)
- `addresses`: Multiple delivery addresses per user with default flag
- `wallets`: Per-user wallet for prepayment and credit
- `walletTransactions`: Transaction history for wallet operations
- `paymentCards`: Saved payment methods for users

Product Catalog:
- `products`: Product inventory with pricing, images, minimum order quantities, and stock levels
- `categories`: Product categorization with icons and color themes
- `brands`: Brand information for product attribution

Shopping & Orders:
- `cartItems`: Session shopping cart items linked to users
- `orders`: Order records with status, totals, and delivery information
- `orderItems`: Line items for each order with quantity and pricing snapshots

**Schema Design Decisions**
- Serial primary keys for all tables
- Timestamps (`createdAt`) on transactional tables
- Decimal type for monetary values to avoid floating-point precision issues
- Foreign key cascades for dependent data (e.g., cart items delete when user is deleted)
- Drizzle Zod integration for runtime validation of insert operations

## External Dependencies

**Database**
- PostgreSQL (provisioned via `DATABASE_URL` environment variable)
- Drizzle Kit for schema migrations to `/migrations` directory

**UI Libraries**
- @radix-ui/* primitives for accessible UI components (17+ packages)
- Tailwind CSS for utility-first styling with postcss and autoprefixer
- Google Fonts (Almarai) for Arabic typography
- Embla Carousel for promotional image carousels

**Development Tools**
- @replit/* plugins for Replit-specific development features
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Vite for client bundling

**Authentication & Session Management**
- connect-pg-simple for PostgreSQL session store (infrastructure present)
- Passport.js architecture visible but authentication currently implemented with direct password comparison

**Utilities**
- zod for schema validation
- date-fns for date manipulation
- nanoid for unique ID generation
- class-variance-authority and clsx for className management

**Notable Absence**
- Payment gateway integration intentionally not implemented per user preference - uses wallet/cash on delivery only
- No email service integration (nodemailer present but unused)
- No file upload handling beyond multer dependency
- No WebSocket implementation despite server infrastructure

## Multi-Warehouse Architecture

**Database Tables**
- `cities`: Saudi cities with region and active status (18 major cities)
- `warehouses`: Warehouse details linked to cities (one warehouse per city)
- `productInventory`: Join table linking products to warehouses with per-warehouse stock levels

**Key Features**
- Each city has ONE warehouse, ensuring customers see only products from their city's warehouse
- Products can be assigned to multiple warehouses with different stock levels
- Admin dashboard includes full CRUD for cities and warehouses management
- API endpoints for filtering products by city (`/api/products/by-city/:cityId`)

## Recent Updates

**December 2024**
- Added multi-warehouse architecture with cities and warehouses management
- Admin dashboard: Cities and Warehouses tab with real data CRUD operations
- Added notifications system with full CRUD API endpoints
- Added activity logs tracking system
- Added inventory management with low-stock alerts API
- Enhanced reports tab with advanced charts (composed charts, pie charts, funnel charts, area charts)
- Added scheduled reports management UI