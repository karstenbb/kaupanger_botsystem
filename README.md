# Kaupanger Botsystem ⚽💰

A football team fine management mobile app with full backend API. One admin manages players, fines, and payments — all other users have read-only access.

---

## Architecture Overview

```
kaupanger_botsystem/
├── backend/                    # Node.js + Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # Database models (User, Player, FineType, Fine)
│   │   └── seed.ts             # Demo data + admin user seeding
│   └── src/
│       ├── config/             # Environment configuration
│       ├── controllers/        # Route handlers (auth, players, fines, etc.)
│       ├── middleware/         # Auth + error handling middleware
│       ├── routes/             # Express route definitions
│       ├── services/           # Prisma client
│       ├── utils/              # JWT helpers
│       ├── app.ts              # Express app setup
│       └── index.ts            # Server entry point
│
└── mobile/                     # React Native (Expo) mobile app
    ├── src/
    │   ├── api/                # API client + endpoint modules
    │   ├── components/         # Reusable UI components
    │   ├── context/            # AuthContext (global auth state)
    │   ├── navigation/         # Tab + stack navigators
    │   ├── screens/            # All app screens
    │   ├── theme/              # Colors, spacing, typography
    │   └── types/              # TypeScript interfaces
    └── App.tsx                 # App entry point
```

---

## Tech Stack

| Layer      | Technology                         |
| ---------- | ---------------------------------- |
| Frontend   | React Native (Expo) + TypeScript   |
| Navigation | React Navigation (tabs + stacks)   |
| Backend    | Node.js + Express + TypeScript     |
| Database   | PostgreSQL                         |
| ORM        | Prisma                             |
| Auth       | JWT (jsonwebtoken + bcryptjs)      |
| State      | React Context (AuthContext)        |

---

## Database Models

- **User** — Login credentials + role (ADMIN/USER), linked to Player
- **Player** — Name, position, number, avatar
- **FineType** — Fine catalog (name, amount, category)
- **Fine** — Individual fine instance (player, type, amount, status PAID/UNPAID)

---

## API Endpoints

| Method   | Endpoint               | Auth     | Description                  |
| -------- | ---------------------- | -------- | ---------------------------- |
| POST     | `/api/auth/login`      | Public   | Login, returns JWT           |
| POST     | `/api/auth/register`   | Admin    | Register new user            |
| GET      | `/api/auth/profile`    | User     | Get current user profile     |
| GET      | `/api/players`         | User     | List all players + stats     |
| GET      | `/api/players/:id`     | User     | Player profile + fine history|
| POST     | `/api/players`         | Admin    | Create player                |
| PUT      | `/api/players/:id`     | Admin    | Update player                |
| DELETE   | `/api/players/:id`     | Admin    | Delete player                |
| GET      | `/api/fines`           | User     | List fines (with filters)    |
| POST     | `/api/fines`           | Admin    | Create fine for player       |
| PUT      | `/api/fines/:id`       | Admin    | Update fine                  |
| DELETE   | `/api/fines/:id`       | Admin    | Delete fine                  |
| PATCH    | `/api/fines/:id/pay`   | Admin    | Mark fine as paid            |
| GET      | `/api/fine-types`      | User     | List all fine types          |
| POST     | `/api/fine-types`      | Admin    | Create fine type             |
| PUT      | `/api/fine-types/:id`  | Admin    | Update fine type             |
| DELETE   | `/api/fine-types/:id`  | Admin    | Delete fine type             |
| GET      | `/api/leaderboard`     | User     | Player rankings by fines     |
| GET      | `/api/dashboard`       | User     | Aggregated stats + recent    |

---

## User Roles

| Role    | Permissions                                               |
| ------- | --------------------------------------------------------- |
| ADMIN   | Full CRUD: players, fines, fine types. Mark fines as paid |
| USER    | Read-only: view players, fines, leaderboard, own profile  |

---

## App Screens

1. **Login** — Username/email + password authentication
2. **Dashboard** — Balance overview, stats cards, mini leaderboard, recent fines
3. **Players (Troppen)** — Searchable player list with fine totals
4. **Player Profile** — Full profile card, stats, fine history
5. **Fines (Bøter)** — Fine type catalog grouped by category
6. **Add Fine** — Admin form: pick player + fine type + optional comment
7. **Leaderboard (Skamveggen)** — Top 3 podium + ranked list
8. **Admin** — Financial overview, create fine types/players, mark fines paid, logout

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** running locally (or use Docker)
- **Expo CLI**: `npm install -g expo-cli` (optional, `npx expo` also works)

### 1. Setup the Database

Create a PostgreSQL database:

```bash
createdb kaupanger_botsystem
```

Or with Docker:

```bash
docker run --name kaupanger-pg -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=kaupanger_botsystem -p 5432:5432 -d postgres:16
```

### 2. Setup the Backend

```bash
cd backend

# Copy environment config
cp .env.example .env
# Edit .env with your DATABASE_URL if needed

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed demo data
npx ts-node prisma/seed.ts

# Start dev server
npm run dev
```

The server runs at `http://localhost:3000`.

### 3. Setup the Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo
npx expo start
```

Then:
- Press **i** for iOS simulator
- Press **a** for Android emulator
- Scan QR code with Expo Go on a physical device

### 4. Login Credentials (from seed)

| Username | Password  | Role  |
| -------- | --------- | ----- |
| admin    | admin123  | ADMIN |
| tomas    | user123   | USER  |

---

## Environment Variables

### Backend (`.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/kaupanger_botsystem?schema=public
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

### Mobile

The API URL is auto-detected in `src/api/client.ts`:
- iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical device: change to your machine's IP

---

## Useful Commands

```bash
# Backend
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npx prisma studio        # Open Prisma database GUI
npx prisma migrate dev   # Create new migration
npx ts-node prisma/seed.ts  # Re-seed data

# Mobile
npx expo start           # Start Expo dev server
npx expo start --clear   # Clear cache and start
```

---

## Design System

The app uses a dark theme matching the provided UI design:

| Token           | Value     |
| --------------- | --------- |
| Background      | `#0B1121` |
| Surface         | `#141B2D` |
| Primary (Blue)  | `#1E88E5` |
| Accent (Green)  | `#4CAF50` |
| Warning (Amber) | `#FF9800` |
| Error (Red)     | `#F44336` |
| Text Primary    | `#FFFFFF` |
| Text Secondary  | `#8892B0` |
