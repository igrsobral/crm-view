# Contactly CRM MVP

A lightweight Customer Relationship Management system built with Vue.js 3, Pinia, and Supabase.

## Features

- Contact Management
- Deal Pipeline Tracking
- Activity Logging and Follow-ups
- Dashboard with Analytics
- Data Import/Export
- Mobile Responsive Design

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **State Management**: Pinia
- **Backend/Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Authentication**: Supabase Auth

## Project Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
   - The project includes a `.env` file with placeholder values
   - To use the full functionality, replace the placeholder values with your actual Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
   - You can find these values in your Supabase project settings
   - The app will run without these credentials but authentication and database features will be disabled

### Development

```sh
npm run dev
```

### Build for Production

```sh
npm run build
```

### Lint

```sh
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── common/         # Shared UI components
│   ├── contacts/       # Contact-specific components
│   ├── deals/          # Deal pipeline components
│   ├── activities/     # Activity tracking components
│   └── dashboard/      # Dashboard components
├── stores/             # Pinia state management
├── views/              # Route-level components
├── router/             # Vue Router configuration
├── composables/        # Reusable composition functions
└── utils/              # Utility functions and constants
```

## Database Setup

The application requires the following Supabase tables:
- `contacts` - Customer/prospect information
- `deals` - Sales opportunities and pipeline
- `activities` - Interactions and follow-ups

Database schema and setup instructions will be provided in the implementation tasks.