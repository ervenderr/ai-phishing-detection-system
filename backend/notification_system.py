"""
Notification System Module

This module handles user notifications for phishing alerts.
"""

import json
import os
import logging
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("notification.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("notification_system")

class NotificationSystem:
    """
    System for sending notifications about phishing threats.
    """
    
    def __init__(self):
        """
        Initialize the notification system.
        """
        # Load email configuration from environment variables
        self.smtp_server = os.environ.get("SMTP_SERVER", "smtp.example.com")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_username = os.environ.get("SMTP_USERNAME", "")
        self.smtp_password = os.environ.get("SMTP_PASSWORD", "")
        self.from_email = os.environ.get("FROM_EMAIL", "phishing-alerts@example.com")
        
        # In-memory store for notifications (in a real app, you'd use a database)
        self.notifications = []
    
    def create_notification(self, user_id: str, email_data: Dict[str, Any], verdict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a notification for a user.
        
        Args:
            user_id: ID of the user to notify
            email_data: Original email data
            verdict: Verdict from the engine
            
        Returns:
            Notification data
        """
        notification = {
            "id": f"notif_{len(self.notifications) + 1}",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat(),
            "read": False,
            "email_id": email_data.get("id", "unknown"),
            "subject": email_data.get("subject", "No subject"),
            "sender": email_data.get("sender", "unknown@example.com"),
            "verdict": verdict.get("verdict", "unknown"),
            "risk_score": verdict.get("risk_score", 0),
            "description": verdict.get("description", ""),
            "action": verdict.get("recommended_action", ""),
            "color_code": verdict.get("color_code", "gray")
        }
        
        # Store notification
        self.notifications.append(notification)
        
        # Log notification creation
        logger.info(f"Created notification {notification['id']} for user {user_id}")
        
        return notification
    
    def send_email_alert(self, user_email: str, notification: Dict[str, Any]) -> bool:
        """
        Send an email alert to the user.
        
        Args:
            user_email: Email address of the user
            notification: Notification data
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        if not self.smtp_username or not self.smtp_password:
            logger.warning("SMTP credentials not configured, skipping email alert")
            return False
        
        try:
            # Create email message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = user_email
            msg['Subject'] = f"ALERT: Phishing Detection - {notification['verdict'].upper()}"
            
            # Create HTML content
            html = f"""
            <html>
                <body>
                    <h2>Phishing Alert - {notification['verdict'].upper()}</h2>
                    <p>Our system has detected a potentially dangerous email in your inbox.</p>
                    
                    <div style="border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
                        <p><strong>Subject:</strong> {notification['subject']}</p>
                        <p><strong>From:</strong> {notification['sender']}</p>
                        <p><strong>Risk Level:</strong> <span style="color: {notification['color_code']};">{notification['verdict'].upper()} ({notification['risk_score']}/100)</span></p>
                        <p><strong>Description:</strong> {notification['description']}</p>
                        <p><strong>Recommended Action:</strong> {notification['action']}</p>
                    </div>
                    
                    <p>You can view more details in your dashboard.</p>
                </body>
            </html>
            """
            
            # Attach HTML content
            msg.attach(MIMEText(html, 'html'))
            
            # Connect to SMTP server and send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Sent email alert to {user_email}")
            return True
        
        except Exception as e:
            logger.error(f"Error sending email alert: {str(e)}")
            return False
    
    def get_notifications(self, user_id: str, limit: int = 10, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Get notifications for a user.
        
        Args:
            user_id: ID of the user
            limit: Maximum number of notifications to return
            offset: Offset for pagination
            
        Returns:
            List of notifications
        """
        # Filter notifications by user_id and apply pagination
        user_notifications = [n for n in self.notifications if n["user_id"] == user_id]
        paginated = user_notifications[offset:offset+limit]
        
        return paginated
    
    def mark_as_read(self, notification_id: str) -> bool:
        """
        Mark a notification as read.
        
        Args:
            notification_id: ID of the notification
            
        Returns:
            True if notification was found and marked as read, False otherwise
        """
        for notification in self.notifications:
            if notification["id"] == notification_id:
                notification["read"] = True
                logger.info(f"Marked notification {notification_id} as read")
                return True
        
        logger.warning(f"Notification {notification_id} not found")
        return False
    
    def delete_notification(self, notification_id: str) -> bool:
        """
        Delete a notification.
        
        Args:
            notification_id: ID of the notification
            
        Returns:
            True if notification was found and deleted, False otherwise
        """
        for i, notification in enumerate(self.notifications):
            if notification["id"] == notification_id:
                self.notifications.pop(i)
                logger.info(f"Deleted notification {notification_id}")
                return True
        
        logger.warning(f"Notification {notification_id} not found")
        return False
    
    def send_notification(self, to_email: str, subject: str, body: str) -> Dict[str, Any]:
        """
        Send a notification to a user's email address.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            body: Email body content
            
        Returns:
            Status of the notification
        """
        try:
            # Create notification record
            notification = {
                "id": f"notif_{len(self.notifications) + 1}",
                "timestamp": datetime.now().isoformat(),
                "recipient": to_email,
                "subject": subject,
                "body": body[:100] + "..." if len(body) > 100 else body,  # Truncate for storage
                "status": "pending"
            }
            
            # Try to send email if SMTP is configured
            if self.smtp_username and self.smtp_password:
                self.send_email_alert(to_email, {
                    "subject": subject,
                    "body": body,
                    "verdict": "suspicious"  # Default for direct notifications
                })
                notification["status"] = "sent"
            else:
                notification["status"] = "stored_only"
                logger.warning(f"SMTP not configured, notification stored but not emailed to {to_email}")
            
            # Store notification
            self.notifications.append(notification)
            
            # Log notification
            logger.info(f"Notification {notification['status']} for {to_email}: {subject}")
            
            return {
                "status": "success",
                "notification_id": notification["id"],
                "delivery_status": notification["status"]
            }
            
        except Exception as e:
            logger.error(f"Notification error: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }

def get_notification_system() -> NotificationSystem:
    """
    Factory function to create and return a NotificationSystem instance.
    
    Returns:
        NotificationSystem instance
    """
    return NotificationSystem()
