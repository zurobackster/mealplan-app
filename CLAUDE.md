# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meal Planner is a desktop-focused web application for weekly meal planning with drag-and-drop functionality. Built with Next.js App Router, TypeScript, Prisma, and Mantine UI.

**Key Technologies:**
- Next.js 15+ (App Router)
- TypeScript
- Prisma ORM with SQLite (MVP) / Vercel Postgres (Production)
- Mantine UI component library
- dnd-kit for drag and drop
- iron-session for authentication
- bcryptjs for password hashing
- react-easy-crop for image handling

## Common Development Commands

### Running the Application
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Commands
```bash
npm run db:migrate   # Create and run new migration
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
npx prisma generate  # Regenerate Prisma Client after schema changes
```

### Default Credentials
- Username: `admin`
- Password: `admin123`

## Architecture & Key Patterns

### Database Schema

The application uses 5 main models:

1. **User** - Single admin user with hashed password
2. **Category** - Meal categories (Breakfast Foods, Main Dishes, Desserts, Snacks)
3. **Meal** - Individual meals with title, rating, image, recipe, and category
4. **WeeklyPlan** - Represents a week starting from Monday
5. **PlannedMeal** - Links meals to specific day/slot in weekly plan

**Key Relationships:**
- Meals belong to Categories (nullable - meals can be orphaned)
- PlannedMeals belong to WeeklyPlan and reference Meals
- Each PlannedMeal has a `dayOfWeek` (1-7, Monday=1) and `slot` (BREAKFAST, LUNCH, DINNER, OTHER)

### Application Structure

```
app/
  api/              # API routes
    auth/           # Authentication endpoints
    categories/     # Category CRUD
    meals/          # Meal CRUD
    weekly-plans/   # Weekly plan endpoints
    planned-meals/  # Planned meal endpoints
    upload/         # Image upload handler
  login/            # Login page
  planner/          # Main planner page
  layout.tsx        # Root layout with Mantine provider

components/
  meals/            # Meal catalog components
  planner/          # Weekly planner components
  modals/           # Shared modals (meal editor, category manager, image cropper)
  common/           # Shared UI components

lib/
  auth/             # Authentication utilities (session, password hashing)
  db/               # Prisma client singleton
  utils/            # Helper functions (date, upload, etc.)
  api/              # API client helpers

prisma/
  schema.prisma     # Database schema
  seed.ts           # Seed script
```

### Authentication Pattern

Uses custom lightweight auth with iron-session:
- Session stored in encrypted HTTP-only cookie
- Middleware protects all routes except `/login` and `/api/auth/*`
- Password hashed with bcrypt (10 rounds)

**Session Management:**
```typescript
// lib/auth/session.ts contains session config
// Use getIronSession() to access session in route handlers
// Middleware in app/middleware.ts handles redirects
```

### Drag & Drop Implementation

Uses @dnd-kit for drag and drop:

**Drop Zone ID Format:**
```typescript
`${dayOfWeek}-${slot}`  // e.g., "1-BREAKFAST", "3-DINNER"
```

**Key Concepts:**
- Meals in catalog are draggable
- Week planner has droppable zones for each day/slot
- Supports drag from catalog to planner
- Supports reordering within slots
- Supports moving between slots/days

### Optimistic UI Pattern

All planner changes use optimistic updates:
```typescript
1. Update UI immediately
2. Call API
3. On error: rollback UI and show notification
4. On success: keep optimistic update
```

### Date Utilities

Week-based planning always starts on Monday:
- `getMonday(date)` - Find Monday of given week
- `formatWeekRange(monday)` - Format as "Jan 1 - Jan 7"
- `getDayOfWeek(date)` - Returns 1-7 (Monday=1)

### Image Handling

**MVP:** Images saved to `/public/uploads/`
**Production:** Will use Cloudinary or similar

Images must be cropped to 1:1 aspect ratio using react-easy-crop before upload.

## UI/UX Design Principles

- **Clean & Modern:** Minimal aesthetic with subtle shadows, rounded corners
- **Glassmorphism:** Elevated components (modals, cards) have glass effect
- **Smooth Animations:** Card flips, drag effects, spring animations
- **Color Palette:** Violet primary (#9c27b0), vibrant category colors
- **Layout:** 60% left (meal catalog) / 40% right (weekly planner)

### Component Patterns

**Meal Cards:**
- Square aspect ratio (1:1)
- Image occupies 70% height, title+rating 30%
- Flip on click to show recipe (back)
- ESC key closes card back
- Hover effect: lift + glow

**Weekly Planner:**
- 7 columns (Monday-Sunday)
- 4 fixed slots per day (Breakfast, Lunch, Dinner, Others)
- Drop zones highlight on drag-over
- Planned meals show as compact cards with thumbnails

## Important Notes

- This is a **single-user application** - authentication is simple by design
- **Desktop-only** - no responsive mobile layout needed
- **Autosave** - all planner changes auto-save to database
- **Toast Notifications** - use Mantine's notification system for feedback
- **Error Handling** - always provide user feedback and graceful rollback

## Environment Variables

Required in `.env.local`:
```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-super-secret-key-min-32-chars"
NODE_ENV="development"
```

## Common Tasks

### Adding a new API route
1. Create route handler in `app/api/[resource]/route.ts`
2. Use Prisma client from `lib/db/prisma.ts`
3. Handle errors with try/catch and return appropriate status codes
4. Protected routes should verify session first

### Creating a new component
1. Determine if it's meal-related, planner-related, or shared
2. Place in appropriate directory under `components/`
3. Use Mantine UI components for consistency
4. Extract common patterns into shared components

### Database schema changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:migrate` (creates migration)
3. Update `prisma/seed.ts` if needed
4. Regenerate types with `npx prisma generate`

### Testing drag and drop
- Drag meal from catalog to any day/slot
- Drag between different slots
- Drag to reorder within same slot
- Verify autosave happens on each change
- Test error handling (disconnect network, verify rollback)
