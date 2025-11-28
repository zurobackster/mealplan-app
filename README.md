# Meal Planner App

A modern web application for weekly meal planning with intuitive drag-and-drop functionality.

## Features

- 📅 **Weekly Planner** - Plan meals for each day of the week (Monday-Sunday)
- 🍳 **Meal Slots** - Organize by Breakfast, Lunch, Dinner, and Others
- 🎨 **Visual Meal Catalog** - Browse meals by category with images and ratings
- ✨ **Drag & Drop** - Easily add meals to your weekly plan
- 📝 **Recipe Management** - Store recipes with each meal
- 🎯 **Categories** - Organize meals by type (Breakfast Foods, Main Dishes, Desserts, Snacks)
- 🔒 **Simple Authentication** - Secure single-user access
- 💾 **Auto-save** - All changes automatically saved

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** SQLite (Prisma ORM)
- **UI Library:** Mantine UI
- **Drag & Drop:** dnd-kit
- **Authentication:** iron-session + bcrypt
- **Image Handling:** react-easy-crop

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL="file:./dev.db"
   SESSION_SECRET="your-super-secret-key-min-32-chars"
   NODE_ENV="development"
   ```

4. Run database migration and seed:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

- **Username:** admin
- **Password:** admin123

## Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio (database GUI)
```

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   ├── login/          # Login page
│   ├── planner/        # Main planner page
│   └── layout.tsx      # Root layout
├── components/          # React components
│   ├── meals/          # Meal catalog components
│   ├── planner/        # Weekly planner components
│   └── modals/         # Modals (edit, create, crop)
├── lib/                # Utility functions
│   ├── auth/           # Authentication helpers
│   ├── db/             # Database client
│   └── utils/          # Helper functions
├── prisma/             # Database schema and migrations
└── public/             # Static files
```

## Development

For detailed development guidance, see [CLAUDE.md](CLAUDE.md).

## License

Private project for personal use.
