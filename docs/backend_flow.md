# Backend Flow & Architecture

The backend of the BookLeaf Support Portal is built with **FastAPI** (Python). It is structured using a clean, service-oriented architecture (SOA) pattern. This means that the HTTP routing layer is strictly separated from the business logic layer, making the code testable and easy to maintain.

## Directory Structure & File Contribution

The backend code lives inside `/backend/app/`.

### 1. `main.py`
**Purpose**: The entry point of the FastAPI application.
- **How it works**: It initializes the FastAPI app instance, configures CORS (Cross-Origin Resource Sharing) to allow the frontend to communicate with it, mounts the `uploads/` directory to serve static file attachments, and includes all the routers. It also sets up global exception handlers so that any errors are returned as clean JSON responses.

### 2. `database.py` & `models.py`
**Purpose**: Data persistence and Object-Relational Mapping (ORM).
- **How it works**: `database.py` sets up the SQLAlchemy engine and session factory to connect to the SQLite database (`bookleaf.db`). `models.py` defines the actual database tables (`users`, `books`, `tickets`, `ticket_messages`) as Python classes.

### 3. `schemas.py`
**Purpose**: Data validation and serialization (Pydantic models).
- **How it works**: Whenever data enters the API (e.g., creating a ticket), FastAPI uses these schemas to validate the input structure and types. When data leaves the API (e.g., retrieving a ticket list), schemas define exactly what fields are exposed. A critical feature here is the `AuthorTicket` schema, which safely hides `internal_notes` and `ai_draft_response` from authors, ensuring data privacy.

### 4. `auth.py`
**Purpose**: Authentication, Authorization, and Security.
- **How it works**: Handles password hashing (using `bcrypt`) and JWT (JSON Web Token) creation and validation. It exposes dependency functions like `get_current_user`, `get_current_admin`, and `get_current_author`. These are injected into routes to ensure that only users with the correct role can access certain endpoints.

### 5. `routers/` Directory
**Purpose**: The HTTP routing layer (Controllers).
- **`tickets_router.py`**: Defines endpoints for the ticket lifecycle (`GET /api/tickets`, `POST /api/tickets`, etc.). It acts as a traffic cop—receiving the HTTP request, enforcing auth rules, and immediately delegating the actual work to the `services/`.
- **`auth_router.py`**: Handles the `/api/token` login endpoint.
- **`books_router.py`**: Handles retrieving book/portfolio data.
- **`upload_router.py`**: Handles file uploads, enforcing file size limits (5MB) and allowed extensions (PDF, JPG, PNG).

### 6. `services/` Directory
**Purpose**: The Business Logic layer.
- **`ticket_service.py`**: Contains the core logic. For example, when a ticket is created (`create_ticket`), this service saves the record to the database, and then kicks off the AI classification as a background task. When an admin replies, it automatically updates the ticket status from `Open` to `In Progress`.
- **`book_service.py`**: Handles logic for fetching books based on whether the requester is an admin (sees all) or an author (sees only their own).
- **`ai_service.py`**: (Covered extensively in `ai_and_database.md`). Handles all communication with the Google Gemini API.

## Typical Data Flow: Creating a Ticket

To understand how things are connected, let's trace what happens when an author submits a new support ticket:

1. **Frontend Request**: The React frontend sends a `POST /api/tickets` request with a JSON body (subject, description, attachment) and a JWT Bearer token in the header.
2. **FastAPI Router**: The request hits `tickets_router.py`. FastAPI automatically validates the JWT token via `auth.get_current_author` and validates the JSON payload against `schemas.TicketCreate`.
3. **Delegation**: The router calls `TicketService.create_ticket(...)`.
4. **Business Logic**: `ticket_service.py` creates a new `Ticket` SQLAlchemy model and saves it to the SQLite database.
5. **Background Process**: `ticket_service.py` uses FastAPI's `BackgroundTasks` to schedule `process_ticket_ai` to run asynchronously. 
6. **Response**: The API immediately returns the new ticket object (ID, status `Open`) to the frontend without waiting for the AI.
7. **AI Execution (Background)**: The AI service reads the ticket description, asks Gemini for the category and priority, and then updates the database record silently in the background.
