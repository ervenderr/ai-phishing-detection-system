from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import Optional, List, Dict, Any
import mailparser
import os
import logging
from ml_integration import classify_text
from link_analyzer import LinkAnalyzer, extract_urls_from_text
from verdict_engine import get_verdict_engine
from notification_system import get_notification_system

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("phishing_api")

app = FastAPI()

# Initialize link analyzer with environment variables or empty strings
def get_api_keys() -> Dict[str, str]:
    """
    Get API keys from environment variables
    """
    return {
        "virustotal": os.environ.get("VIRUSTOTAL_API_KEY", ""),
        "abuseipdb": os.environ.get("ABUSEIPDB_API_KEY", ""),
        "whoisxml": os.environ.get("WHOISXML_API_KEY", "")
    }

# Create a LinkAnalyzer instance
def get_link_analyzer():
    api_keys = get_api_keys()
    return LinkAnalyzer(
        virustotal_key=api_keys["virustotal"],
        abuseipdb_key=api_keys["abuseipdb"],
        whoisxml_key=api_keys["whoisxml"]
    )

# Create a VerdictEngine instance
def get_verdict_engine_instance():
    return get_verdict_engine()

# Create a NotificationSystem instance
def get_notification_system_instance():
    return get_notification_system()

# Pydantic model for email payload
class EmailPayload(BaseModel):
    subject: str
    sender: EmailStr
    recipient: EmailStr
    body: str
    raw: Optional[str] = None
    user_id: Optional[str] = "default_user"  # Added user_id field for notifications

# Pydantic model for text classification
class TextPayload(BaseModel):
    text: str
    context: Optional[str] = None
    
# Pydantic model for URL analysis
class UrlAnalysisPayload(BaseModel):
    url: str
    
# Pydantic model for API keys configuration
class ApiKeysPayload(BaseModel):
    virustotal: Optional[str] = None
    abuseipdb: Optional[str] = None
    whoisxml: Optional[str] = None

# Pydantic model for verdict request
class VerdictRequest(BaseModel):
    email: EmailPayload
    send_notification: bool = False
    user_email: Optional[str] = None

@app.get("/status")
def read_status():
    return {"status": "ok"}

@app.post("/scan-email")
def scan_email(payload: EmailPayload, analyzer: LinkAnalyzer = Depends(get_link_analyzer)):
    """
    Scan an email for phishing attempts using the ML model and link analysis
    
    Args:
        payload: EmailPayload with email details
        analyzer: LinkAnalyzer instance from dependency
    
    Returns:
        Analysis results including phishing verdict, confidence score, and link analysis
    """
    # First, analyze the subject
    subject_result = classify_text(payload.subject)
    subject_score = subject_result["risk_score"]
    
    # Then, analyze the body with ML model
    body_result = classify_text(payload.body)
    body_score = body_result["risk_score"]
    
    # Also analyze links in the body
    links_result = analyzer.analyze_text(payload.body)
    links_score = links_result.get("max_risk_score", 0)
      # Check if sender domain is suspicious
    sender_parts = payload.sender.split('@')
    sender_domain = sender_parts[1] if len(sender_parts) > 1 else ""
    sender_analysis = {}
    
    if sender_domain:
        # Only check domain age and reputation, not the full URL scan
        try:
            # Import the functions directly
            from link_analyzer import check_domain_age, check_domain_with_abuseipdb
            
            domain_age_result = check_domain_age(sender_domain)
            domain_abuse_result = check_domain_with_abuseipdb(sender_domain)
            sender_analysis = {
                "domain": sender_domain,
                "domain_age": domain_age_result,
                "abuse_report": domain_abuse_result
            }
        except Exception as e:
            sender_analysis = {"error": str(e)}
    
    # Combine the scores (subject 30%, body content 40%, links 30%)
    combined_score = (subject_score * 0.3) + (body_score * 0.4) + (links_score * 0.3)
    
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
            "links_analysis": links_result,
            "sender_analysis": sender_analysis,
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

@app.post("/analyze-url")
def analyze_url(payload: UrlAnalysisPayload, analyzer: LinkAnalyzer = Depends(get_link_analyzer)):
    """
    Analyze a URL for potential phishing or malicious content.
    
    Args:
        payload: UrlAnalysisPayload with the URL to analyze
        analyzer: LinkAnalyzer instance from dependency
        
    Returns:
        Analysis results including risk score and detailed reports
    """
    if not payload.url:
        raise HTTPException(status_code=400, detail="URL is required")
    
    result = analyzer.analyze_url(payload.url)
    return result

@app.post("/analyze-links")
def analyze_links(payload: TextPayload, analyzer: LinkAnalyzer = Depends(get_link_analyzer)):
    """
    Extract and analyze all links from a text.
    
    Args:
        payload: TextPayload with text containing URLs to analyze
        analyzer: LinkAnalyzer instance from dependency
        
    Returns:
        Analysis results for all URLs found in the text
    """
    if not payload.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = analyzer.analyze_text(payload.text)
    return result

@app.post("/set-api-keys")
def set_api_keys(payload: ApiKeysPayload):
    """
    Set API keys for external services.
    
    Args:
        payload: ApiKeysPayload with API keys
        
    Returns:
        Status of the operation
    """
    # In a production environment, you would store these securely
    # For development/demo, we'll just return a successful response
    
    keys_set = []
    if payload.virustotal:
        os.environ["VIRUSTOTAL_API_KEY"] = payload.virustotal
        keys_set.append("virustotal")
    
    if payload.abuseipdb:
        os.environ["ABUSEIPDB_API_KEY"] = payload.abuseipdb
        keys_set.append("abuseipdb")
    
    if payload.whoisxml:
        os.environ["WHOISXML_API_KEY"] = payload.whoisxml
        keys_set.append("whoisxml")
    
    return {
        "status": "success",
        "keys_set": keys_set
    }

@app.post("/verdict")
def get_verdict(request: VerdictRequest, analyzer: LinkAnalyzer = Depends(get_link_analyzer), 
                 notifier = Depends(get_notification_system_instance), 
                 engine = Depends(get_verdict_engine_instance)):
    """
    Get the verdict for an email and optionally send a notification.
    
    Args:
        request: VerdictRequest with email details and notification preference
        analyzer: LinkAnalyzer instance from dependency
        notifier: Notification system instance
        engine: Verdict engine instance
        
    Returns:
        Verdict details including risk scores and notification status
    """
    logger.info(f"Received verdict request for email: {request.email.subject} from {request.email.sender}")
    
    # Extract email details for analysis
    email_data = {
        "subject": request.email.subject,
        "sender": request.email.sender,
        "recipient": request.email.recipient,
        "body": request.email.body,
        "user_id": request.email.user_id
    }
    
    # First, analyze the subject
    subject_result = classify_text(request.email.subject)
    subject_score = subject_result["risk_score"]
    
    # Then, analyze the body with ML model
    body_result = classify_text(request.email.body)
    body_score = body_result["risk_score"]
    
    # Also analyze links in the body
    links_result = analyzer.analyze_text(request.email.body)
    links_score = links_result.get("max_risk_score", 0)
    
    # Check sender domain
    sender_parts = request.email.sender.split('@')
    sender_domain = sender_parts[1] if len(sender_parts) > 1 else ""
    sender_analysis = {}
    
    if sender_domain:
        # Only check domain age and reputation, not the full URL scan
        try:
            # Import the functions directly
            from link_analyzer import check_domain_age, check_domain_with_abuseipdb
            
            domain_age_result = check_domain_age(sender_domain)
            domain_abuse_result = check_domain_with_abuseipdb(sender_domain)
            sender_analysis = {
                "domain": sender_domain,
                "domain_age": domain_age_result,
                "abuse_report": domain_abuse_result
            }
        except Exception as e:
            sender_analysis = {"error": str(e)}
            logger.error(f"Error analyzing sender domain: {str(e)}")
    
    # Compile all analysis results
    analysis_results = {
        "subject_analysis": subject_result,
        "body_analysis": body_result,
        "links_analysis": links_result,
        "sender_analysis": sender_analysis
    }
    
    # Get detailed verdict from engine
    verdict_result = engine.get_detailed_verdict(analysis_results)
    logger.info(f"Email analysis verdict: {verdict_result['verdict']} (Score: {verdict_result['risk_score']})")
    
    # Send notification if requested and verdict is concerning
    notification_status = {"notification_sent": False}
    if request.send_notification:
        if verdict_result["risk_score"] > 30:  # Only notify for non-safe emails
            try:
                user_email = request.user_email if request.user_email else "default_user@example.com"
                notification = notifier.create_notification(
                    user_id=request.email.user_id,
                    email_data=email_data, 
                    verdict=verdict_result
                )
                
                # Send email alert if user_email is provided
                if request.user_email:
                    alert_sent = notifier.send_email_alert(
                        user_email=request.user_email,
                        notification=notification
                    )
                    notification_status = {
                        "notification_sent": True,
                        "alert_emailed": alert_sent,
                        "notification_id": notification["id"]
                    }
                else:
                    notification_status = {
                        "notification_sent": True,
                        "alert_emailed": False,
                        "notification_id": notification["id"]
                    }
                
                logger.info(f"Notification created (ID: {notification['id']}) for {request.email.user_id}")
            except Exception as e:
                notification_status = {"notification_sent": False, "error": str(e)}
                logger.error(f"Failed to send notification: {str(e)}")
        else:
            notification_status = {"notification_sent": False, "reason": "Verdict below notification threshold"}
    
    # Return comprehensive verdict results
    return {
        "verdict": verdict_result["verdict"],
        "risk_score": verdict_result["risk_score"],
        "description": verdict_result["description"],
        "recommended_action": verdict_result["recommended_action"],
        "evidence": verdict_result["evidence"],
        "notification": notification_status,
        "analysis_details": verdict_result["analysis_details"],
        "actionable_insights": verdict_result.get("actionable_insights", [])
    }

# Pydantic model for notification listing
class NotificationListRequest(BaseModel):
    user_id: str
    limit: Optional[int] = 10
    offset: Optional[int] = 0

@app.post("/notifications/list")
def list_notifications(request: NotificationListRequest, notifier = Depends(get_notification_system_instance)):
    """
    List notifications for a specific user.
    
    Args:
        request: NotificationListRequest with user_id and pagination parameters
        notifier: Notification system instance
        
    Returns:
        List of notifications for the user
    """
    logger.info(f"Listing notifications for user: {request.user_id}")
    
    notifications = notifier.get_notifications(
        user_id=request.user_id,
        limit=request.limit,
        offset=request.offset
    )
    
    return {
        "user_id": request.user_id,
        "count": len(notifications),
        "notifications": notifications
    }

# Pydantic model for notification actions
class NotificationActionRequest(BaseModel):
    notification_id: str
    action: str  # "read" or "delete"
    
@app.post("/notifications/action")
def notification_action(request: NotificationActionRequest, notifier = Depends(get_notification_system_instance)):
    """
    Perform an action on a notification (mark as read or delete).
    
    Args:
        request: NotificationActionRequest with notification_id and action
        notifier: Notification system instance
        
    Returns:
        Result of the action
    """
    logger.info(f"Notification action {request.action} for ID: {request.notification_id}")
    
    result = False
    if request.action == "read":
        result = notifier.mark_as_read(request.notification_id)
    elif request.action == "delete":
        result = notifier.delete_notification(request.notification_id)
    else:
        return {"status": "error", "message": "Invalid action. Use 'read' or 'delete'."}
    
    return {
        "status": "success" if result else "error",
        "notification_id": request.notification_id,
        "action": request.action,
        "result": result
    }
