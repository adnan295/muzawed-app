# Overview

This project is a wholesale e-commerce mobile application named "Sary" (ساري), specifically designed for the Syrian market. It enables businesses and facilities to purchase products in bulk at wholesale prices. The application offers a comprehensive e-commerce experience, including product browsing, shopping cart functionality, secure checkout, order management, a wallet system for prepayments, and robust user authentication.

The application is a full-stack TypeScript project, featuring a React frontend (built with Vite) and an Express.js backend. It uses PostgreSQL as its database, managed through Drizzle ORM. The UI is styled with Tailwind CSS and leverages shadcn/ui components, providing full right-to-left (RTL) support for the Arabic language.

Key regional considerations include:
- **Currency:** Syrian Pound (ل.س - SYP)
- **Locale:** ar-SY
- **Regions:** Supports various Syrian governorates (محافظات سورية)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework & Build:** React 18 with TypeScript, Vite for fast development and bundling. Mobile-first responsive design targeting phone form factors (max-width: 768px), with RTL layout support for Arabic.
- **Routing & State Management:** Wouter for client-side routing. TanStack Query for server state management, caching, and data fetching. Local storage-based AuthContext for user session persistence.
- **UI Component System:** shadcn/ui (New York style) built on Radix UI primitives. Tailwind CSS v4 with a purple/blue brand palette. Class Variance Authority (CVA) for component variants, Lucide icons, and Framer Motion for animations.
- **Key Design Decisions:** Mobile-only layout with a bottom navigation bar. Path aliases (`@/`, `@shared/`). Custom Vite plugin and Replit-specific tooling for development environments.

## Backend Architecture
- **Server Framework:** Express.js with Node.js HTTP server. Middleware for JSON parsing and custom logging.
- **API Design:** RESTful API under `/api` prefix, organized by resource. Zod for validation error handling. Infrastructure for session-based authentication is present.
- **Database Layer:** Drizzle ORM for type-safe queries with PostgreSQL (via `DATABASE_URL`). Node-postgres (pg) driver with connection pooling. Shared TypeScript schemas ensure type safety across client and server.
- **Storage Abstraction:** A storage interface (`server/storage.ts`) abstracts database operations, supporting CRUD on major entities and transactions.
- **Key Design Decisions:** Separation of database connection from storage logic. Schema-first approach with Drizzle. Production build externalizes most dependencies for faster cold starts. Static file serving with SPA fallback.

## Data Model
- **Core Entities:** `users` (phone-based auth, facility info), `addresses`, `wallets`, `walletTransactions`, `paymentCards`. `products` (inventory, pricing, MOQ, stock), `categories`, `brands`. `cartItems`, `orders`, `orderItems`.
- **Schema Design Decisions:** Serial primary keys, `createdAt` timestamps, Decimal type for monetary values. Foreign key cascades. Drizzle Zod integration for runtime validation.

## Multi-Warehouse Architecture
- **Tables:** `cities` (Syrian cities with governorates), `warehouses` (one per city), `productInventory` (product-warehouse stock levels).
- **Features:** Products are displayed based on the user's selected city and its associated warehouse. Admin CRUD for cities and warehouses. API for filtering products by city.

## Supplier Ledger System
- **Tables:** `supplier_transactions` (imports, exports, payments), `supplier_stock_positions` (inventory levels per supplier/product/warehouse), `supplier_balances` (materialized balance summary).
- **Features:** Records goods imports/exports, payments to suppliers. Automatic balance recalculation. Supplier dashboard with balance, stock, and transaction history.
- **Balance Calculation:** Outstanding Balance = Total Imports - Total Exports - Total Payments.

## Product Profit/Loss Report System
- **API Endpoint:** `GET /api/reports/product-profit` for comprehensive profit/loss analysis.
- **Report Summary Data:** Includes `totalRevenue`, `totalCost`, `totalProfit`, `avgMargin`, `totalSoldQty`, `totalStockQty`.
- **Product Breakdown Data:** Detailed metrics per product: `stockQty`, `soldQty`, `revenue`, `cost`, `profit`, `margin`, `salePrice`, `avgCostPrice`.
- **Automatic Sales Allocation:** Uses FIFO to allocate sales to supplier accounts based on original cost price for accurate profit calculation.
- **Admin Dashboard:** Features a UI with KPIs, interactive charts (Top 10 products by profit, Revenue vs Cost), and a detailed product-by-product breakdown table with color-coded profit margins.

## Other Key Features
- **Notifications System:** Full CRUD API for managing user notifications.
- **Activity Logs:** System for tracking user and system activities.
- **Inventory Management:** API for low-stock alerts and inventory adjustments.
- **Banners/Slides Management:** `banners` table with scheduling, view/click tracking, target audience. Full CRUD API, duplicate, reorder, bulk-delete, stats. Admin dashboard "الشرائح" tab with KPIs, search/filter, bulk actions, scheduling, target audience, templates, live preview. `AdsCarousel` component with analytics.
- **Configurable Delivery Fee System:** `deliverySettings` table with per-warehouse base fees, free thresholds (amount or quantity). `orders.deliveryFee` field. Admin dashboard "الإعدادات" tab for CRUD on delivery settings. Checkout page integrates automatic delivery fee calculation.
- **Staff Management:** `staff` table with employee data. Full CRUD API for staff. Admin dashboard "الموظفين" tab with KPIs, advanced filtering, add/edit/delete staff dialogs, and comprehensive permissions management for various modules (orders, products, customers, etc.).
- **Full Registration System:** Registration requires phone number (+963), facility name, password, and location (via OpenStreetMap + Leaflet picker). Password-based authentication with bcrypt hashing for customer accounts. Password change functionality in Settings page.
- **Favorites System:** `favorites` table with userId and productId references. Full CRUD API (`/api/favorites/:userId`, POST/DELETE). ProductCard component includes heart icon for add/remove favorites. Real-time favorites count in Profile page and Favorites page connected to backend.
- **Profile Page Backend Integration:** All profile menu buttons connected to backend. Favorites count, notification unread count displayed with badges. FacilityDetails page fetches/updates user data from API. Notifications page loads real notifications from database.
- **Terms & Conditions Page:** `/terms` route with policies for privacy, delivery, returns, payment methods, minimum orders, and general terms.
- **Future Enhancement - WhatsApp OTP Verification:** Planned feature to add phone verification via WhatsApp using Twilio. Requires Twilio account setup (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, VERIFY_SERVICE_SID). Implementation plan: add verification_requests table, POST /api/auth/send-otp and /api/auth/verify-otp endpoints, two-step login UI with OTP input.

# External Dependencies

- **Database:** PostgreSQL, Drizzle Kit (for migrations).
- **UI Libraries:** @radix-ui/*, Tailwind CSS, Google Fonts (Almarai), Embla Carousel.
- **Development Tools:** @replit/* plugins, tsx, esbuild, Vite.
- **Authentication & Session:** connect-pg-simple (for PostgreSQL session store).
- **Utilities:** zod, date-fns, nanoid, class-variance-authority, clsx.
- **Notably Absent Integrations (by design/current scope):** Payment gateway integration, dedicated email service, WebSocket implementation (despite infrastructure), advanced file upload handling.
```