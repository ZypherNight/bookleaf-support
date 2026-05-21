import os
import json
from google import genai

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

KNOWLEDGE_BASE = """
Company Overview
• BookLeaf Publishing is a self-publishing company operating in India and the US.
• We offer publishing packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid package with marketing and distribution add-ons).
• We handle cover design, typesetting, ISBN assignment, printing, distribution, and royalty management for our authors.
• Our in-house printing facility and warehouse are located in Delhi. We also work with print partners including Repro India and Epitome Books.

Royalty Policy
• BookLeaf follows an 80/20 royalty split: 80% of the net profit per book goes to the author, 20% to BookLeaf.
• Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.
• Royalties are calculated quarterly and paid within 45 days of the quarter ending.
• Minimum payout threshold: ₹1,000. If accumulated royalties are below this, they roll over to the next quarter.
• Payouts are made via bank transfer to the account linked in the author’s dashboard.

ISBN Policy
• Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf.
• ISBNs are registered under BookLeaf’s publisher imprint. If an author wants an ISBN under their own imprint, they need to obtain it independently.
• If an author reports an ISBN error (duplicate, wrong book linked), it is treated as a high-priority issue and escalated to the production team.

Printing & Quality
• In-house printing handles most orders. Overflow or specific format requirements go to Repro India or Epitome Books.
• Standard print turnaround: 5–7 business days from order confirmation.
• If an author reports a quality issue (misprints, binding defects, color inconsistency), BookLeaf arranges a free reprint after verification. The author may need to share photos of the defective copy.

Distribution & Availability
• Books are listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.
• New listings typically go live within 7–10 business days after publication is complete.
• If a book is showing as unavailable on a platform, it usually indicates a stock sync issue—BookLeaf’s team can trigger a re-sync within 24–48 hours.

Production Stages
• A book goes through the following stages: Manuscript Received -> Editing (if opted) -> Cover Design -> Typesetting -> Proofreading -> ISBN Assignment -> Printing -> Distribution Setup -> Published & Live.
• Authors are updated at each stage via email. Delays typically happen at Cover Design (waiting for author approval) and Proofreading (revision rounds).
"""

def classify_ticket(subject: str, description: str, book_details: dict = None):
    try:
        book_context = f"Book Details: {json.dumps(book_details, default=str)}" if book_details else "General Inquiry"
        
        prompt = f"""
You are an AI assistant for BookLeaf Publishing operations team.
Analyze the following author support ticket and provide a JSON response with two keys:
- "category": Must be one of ["Royalty & Payments", "ISBN & Metadata Issues", "Printing & Quality", "Distribution & Availability", "Book Status & Production Updates", "General Inquiry"]
- "priority": Must be one of ["Critical", "High", "Medium", "Low"]

Ticket Subject: {subject}
Ticket Description: {description}
Context: {book_context}

Rules:
- Unpaid royalties for months or wrong ISBNs are Critical/High.
- Bio updates or general questions are Low.
- Return ONLY valid JSON format.
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash", 
            contents=f"System: You analyze support tickets and output JSON.\n\nUser: {prompt}"
        )
        
        content = response.text.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        result = json.loads(content)
        return {
            "category": result.get("category", "General Inquiry"),
            "priority": result.get("priority", "Medium")
        }
    except Exception as e:
        print(f"AI Classification Error: {e}")
        return {
            "category": "General Inquiry",
            "priority": "Medium"
        }

def draft_ticket_response(subject: str, description: str, book_details: dict = None):
    try:
        book_context = f"Book Details: {json.dumps(book_details, default=str)}" if book_details else "General Inquiry"
        
        prompt = f"""
You are an AI assistant drafting a support response for BookLeaf Publishing operations team.

Ticket Subject: {subject}
Ticket Description: {description}
Context: {book_context}

BookLeaf Policies (Knowledge Base):
{KNOWLEDGE_BASE}

Instructions for Draft Response:
- STRICTLY limit your response to 3-4 short, concise sentences. DO NOT write massive blocks of text.
- Be empathetic, to-the-point, and professional. 
- Acknowledge the concern, provide specific numbers/dates/statuses, and state the clear next step.
- NEVER mention internal systems to the customer (e.g., do not say "our database shows" or "dashboard sync issue"). Frame all information professionally from a customer-facing perspective.
- If it's a BookLeaf error (like a missing royalty or wrong ISBN), own it directly without being defensive. Offer transparency and a 48-hour resolution timeline.
- Use line breaks between short paragraphs to make it readable.
- Return ONLY the raw draft text (no markdown formatting, no quotes).
"""

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=f"System: You draft professional support responses.\n\nUser: {prompt}"
        )
        
        return response.text.strip()
    except Exception as e:
        print(f"AI Drafting Error: {e}")
        return "Thank you for reaching out to BookLeaf Publishing. We have received your query and a support representative will review it and get back to you shortly."
