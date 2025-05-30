"""
Test script for the Verdict Engine API endpoint
"""
import os
import json
import requests
from dotenv import load_dotenv
from pprint import pprint

# Load environment variables from .env file
load_dotenv()

# API endpoint URL
API_URL = "http://localhost:8000"  # Update with your actual API URL

def test_verdict_endpoint():
    """Test the /verdict endpoint with a sample email"""
    print("\n=== Testing Verdict API Endpoint ===\n")
    
    # Sample email with suspicious content
    test_email = {
        "email": {
            "subject": "Urgent: Your Account Security Alert",
            "sender": "security@suspicious-bank.com",
            "recipient": "user@example.com",
            "body": """
            Dear Customer,
            
            We detected suspicious activity on your account. Please click the following link to verify your identity:
            
            https://malicious-phishing-site.com/login?id=123
            
            If you don't verify within 24 hours, your account will be locked.
            
            Security Team
            """
        },
        "send_notification": True,
        "user_email": "test@example.com"  # Optional: for testing email notifications
    }
    
    try:
        # Call the verdict endpoint
        response = requests.post(f"{API_URL}/verdict", json=test_email)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"Verdict: {result.get('verdict', 'Unknown')}")
            print(f"Risk Score: {result.get('risk_score', 'N/A')}/100")
            print(f"Description: {result.get('description', 'N/A')}")
            print(f"Recommended Action: {result.get('recommended_action', 'N/A')}")
            
            # Print evidence
            print("\nEvidence:")
            for evidence in result.get("evidence", []):
                print(f"- {evidence.get('type', 'unknown')}: {evidence.get('description', 'N/A')}")
            
            # Print notification status
            print(f"\nNotification Status: {result.get('notification', {})}")
            
            # Print actionable insights
            print("\nActionable Insights:")
            for insight in result.get("actionable_insights", []):
                print(f"- [{insight.get('type', 'info')}] {insight.get('message', '')}")
                
            print("\nFull Response:")
            pprint(result)
            
            return True
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"Error testing verdict endpoint: {str(e)}")
        return False

def test_notifications_list():
    """Test the notifications list endpoint"""
    print("\n=== Testing Notifications List Endpoint ===\n")
    
    test_request = {
        "user_id": "default_user",
        "limit": 5,
        "offset": 0
    }
    
    try:
        response = requests.post(f"{API_URL}/notifications/list", json=test_request)
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"Notifications for user {result.get('user_id', 'unknown')}:")
            print(f"Count: {result.get('count', 0)}")
            
            # Print notifications
            for notif in result.get("notifications", []):
                print(f"\n- ID: {notif.get('id', 'unknown')}")
                print(f"  Subject: {notif.get('subject', 'N/A')}")
                print(f"  Risk Score: {notif.get('risk_score', 'N/A')}")
                print(f"  Read: {notif.get('read', False)}")
                
            return True
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"Error testing notifications list: {str(e)}")
        return False

if __name__ == "__main__":
    try:
        # Run tests
        verdict_test_passed = test_verdict_endpoint()
        notifications_test_passed = test_notifications_list()
        
        if verdict_test_passed and notifications_test_passed:
            print("\n✅ All tests completed successfully!")
        else:
            print("\n⚠️ Some tests failed. See output for details.")
            
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
