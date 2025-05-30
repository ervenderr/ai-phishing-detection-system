from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import mailparser
from ml_integration import classify_text

app = FastAPI()

# Pydantic model for email payload
class EmailPayload(BaseModel):
    subject: str
    sender: EmailStr
    recipient: EmailStr
    body: str
    raw: Optional[str] = None

# Pydantic model for text classification
class TextPayload(BaseModel):
    text: str
    context: Optional[str] = None

@app.get("/status")
def read_status():
    return {"status": "ok"}

@app.post("/scan-email")
def scan_email(payload: EmailPayload):
    """
    Scan an email for phishing attempts using the ML model
    
    Args:
        payload: EmailPayload with email details
    
    Returns:
        Analysis results including phishing verdict and confidence score
    """
    # First, analyze the subject
    subject_result = classify_text(payload.subject)
    subject_score = subject_result["risk_score"]
    
    # Then, analyze the body
    body_result = classify_text(payload.body)
    body_score = body_result["risk_score"]
    
    # Combine the scores (weighted average: subject 40%, body 60%)
    combined_score = (subject_score * 0.4) + (body_score * 0.6)
    
    # Determine the verdict based on the combined score
    verdict = "phishing" if combined_score > 50 else "safe"
    
    return {
        "subject": payload.subject,
        "sender": payload.sender,
        "recipient": payload.recipient,
        "verdict": verdict,
        "confidence": round(max(combined_score, 100 - combined_score)) / 100,
        "details": {
            "subject_analysis": subject_result,
            "body_analysis": body_result,
            "combined_risk_score": round(combined_score)
        }
    }

@app.post("/classify-text")
def analyze_text(payload: TextPayload):
    """
    Classify text (URL, email subject, etc.) using the ML model
    
    Args:
        payload: TextPayload with the text to classify and optional context
    
    Returns:
        The classification result with confidence score
    """
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text to classify is required")
    
    # Call the ML model integration
    result = classify_text(payload.text)
    
    # Add context if provided
    if payload.context:
        result["context"] = payload.context
    
    return result

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
