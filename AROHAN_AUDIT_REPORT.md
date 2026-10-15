# AROHAN AI — Full-Stack Audit Report
**Date:** 2026-10-15  
**Auditor:** Senior Full-Stack, Backend & QA Automation Engineer  
**Project:** Arohan AI — Rural Education, Career Discovery, & Opportunity Platform  
**Repository Root:** `c:\Users\arjun\Documents\AROHA-AI`

---

## 1. Executive Summary

A comprehensive full-stack audit was performed on the Arohan AI repository across the frontend, backend, database, routing, authentication, environment configuration, and test suites.

**Core Finding:**
The frontend UI/UX and backend architectures are well-structured, but the application suffers from critical integration, configuration, and routing defects that prevent normal runtime operation. Most notably:
1. **The Root JSON Error (`Unexpected token '<', "<!doctype "... is not valid JSON`):** Caused by frontend API client misrouting requests to an SPA fallback server (which serves `index.html`) rather than the backend API, coupled with blind `response.json()` parsing on HTML content without verifying `Content-Type`.
2. **External Deployment Timeout (`https://arohan-backend.onrender.com`):** Configured in `vercel.json` rewrites, but the Render instance is currently offline / timed out, causing Vercel to serve the HTML SPA fallback for `/api/*` endpoints.
3. **Route Precedence & Parameter Collisions:** Route ordering in FastAPI routers (specifically BookBridge and Mentorship) where parameterized path patterns precede static sub-routes.
4. **Vite Dev Proxy & Test Mismatch:** `getBaseApiUrl()` hardcoded port `5173`, causing unit tests in jsdom (port 3000) and alternative dev/preview ports (4173, 5174) to fail or misroute.
5. **Database Split:** Multiple SQLite database files (`./arohan.db` in root with active user data and `backend/arohan.db` with fresh seed data) due to relative path resolution varying based on process working directory.

---

## 2. Technology Stack & Framework Inventory

| Layer | Technology | Details / Versions |
|---|---|---|
| **Frontend Framework** | React 19 + TypeScript | `react@^19.2.8`, `react-dom@^19.2.8`, `typescript@~6.0.2` |
| **Bundler & Build Tool** | Vite 8.3.4 | `@vitejs/plugin-react@^6.1.1`, Vitest 5.0.4, Oxlint |
| **Styling** | Tailwind CSS + Lucide Icons | `tailwindcss@^3.4.17`, `lucide-react@^1.57.0` |
| **Backend Framework** | FastAPI (Python 3.12) | `fastapi>=0.110.0`, `uvicorn>=0.28.0`, `starlette` |
| **Backend ORM & DB** | SQLAlchemy 2.0 + SQLite/PostgreSQL | `sqlalchemy>=2.0.28`, `psycopg2-binary>=2.9.9` |
| **Data Validation** | Pydantic v2 | `pydantic>=2.6.0`, `pydantic-settings>=2.2.0` |
| **Auth / Security** | PyJWT + Bcrypt | `pyjwt>=2.8.0`, `bcrypt>=4.1.2`, Bearer tokens |
| **AI Integration** | Dual Engine (Gemini 1.5 Flash + Rule-Based) | Deterministic rural career matcher with Google Gemini fallback |
| **Testing Tools** | Vitest + React Testing Library (FE), Pytest (BE) | `pytest>=8.0.0`, `pytest-asyncio`, `jsdom` |

---

## 3. Findings by Feature, Severity, Root Cause, and Recommended Fix

### Finding 1: BookBridge & Resource Directory JSON Parsing Failure (`<!doctype`)
- **Affected Features:** BookBridge (`/books`), Opportunities (`/opportunities`), Arohan Connect (`/mentors`), Student Dashboard (`/students/dashboard`).
- **Severity:** CRITICAL
- **Symptom:** `Unexpected token '<', "<!doctype "... is not valid JSON`. The UI renders initial empty shells, but resource directories crash with parsing errors.
- **Root Cause:**
  1. `frontend/src/services/api.ts` unconditionally calls `await response.json()` without checking `response.headers.get('content-type')`.
  2. When the backend is offline, when running `vite preview`, or when deployed on Vercel with an unresponsive Render upstream, the web server returns `index.html` (HTTP 200 SPA fallback) or an HTML 502/504 error page.
  3. `api.ts`'s `getBaseApiUrl()` hardcoded `window.location.port === '5173'`. Any other port (preview on 4173, alternative dev port 5174, test runner on 3000) defaulted to `${window.location.origin}/api/v1`, fetching against the Vite static server which returned `index.html`.
- **Recommended Fix:**
  - Update `getBaseApiUrl()` to cleanly detect localhost/127.0.0.1 on any port and route to `http://localhost:8000/api/v1` when no explicit `VITE_API_URL` is set.
  - In `api.request<T>()`, check `Content-Type`. If the response contains HTML or fails to provide JSON, intercept with a clear and actionable message: `"The API returned an HTML response instead of JSON. Verify backend is running on http://localhost:8000."`
  - Add proxy config to Vite preview in `vite.config.ts`.

---

### Finding 2: Broken Frontend Unit Test (`src/test/api.test.ts`)
- **Affected Features:** Frontend QA and CI build verification.
- **Severity:** HIGH
- **Symptom:** `AssertionError: expected 'http://localhost:3000/api/v1' to be 'http://localhost:8000/api/v1'`
- **Root Cause:** In jsdom, `window.location.port` is `'3000'`. Because `getBaseApiUrl()` checked strictly `window.location.port === '5173'`, it returned `http://localhost:3000/api/v1`.
- **Recommended Fix:** In `getBaseApiUrl()`, check for localhost hostname or undefined port in development, correctly resolving to `http://localhost:8000/api/v1`.

---

### Finding 3: Route Collisions & Ordering in FastAPI Routers
- **Affected Features:** BookBridge user activity (`/books/my/listings`, `/books/my/requests`) and Mentor requests (`/mentors/my/requests`).
- **Severity:** MEDIUM-HIGH
- **Symptom:** Accessing user listings or requests can collide with single-segment parameterized routes if defined in incorrect order.
- **Root Cause:** In `backend/app/api/books.py` and `backend/app/api/mentors.py`, routes like `/{book_id}` and `/{mentor_id}` were declared near the top. Any request matching path segments could be evaluated against parameter converters.
- **Recommended Fix:** Position explicit static routes (`/my/listings`, `/my/requests`, `/requests/{id}`) before generic parameterized routes (`/{id}`).

---

### Finding 4: Inconsistent Database Location (Root vs Backend Folder)
- **Affected Features:** Data persistence across backend startup commands.
- **Severity:** MEDIUM
- **Symptom:** Running the backend from the root directory uses `.\arohan.db` (5 users, 7 roadmaps, 4 books), whereas running from `backend/` uses `backend\arohan.db` (4 users, 1 roadmap, 3 books).
- **Root Cause:** `DATABASE_URL="sqlite:///./arohan.db"` in `app/config.py` evaluates relative to Python's current working directory.
- **Recommended Fix:** Normalize SQLite path in `app/database.py` to point to a consistent database file location regardless of current working directory.

---

### Finding 5: Outdated Python Datetime Deprecation Warnings
- **Affected Features:** Backend test suite and server logs (78 deprecation warnings).
- **Severity:** LOW
- **Symptom:** `DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version.`
- **Root Cause:** Python 3.12 deprecates naive `datetime.datetime.utcnow()` in favor of `datetime.datetime.now(datetime.timezone.utc)`.
- **Recommended Fix:** Modernize UTC datetime calls across models, security, schemas, and seed scripts.

---

### Finding 6: Vercel Proxy Upstream Unavailability
- **Affected Features:** Live production deployment on Vercel.
- **Severity:** HIGH (for production)
- **Symptom:** Calls to `/api/*` on Vercel proxy to `https://arohan-backend.onrender.com/api/*` which times out after 4000ms.
- **Root Cause:** The Render backend service is either asleep, stopped, or has not been deployed with the blueprint.
- **Recommended Fix:**
  - Provide fallback diagnostics in frontend so users see a helpful "Backend Service Spun Down / Reconnecting" notice instead of an unhandled crash.
  - Ensure `render.yaml` and startup commands are fully documented.

---

## 4. Audit Checklist & Verification Status

| Component | Status | Findings |
|---|---|---|
| **Frontend TypeScript Build** | PASS | `tsc -b && vite build` succeeds in 1.45s without type errors. |
| **Frontend Test Suite** | 9 PASS, 1 FAIL | 9 component tests pass; 1 API URL test failed due to port check. |
| **Backend Unit Tests** | 14 PASS (100%) | All 14 tests in `test_all_features.py` pass; 78 deprecation warnings. |
| **Database Schemas & Models** | COMPLETE | Clean relational schemas for Users, Profiles, Roadmaps, Books, Mentors, Facilitators, Opportunities. |
| **Security & Auth** | COMPLETE | JWT bearer auth, password hashing via bcrypt, role separation (student vs teacher vs admin). |
| **AI Integration** | COMPLETE | Dual-mode: Gemini 1.5 Flash via REST API + Deterministic offline rule-based fallback. |
| **Voice & Speech** | COMPLETE | Web Speech API integration with graceful fallback. |

---

## 5. Next Steps for Immediate Repair
1. **Fix `frontend/src/services/api.ts`**: Resolve `getBaseApiUrl()` for all environments, add Content-Type verification, and add clear non-JSON / HTML error handling.
2. **Update `frontend/vite.config.ts`**: Add preview proxy to port 8000 for seamless testing on `npm run preview`.
3. **Verify and Re-run Frontend Test Suite**: Ensure all 10 tests in `vitest run` pass cleanly.
4. **Fix Route Ordering in Backend**: Ensure `/my/listings` and `/my/requests` are ordered correctly in `books.py` and `mentors.py`.
5. **Normalize SQLite DB Path in `backend/app/database.py`**: Prevent database fragmentation between root and backend cwd.
6. **Modernize `datetime.datetime.now(datetime.timezone.utc)`**: Eliminate deprecation warnings.
7. **Create `AROHAN_API_INVENTORY.md`**: Complete the 19-feature integration inventory.
