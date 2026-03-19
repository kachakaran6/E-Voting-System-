# Server API (Express)

Base URL: `http://localhost:5000`

## Auth

- `POST /api/auth/login` `{ identifier, password }` → `{ token, user }`
- `POST /api/auth/register` (multipart) → `{ token, user }`
  - fields: `fullName, email, password, confirmPassword, voterId, state`
  - file (optional): `idProof`
- `GET /api/auth/me` (Bearer JWT) → `{ user }`

## Elections (JWT)

- `GET /api/elections`
  - **VOTER**: only their `state`
  - **ADMIN/SUPER_ADMIN**: all
- `GET /api/elections/:id` → `{ election, candidates }`
- `POST /api/elections` (ADMIN/SUPER_ADMIN)
- `PUT /api/elections/:id` (ADMIN/SUPER_ADMIN)
- `POST /api/elections/:id/pause` (ADMIN/SUPER_ADMIN)
- `POST /api/elections/:id/resume` (ADMIN/SUPER_ADMIN)
- `POST /api/elections/:id/end-early` (ADMIN/SUPER_ADMIN)
- `DELETE /api/elections/:id` (ADMIN/SUPER_ADMIN, only if not locked and no candidates)

## Candidates (JWT)

- `GET /api/candidates?electionId=...`
  - **VOTER**: state-filtered automatically
- `POST /api/candidates` (ADMIN/SUPER_ADMIN, multipart)
  - fields: `candidateName, partyName, state, electionId`
  - files: `candidateImage`, `partyLogo`
  - rule: **max 5 candidates per election**
- `PUT /api/candidates/:id` (ADMIN/SUPER_ADMIN, multipart)
- `DELETE /api/candidates/:id` (ADMIN/SUPER_ADMIN)

## Voting (JWT)

- `POST /api/votes/confirm` (VOTER)
  - `{ electionId, candidateId, confirm: true }`
  - rule: **one vote per election** (unique indexes)
  - rule: **state restriction enforced**
- `GET /api/votes/receipt/:receiptId` (JWT; voter can only access own)

## Notifications (JWT)

- `GET /api/notifications`
- `POST /api/notifications/:id/read`

## Monitoring (ADMIN/SUPER_ADMIN)

- `GET /api/monitoring/dashboard`
- `GET /api/monitoring/elections/:electionId`

## Real-time events (Socket.io)

Admins join room via `join { role }` and receive:

- `vote_cast`
- `election_status`
- `election_created`

