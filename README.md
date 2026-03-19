# SecureVote — MERN Secure Online Voting System

Production-style **MERN** system with **JWT auth**, **RBAC**, **election lifecycle**, **state-restricted ballots**, **vote receipts**, **notifications**, **secure uploads**, and **real-time monitoring** via **Socket.io**.

## Tech

- **Server**: Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Zod, Multer, Socket.io
- **Client**: React, React Router, Axios, Recharts, Tailwind CSS

## Roles

- `SUPER_ADMIN` — full control (admin management + monitoring)
- `ADMIN` — manage elections & candidates, view live monitoring/results
- `VOTER` — register, vote (state restricted), view receipt + notifications

## Predefined credentials

- **Super Admin**: `superadmin@gmail.com` / `sadmin123`
- **Admin**: `admin@gmail.com` / `admin123`
- **Voter**: login with **Voter ID + Password** (or email/username also supported)

## Run locally

### 1) Start MongoDB

Use local MongoDB or Docker.

### 2) Configure server env

Create `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/securevote
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=2h
CLIENT_ORIGIN=http://localhost:5173
PORT=5000
```

### 3) Install & run

From repo root:

```bash
npm install
npm run dev
```

- API: `http://localhost:5000/health`
- Web: `http://localhost:5173`

## Uploads

Server serves static uploads from:

- `http://localhost:5000/uploads/...`

Directories:

- `server/uploads/candidates`
- `server/uploads/party`
- `server/uploads/idproof`

## Notes (security)

- Passwords are **bcrypt hashed**
- JWT required for protected endpoints
- Role checks enforced by middleware
- Rate limiting applied on auth routes
- Mongo query/operator sanitization enabled
- **One vote per election** enforced via unique DB indexes
- Closed elections are **locked** (no edits / no deletes / no voting)

