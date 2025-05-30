from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel, EmailStr
from typing import Optional
import mailparser

app = FastAPI()

# Pydantic model for email payload
class EmailPayload(BaseModel):
    subject: str
    sender: EmailStr
    recipient: EmailStr
    body: str
    raw: Optional[str] = None

@app.get("/status")
def read_status():
    return {"status": "ok"}

@app.post("/scan-email")
def scan_email(payload: EmailPayload):
    # Here you would add email scanning logic (parser, ML, etc.)
    # For now, return a mock result
    return {
        "subject": payload.subject,
        "sender": payload.sender,
        "recipient": payload.recipient,
        "verdict": "safe",  # or 'phishing' in real use
        "confidence": 0.95
    }

@app.post("/parse-eml")
def parse_eml(file: UploadFile = File(...)):
    # Read uploaded file
    eml_bytes = file.file.read()
    mail = mailparser.parse_from_bytes(eml_bytes)
    return {
        "subject": mail.subject,
        "from": mail.from_,
        "to": mail.to,
        "date": str(mail.date),
        "body": mail.body,
        "attachments": [att['filename'] for att in mail.attachments]
    }
