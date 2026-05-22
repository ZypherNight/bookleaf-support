# AI Integration & Database Schema

The BookLeaf Support Portal uses a combination of structured relational data and Google's Generative AI to optimize the support team's workflow.

## AI Flow & Prompt Engineering (`ai_service.py`)

The application integrates with the `google-genai` SDK using the `gemini-3.5-flash` model. We implemented a **Two-Stage AI Strategy** to balance speed, cost, and utility:

### Stage 1: Auto-Classification (Background)
When an author submits a ticket, we need to sort it into a queue (Category) and assign a severity (Priority). 
- **Trigger**: Called via a FastAPI `BackgroundTask` the moment the ticket is created.
- **Prompt Design**: We send the ticket subject and description to Gemini. The prompt includes specific few-shot rules (e.g., "Wrong ISBNs are Critical", "Bio updates are Low priority").
- **Output Constraint**: The prompt strictly enforces a JSON output containing exactly two keys: `Category` and `Priority`.
- **Cost/Speed**: Because the prompt is short and the output is limited to a small JSON string, this operation is extremely fast and costs almost nothing.
- **Graceful Degradation**: If the API fails (e.g., rate limit), a `try/except` block catches the error and assigns a default fallback (`General Inquiry / Medium`), ensuring the ticket is never lost.

### Stage 2: On-Demand Response Drafting
Generating full, empathetic, accurate email responses requires a lot of tokens, which is slow and expensive. Therefore, we do *not* auto-generate drafts for every ticket.
- **Trigger**: Admin explicitly clicks "Generate AI Draft" in the UI.
- **Context Injection**: Before calling Gemini, the `ticket_service.py` fetches the specific Book's data (royalty paid, royalty pending, copies sold, print status).
- **Knowledge Base**: We inject a hardcoded string `KNOWLEDGE_BASE` into the prompt. This contains BookLeaf's actual business rules (80/20 royalty split, payouts happen 45 days after month-end, free reprints require photo proof, etc.).
- **Prompt Design**: The AI is instructed to "Act as an empathetic BookLeaf Support Agent", to "own the fault if it's ours", and to format the output with proper greetings, omitting any mention of internal IDs or systems.
- **Result**: The admin receives a highly accurate, context-aware draft they can edit before sending.

---

## Database Schema & Data Flow (`models.py`)

The system uses SQLAlchemy ORM to manage relational data in a SQLite database (`bookleaf.db`).

### 1. `User` Table
- **Fields**: `id` (String, Primary Key), `name`, `email`, `hashed_password`, `role` ("admin" or "author").
- **Relationships**: A User can have many `Books` (if role=author) and many `Tickets`.

### 2. `Book` Table
- **Fields**: `book_id` (PK), `author_id` (ForeignKey), `title`, `isbn`, `genre`, `status` (e.g., 'Published', 'In Production'), `total_copies_sold`, `royalty_pending`, etc.
- **Flow**: Fetched on the Author Dashboard. When generating an AI draft, the system joins the `Book` data to the `Ticket` to give the AI context about the specific book the author is complaining about.

### 3. `Ticket` Table
- **Fields**: `id` (PK), `author_id` (FK), `book_id` (FK, Optional), `subject`, `description`, `status` ('Open', 'In Progress', 'Resolved', 'Closed'), `category` (AI generated), `priority` (AI generated), `attachment_url`.
- **Admin-Only Fields**: `ai_draft_response`, `internal_notes`, `assigned_to`. These are hidden from the frontend `AuthorTicket` schema to ensure security.
- **Relationships**: A Ticket has many `TicketMessages`.

### 4. `TicketMessage` Table
- **Fields**: `id` (PK), `ticket_id` (FK), `sender_id` (String, e.g., 'AUTHOR123' or 'ADMIN_PRIYA'), `message` (Text), `created_at` (DateTime).
- **Flow**: Whenever a message is added to a thread, the parent `Ticket.status` is evaluated. If an admin replies, it moves to `In Progress`. If an author replies to a `Resolved` ticket, it automatically reverts to `Open`. The frontend reads the `sender_id` to position chat bubbles on the left or right side of the screen.

### Summary of Data Flow
1. **Creation**: Author creates Ticket → DB Insert `Ticket`.
2. **AI Action**: Background task queries DB → Calls Gemini → Updates DB `Ticket` with Category/Priority.
3. **Drafting**: Admin clicks Draft → Backend queries `Ticket` + `Book` → Calls Gemini with Context + Knowledge Base → Updates DB `Ticket.ai_draft_response`.
4. **Resolution**: Admin adds `TicketMessage` → DB Insert `TicketMessage` + Updates `Ticket.status`.
