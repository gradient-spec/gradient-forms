# Production Deployment Guide — GRADIENT FORMS

This guide documents the steps required to deploy **Gradient Forms** to production infrastructure (Vercel / Render / Railway / Supabase).

---

## 1. Environment Variables Matrix

Create a `.env` file in the root directory:

```env
# Server & API Config
NODE_ENV=production
PORT=4000
API_BASE_URL=https://api.gradientforms.io/api/v1

# Database Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres?sslmode=require

# Authentication & Security
JWT_SECRET=your-super-secret-jwt-key-2026
SESSION_SECRET=your-session-secret

# Integrations (Optional)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
OPENAI_API_KEY=your-openai-api-key
RESEND_API_KEY=your-resend-email-api-key
```

---

## 2. Database Migration Setup (PostgreSQL + Prisma)

1. Provision a PostgreSQL instance on **Neon**, **Supabase**, or **Railway**.
2. Run database schema migrations:
   ```bash
   npx prisma migrate deploy
   ```
3. Generate Prisma Client bindings:
   ```bash
   npx prisma generate
   ```

---

## 3. Backend Express API Server Deployment (Render / Railway)

1. **Build Command**:
   ```bash
   npm run build
   ```
2. **Start Command**:
   ```bash
   node dist/server/index.js
   ```
3. Ensure CORS configuration in `server/index.ts` restricts origins to your production frontend domain.

---

## 4. Frontend Deployment (Vercel / Netlify)

1. Connect your GitHub repository to Vercel.
2. **Framework Preset**: Vite
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Single Page Application Rewrite**: Ensure `index.html` rewrite rule is active for client-side hash/path routing.

---

## 5. Verification Checklist

- [ ] `GET /api/v1/health` returns status `healthy`.
- [ ] Database migrations execute cleanly without schema drift.
- [ ] HTTPS enabled on both frontend and API subdomains.
- [ ] CORS headers permit requests from frontend domain only.
