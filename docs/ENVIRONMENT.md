# CampusPulse Environment Configuration

This document describes all environment variables used by the CampusPulse foundation, distinguishing required parameters from optional integrations and development-only flags.

---

## Variable Reference

### 1. Application & Core Settings

| Variable              | Required | Default                 | Description                                               |
| :-------------------- | :------: | :---------------------- | :-------------------------------------------------------- |
| `NODE_ENV`            |   Yes    | `development`           | Runtime environment (`development`, `test`, `production`) |
| `NEXT_PUBLIC_APP_URL` |   Yes    | `http://localhost:3000` | Fully qualified base URL for routing & QR payloads        |
| `APP_NAME`            |    No    | `CampusPulse`           | Human-readable platform name                              |
| `APP_TIMEZONE`        |    No    | `Asia/Kolkata`          | Standard operational timezone for SRM campuses            |

### 2. Database (PostgreSQL)

| Variable       | Required | Default            | Description                                                       |
| :------------- | :------: | :----------------- | :---------------------------------------------------------------- |
| `DATABASE_URL` | **Yes**  | `postgresql://...` | Connection URI for PostgreSQL with URL-encoded special characters |

### 3. Authentication & Security

| Variable           | Required | Default                 | Description                                                       |
| :----------------- | :------: | :---------------------- | :---------------------------------------------------------------- |
| `AUTH_SECRET`      | **Yes**  | —                       | Cryptographic secret for session cookie encryption (min 32 chars) |
| `AUTH_URL`         |    No    | `http://localhost:3000` | Auth.js canonical callback URL                                    |
| `DEV_AUTH_ENABLED` | Dev only | `true`                  | Enables deterministic mock authentication for local development   |

> [!CAUTION]
> `DEV_AUTH_ENABLED` is strictly blocked in production by `src/lib/env.ts`. Setting `DEV_AUTH_ENABLED=true` while `NODE_ENV=production` causes the application to immediately fail startup.

### 4. File Storage

| Variable             | Required | Default                    | Description                                                 |
| :------------------- | :------: | :------------------------- | :---------------------------------------------------------- |
| `STORAGE_PROVIDER`   |    No    | `local`                    | `local` (filesystem) or `s3` (AWS S3, Cloudflare R2, MinIO) |
| `LOCAL_UPLOAD_DIR`   |    No    | `./.local-storage/uploads` | Path for saving uploaded poster files locally               |
| `MAX_UPLOAD_SIZE_MB` |    No    | `5`                        | Maximum upload size threshold                               |

### 5. AI Poster Extraction

| Variable      | Required | Default | Description                                         |
| :------------ | :------: | :------ | :-------------------------------------------------- |
| `AI_PROVIDER` |    No    | `mock`  | `mock` (deterministic local), `gemini`, or `openai` |
| `AI_API_KEY`  | Optional | —       | API key for external vision LLMs                    |

### 6. Notifications & Rate Limiting

| Variable             | Required | Default                                   | Description                                         |
| :------------------- | :------: | :---------------------------------------- | :-------------------------------------------------- |
| `EMAIL_PROVIDER`     |    No    | `console`                                 | `console` (prints to stdout), `smtp`, or `sendgrid` |
| `EMAIL_FROM`         |    No    | `notifications@campuspulse.srmist.edu.in` | Sender email address                                |
| `RATE_LIMIT_ENABLED` |    No    | `true`                                    | Enforces client rate limiting on sensitive routes   |

---

## Switching to Hosted PostgreSQL (Neon, Supabase, AWS RDS)

To switch to a hosted PostgreSQL provider:

1. Update `DATABASE_URL` in `.env.local`:
   ```dotenv
   DATABASE_URL="postgresql://user:password@ep-sample-123.ap-southeast-1.neon.tech/campuspulse?sslmode=require"
   ```
2. Run `npm run db:deploy` to apply migrations without generating new migration files.
3. Zero application code modifications are required.
