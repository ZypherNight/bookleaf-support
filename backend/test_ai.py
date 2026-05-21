import os
from dotenv import load_dotenv
load_dotenv()

from app.ai_service import draft_ticket_response
print(draft_ticket_response("test", "test", {"name": "test"}))
