# Kaupanger Botsystem

Web-basert bøtesystem for Kaupanger A-lag med backend-API, autentisering, adminflyt og offentleg innsyn.

## Prosjektstruktur

```text
kaupanger_botsystem/
├── backend/                 # Node.js + Express + Prisma API
│   ├── prisma/              # Schema, migreringar og seed
│   └── src/
│       ├── controllers/     # API-handterarar
│       ├── routes/          # API-ruter
│       ├── services/        # Prisma, scheduler, seed-jobbar
│       ├── middleware/      # Auth + feilhandtering
│       └── domain/          # Delt domenedata (bottypar)
├── web/                     # React + TypeScript + Webpack frontend
├── render.yaml              # Render deploy backend
└── vercel.json              # Vercel deploy frontend
```

## Teknologistack

- Frontend: React 18 + TypeScript + React Router + Axios + Webpack
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT (`jsonwebtoken`) + `bcryptjs`
- Scheduler: `node-cron`

## Roller og tilgang

- `ADMIN`: Full tilgang til spelarar, bøter, bottypar, reglar, scheduler-endepunkt
- `USER`: Lesetilgang + eigen profil
- `Public`: Offentlege ruter for bøter, oppsummering, reglar og bottypar

## API-oversikt

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`

### Spelarar
- `GET /api/players`
- `GET /api/players/:id`
- `GET /api/players/birthdays/today`
- `POST /api/players` (admin)
- `PUT /api/players/:id` (admin)
- `PUT /api/players/:id/role` (admin)
- `DELETE /api/players/:id` (admin)

### Bøter
- `GET /api/fines`
- `GET /api/fines/:id`
- `POST /api/fines` (admin)
- `POST /api/fines/bulk` (admin)
- `PUT /api/fines/:id` (admin)
- `PATCH /api/fines/:id/status` (admin)
- `DELETE /api/fines/:id` (admin)

### Bottypar
- `GET /api/fine-types`
- `GET /api/fine-types/:id`
- `POST /api/fine-types` (admin)
- `PUT /api/fine-types/:id` (admin)
- `DELETE /api/fine-types/:id` (admin)

### Andre ruter
- `GET /api/dashboard`
- `GET /api/leaderboard`
- `POST /api/upload/profile-image`
- `POST /api/scheduler/run-botfri` (admin)
- `POST /api/scheduler/run-forsein` (admin)
- `PUT /api/rules` (admin)

### Offentlege ruter
- `GET /api/public/fines`
- `GET /api/public/summary`
- `GET /api/public/fine-types`
- `GET /api/public/rules`

## Lokal utvikling

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend køyrer på `http://localhost:3000`.

### 2) Frontend

```bash
cd web
npm install
npm run dev
```

Frontend køyrer på `http://localhost:5173`.

## Bygg og test

### Backend

```bash
cd backend
npm run build
npm run test
```

### Frontend

```bash
cd web
npm run build
```

## Miljøvariablar (backend)

Eksempel i `backend/.env.example`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/kaupanger_botsystem?schema=public"
JWT_SECRET="replace-me"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="https://kaupanger-botsystem.vercel.app"
```

## Deploy

- Backend: Render (`render.yaml`)
- Frontend: Vercel (`vercel.json`)
