# Grounded Warriors

## Overview

Grounded Warriors is a website for a men's healing retreat focused on trauma recovery, father wound work, and reconnection through nature. The site features a dark, forest-themed design that evokes quiet strength and grounded calm. It includes pages for retreat information, past events galleries, contact forms, and newsletter subscriptions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with custom CSS variables for the forest-themed color palette
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and scroll animations
- **State Management**: TanStack React Query for server state and data fetching
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **API Pattern**: RESTful endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod schemas shared between frontend and backend via `drizzle-zod`

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend with API routes
- `shared/` - Shared TypeScript types and database schemas
- `attached_assets/` - Static images and design assets

### Data Models
- **Users**: Basic authentication schema (id, username, password)
- **Contact Submissions**: Form submissions with name, email, message, timestamp
- **Newsletter Subscriptions**: Email subscriptions with timestamp

### Build Process
- Development: Vite dev server with HMR proxied through Express
- Production: Vite builds static assets, esbuild bundles server code

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: PostgreSQL session storage (available but not currently used)

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching
- **framer-motion**: Animation library
- **embla-carousel-react**: Image carousels for retreat galleries
- **date-fns**: Date formatting utilities

### UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS v4**: Utility-first CSS framework
- **Lucide React**: Icon library

### Fonts
- **Cormorant Garamond**: Serif font for headings (Google Fonts)
- **Inter**: Sans-serif font for body text (Google Fonts)