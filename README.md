# BookLeaf Author Support & Communication Portal

## Overview
This is a full-stack web application designed to help BookLeaf operations scale their author support. It features two portals (Author and Admin) with real-time polling and an AI Engine powered by gemini that auto-classifies tickets, assigns priority scores, and drafts context-aware responses based on BookLeaf policies.

## Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate`
4. Install dependencies: `pip install "fastapi[standard]" sqlalchemy bcrypt "python-jose[cryptography]" google-genai`
5. Create a `.env` file in the `backend/` directory with your database URL (optional, defaults to SQLite) and gemini key:
   ```env
   DATABASE_URL="sqlite:///./bookleaf.db"
   gemini_api_key="sk-your-key-here"
   ```
6. Seed the database with the sample JSON: `python app/seed.py`
7. Run the server: `uvicorn app.main:app --reload` (Runs on port 8000)

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Run `npm install`
3. Run `npm run dev` to start the Vite server.

## Test Credentials
The database has been seeded with data from `bookleaf_sample_data.json`.
- **Admin:** `admin@bookleaf.com` / `admin123`
- **Author (Priya):** `priya.sharma@email.com` / `password123`
- **Author (Rahul):** `rahul.verma@email.com` / `password123`
*(All seeded authors use `password123`)*

## API Documentation

| Method | Endpoint | Description | Role |
|---|---|---|---|
| POST | `/api/token` | Get JWT access token (login) | Public |
| GET | `/api/users/me` | Get current user profile | Authenticated |
| GET | `/api/books` | Get books (filtered for author, all for admin) | Authenticated |
| GET | `/api/tickets` | Get tickets (filtered for author, all for admin) | Authenticated |
| POST | `/api/tickets` | Create a new ticket (triggers AI classification) | Author |
| GET | `/api/tickets/{id}` | Get ticket details and full thread | Authenticated |
| PUT | `/api/tickets/{id}` | Update ticket status, internal notes, category, priority | Admin |
| POST | `/api/tickets/{id}/messages` | Add a reply to the ticket thread | Authenticated |
| POST | `/api/tickets/{id}/draft` | Trigger AI to draft a response based on KB | Admin |

## Architecture Write-Up

### Clean Abstractions & API Routing
- **Frontend:** React + Vite + TailwindCSS. We used Vite for rapid development. TailwindCSS is used for a premium, glassmorphism-inspired UI. We implemented a unified API client (`src/lib/api.ts`) using Axios interceptors to automatically attach the JWT token to all requests.
- **Backend:** Python FastAPI + SQLAlchemy. We unified routes (e.g., `/api/tickets` instead of separate author/admin prefixes). The backend uses role-based access control (RBAC) dependencies (`get_current_author`, `get_current_admin`) to ensure data privacy. If an Author tries to hit an admin route, it cleanly throws a 403 Forbidden JSON error. Input validation is strictly handled by FastAPI's Pydantic schemas.

### AI Prompt Engineering & Knowledge Base
The AI service (`ai_service.py`) uses `gemini-3-flash`. The prompt is injected with the exact BookLeaf Knowledge Base provided (80/20 splits, 45-day payouts, free reprints with photo proof). It enforces strict JSON outputs for classification (`Category` and `Priority`), utilizing rules like "wrong ISBN is High priority". For drafting, it uses strict instructions to "own the fault", provide specifics, and use an empathetic tone.

### Cost Management
To optimize gemini API costs, we split the AI logic into two steps:
1. **Classification (Low Cost):** When an author submits a ticket, a background task instantly runs a very small prompt to classify the category and priority so the ticket queue is organized.
2. **Drafting On-Demand (High Cost):** We do *not* generate drafts for all tickets upfront. Generating long-form drafts is token-heavy. Instead, the draft is only generated *on-demand* when an Admin explicitly clicks the "Generate AI Draft" button inside the Ticket Detail view. This saves significant API costs for tickets that might be closed without a reply or handled via internal notes.





# FINAL COMPLIANCE CHECK: BookLeaf Assignment 1

This is a professional, uncensored code review evaluating the current BookLeaf Support Portal codebase against the specific requirements provided in the assignment document. 

## 🟢 A. Author Portal (Author-Facing)
| Requirement | Status | Evidence in Codebase |
|---|---|---|
| Email-based login | ✅ PASS | `Login.tsx` and `auth_router.py` handle standard OAuth2 email/password flows. |
| Each author sees own data | ✅ PASS | `get_current_author` dependency + `TicketService.get_tickets(author_id)` enforces strict tenant isolation. |
| My Books page (10 specific fields) | ✅ PASS | `AuthorDashboard.tsx` renders all 10 fields (title, ISBN, genre, pub date, status, MRP, total copies, royalty earned, paid, pending). |
| Submit a Support Query form | ✅ PASS | `NewTicket.tsx` has subject, description, file upload (actual upload implemented as a bonus!), and a dropdown including the specific `"General / Account Level"` option on line 77. |
| My Tickets page w/ Real-time | ✅ PASS | `AuthorTickets.tsx` shows the queue, status, and uses a `setInterval` 5-second polling mechanism to simulate real-time updates and trigger unread badges. |

## 🟢 B. Admin Portal (Admin-Facing
| Requirement | Status | Evidence in Codebase |
|---|---|---|
| Ticket Queue w/ Filters | ✅ PASS | `AdminDashboard.tsx` includes all 4 required filters (status, category, priority, date). |
| Urgent/Oldest easy to spot | ✅ PASS | `AdminDashboard.tsx` sorting logic explicitly puts Active tickets first, then sorts by Priority (`Critical` -> `Low`), then by oldest creation date. |
| AI Auto-Classification | ✅ PASS | `ai_service.py` (`classify_ticket`) uses Gemini to output exactly the 6 requested categories. |
| AI Priority Score | ✅ PASS | `ai_service.py` assigns Critical/High/Medium/Low based on few-shot prompts. |
| Admin Override | ✅ PASS | `AdminTicketDetail.tsx` allows admins to change both Category and Priority via dropdowns. |
| AI-Drafted Response | ✅ PASS | `AdminTicketDetail.tsx` has a "Generate AI Draft" button. `ai_service.py` (`draft_ticket_response`) injects the exact BookLeaf Knowledge Base strings to formulate the reply. Admin can edit in the textarea before saving. |
| Ticket Management | ✅ PASS | Admins can change status, add internal notes (hidden via `AuthorTicket` schema), and assign to themselves. |

## 🟢 C. API Layer
| Requirement | Status | Evidence in Codebase |
|---|---|---|
| RESTful conventions | ✅ PASS | Standard `GET`, `POST`, `PUT` on `/api/tickets` and `/api/books`. |
| Auth middleware & RBAC | ✅ PASS | `auth.py` dependencies (`get_current_author`, `get_current_admin`) protect every route. If an author hits an admin route, FastAPI throws a 403 Forbidden. |
| Input validation | ✅ PASS | Handled strictly by Pydantic schemas in `schemas.py`. |
| API Documentation | ✅ PASS | FastAPI automatically serves a live Swagger UI at `/docs`. Furthermore, the main `README.md` includes a structured API table. |

## 🟢 D. AI Integration Details
| Requirement | Status | Evidence in Codebase |
|---|---|---|
| Prompt Engineering | ✅ PASS | Prompts in `ai_service.py` include exact tone guidelines ("own the fault", "be empathetic") and the 80/20 royalty KB. |
| API Key Security | ✅ PASS | Handled correctly via `python-dotenv` reading `GEMINI_API_KEY` from a `.env` file. Never hardcoded. |
| Error Handling | ✅ PASS | Both AI calls are wrapped in `try/except`. If the AI fails, classification defaults to "General Inquiry / Medium" and drafting falls back to a generic polite string, ensuring no 500 crashes. |
| Cost Awareness | ✅ PASS | The "Two-Stage Strategy" perfectly answers this: Classification is cheap and runs instantly. Drafting is expensive and token-heavy, so it ONLY runs on-demand when the admin explicitly clicks the button. |
| Model Choice | ✅ PASS | Documented in `docs/ai_and_database.md` as `gemini-2.0-flash` for high speed and low cost. |

## 🟢 General Guidelines
| Requirement | Status | Evidence in Codebase |
|---|---|---|
| Seed dataset handling | ✅ PASS | `bookleaf_sample_data.json` exists and is handled gracefully (0 royalty, in production statuses render correctly). |
| Edge cases | ✅ PASS | Handled: empty ticket queues, no books state, and zero values. |
| Readme / Documentation | ✅ PASS | Massive documentation folder (`docs/`) just created detailing frontend flow, backend flow, AI, and DB. |

---

- If classification fails, the ticket gracefully defaults to "General Inquiry" and "Medium" priority.
- If drafting fails, it returns a generic, polite fallback string: *"Thank you for reaching out to BookLeaf Publishing. We have received your query..."* so the admin still has a base to work from.
