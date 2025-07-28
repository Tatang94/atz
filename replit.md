# Indonesian Pulsa and Payment App

## Overview

This is a modern Indonesian pulsa and payment application built with React, Express.js, and Drizzle ORM. The app provides a platform for purchasing mobile credit (pulsa), data packages, PLN tokens, game vouchers, and e-wallet top-ups using the Digiflazz API for product fulfillment and PayDisini for payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 28, 2025
- ✅ Successfully migrated Indonesian pulsa application from Replit Agent to Replit environment
- ✅ Created mobile-first admin dashboard with configuration management:
  - Real-time statistics dashboard (transactions, revenue, products, users)
  - API Digiflazz configuration interface in admin panel
  - Database URL configuration for Supabase/Neon setup
  - Product synchronization and management tools
  - Mobile-optimized responsive design with 3-tab layout
- ✅ Rebuilt homepage from scratch with clean design:
  - Category-based product selection (Pulsa, Data, PLN, Game, E-wallet)
  - Automatic operator detection from phone numbers
  - Real-time product display from Digiflazz API
  - Removed demo/mock data, using only authentic data sources
  - Clean UI/UX with status alerts for API configuration
- ✅ Enhanced API integration and configuration:
  - Dynamic environment variable setting through admin panel
  - API status monitoring and validation
  - Test connectivity features for Digiflazz API
  - Improved error handling and user feedback
  - Admin-controlled API key and database URL management
- ✅ Fixed TypeScript errors and improved code structure
- ✅ Fixed fetch API errors for GET requests
- ✅ Removed sync buttons and API messages from homepage
- ✅ Removed admin panel links from navigation menu
- ✅ Removed login/register system - transactions now work without user accounts
- ✅ Simplified header to show "Instant Transactions Without Account"
- ✅ Application ready for production with clean user interface

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom Indonesian-themed color palette
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL session store
- **API Design**: RESTful API with centralized error handling

### Key Components

#### Database Schema
- **Users Table**: Stores user accounts with roles (user, reseller, admin), balance tracking, and authentication data
- **Transactions Table**: Comprehensive transaction logging with status tracking, payment references, and Digiflazz integration
- **Products Table**: Product catalog synchronized from Digiflazz API with pricing tiers and availability status

#### External Service Integrations
- **Digiflazz API**: Primary service for product fulfillment (pulsa, data, PLN, gaming)
  - Product synchronization and pricing updates
  - Transaction processing and status tracking
  - Balance management and real-time inventory
- **PayDisini Gateway**: Payment processing service
  - Multiple payment method support (bank transfer, e-wallets, QRIS)
  - Secure payment URL generation
  - Transaction status webhooks

#### Authentication & Authorization
- Session-based authentication using PostgreSQL session store
- Role-based access control (user, reseller, admin)
- Secure password handling and user management

### Data Flow

1. **Product Management**: Products are synchronized from Digiflazz API and stored locally with pricing markup for different user roles
2. **Transaction Processing**: 
   - User selects product and payment method
   - Transaction record created with pending status
   - Payment URL generated via PayDisini
   - Upon payment confirmation, order sent to Digiflazz
   - Transaction status updated based on fulfillment result
3. **Real-time Updates**: Transaction status polling and webhook handling for payment confirmations

### External Dependencies

#### Core Framework Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for server state management
- Wouter for client-side routing
- Zod for schema validation

#### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

#### Backend Dependencies
- Express.js for HTTP server
- Drizzle ORM for database operations
- Neon Database serverless driver
- Connect-pg-simple for session management

#### Build and Development Tools
- Vite for frontend bundling and development
- TypeScript for type safety
- ESBuild for backend compilation
- PostCSS and Autoprefixer for CSS processing

### Deployment Strategy

#### Development Environment
- Vite development server with Hot Module Replacement
- Express server with middleware integration
- Automatic TypeScript compilation
- Environment-based configuration

#### Production Build Process
1. Frontend assets built with Vite to `dist/public`
2. Backend compiled with ESBuild to `dist/index.js`
3. Static file serving integrated with Express
4. Database migrations handled via Drizzle Kit

#### Environment Configuration
- Database URL configuration for Neon Database
- API keys for Digiflazz and PayDisini services
- Session secrets and security configurations
- Production vs development feature flags

The application follows a monorepo structure with shared TypeScript definitions between client and server, ensuring type safety across the full stack. The architecture supports horizontal scaling through serverless database connections and stateless session management.