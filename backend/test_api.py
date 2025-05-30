"""
Test script for the ML model integration with FastAPI
"""
import requests
import json

# Base URL for the FastAPI server
BASE_URL = "http://127.0.0.1:8000"  # Change if your server runs on a different port

# Test data
phishing_urls = [
    "http://amazonupdate.134-134-51-36.cprapid.com/signin.html",
    "https://secure03-chase.dinamodigitalstudio.com/chase/login",
    "http://appleid.apple.com.verifyinfo-account.com",
    "https://netflixbilling.update-info.co.uk/",
    "http://paypal-secure.com.verification.login.sessionid12345.com"
]

safe_urls = [
    "https://www.google.com",
    "https://www.microsoft.com/en-us/",
    "https://www.apple.com/",
    "https://www.amazon.com",
    "https://www.github.com"
]

def test_classify_endpoint():
    """Test the /classify-text endpoint"""
    print("\n=== Testing /classify-text endpoint ===\n")
    
    # Test with phishing URLs
    print("Testing with known phishing URLs:")
    for url in phishing_urls:
        try:
            response = requests.post(
                f"{BASE_URL}/classify-text",
                json={"text": url}
            )
            result = response.json()
            print(f"URL: {url}")
            print(f"Verdict: {result['verdict']} (Confidence: {result.get('confidence', result.get('risk_score', 'N/A'))})")
            print("---")
        except Exception as e:
            print(f"Error testing URL {url}: {str(e)}")
    
    # Test with safe URLs
    print("\nTesting with known safe URLs:")
    for url in safe_urls:
        try:
            response = requests.post(
                f"{BASE_URL}/classify-text",
                json={"text": url}
            )
            result = response.json()
            print(f"URL: {url}")
            print(f"Verdict: {result['verdict']} (Confidence: {result.get('confidence', result.get('risk_score', 'N/A'))})")
            print("---")
        except Exception as e:
            print(f"Error testing URL {url}: {str(e)}")

def test_scan_email_endpoint():
    """Test the /scan-email endpoint"""
    print("\n=== Testing /scan-email endpoint ===\n")
    
    # Test with a phishing email
    phishing_email = {
        "subject": "Urgent: Your Account Has Been Locked - Verify Now",
        "sender": "security@paypal-secure-team.com",
        "recipient": "user@example.com",
        "body": """
        Dear Valued Customer,
        
        We've detected unusual activity on your account. Your account has been temporarily locked.
        
        To restore access, please verify your information by clicking the link below:
        
        https://paypal-secure.com.verification.login.sessionid12345.com
        
        If you don't verify within 24 hours, your account will be permanently locked.
        
        Regards,
        The PayPal Security Team
        """
    }
    
    # Test with a legitimate email
    safe_email = {
        "subject": "Your Monthly Newsletter from Company XYZ",
        "sender": "newsletter@company-xyz.com",
        "recipient": "user@example.com",
        "body": """
        Hello,
        
        Thank you for subscribing to our monthly newsletter! Here are this month's highlights:
        
        - New product launch: XYZ Pro
        - Tips and tricks for using our software
        - Community spotlight: User stories
        
        Visit our website at https://www.company-xyz.com to learn more.
        
        Best regards,
        The XYZ Team
        """
    }
    
    try:
        # Test phishing email
        print("Testing with phishing email:")
        response = requests.post(f"{BASE_URL}/scan-email", json=phishing_email)
        result = response.json()
        print(f"Subject: {result['subject']}")
        print(f"Verdict: {result['verdict']} (Confidence: {result['confidence']})")
        print(f"Details: {json.dumps(result['details'], indent=2)}")
        print("---")
        
        # Test safe email
        print("\nTesting with safe email:")
        response = requests.post(f"{BASE_URL}/scan-email", json=safe_email)
        result = response.json()
        print(f"Subject: {result['subject']}")
        print(f"Verdict: {result['verdict']} (Confidence: {result['confidence']})")
        print(f"Details: {json.dumps(result['details'], indent=2)}")
    except Exception as e:
        print(f"Error testing scan-email endpoint: {str(e)}")

if __name__ == "__main__":
    # Test the API endpoints
    test_classify_endpoint()
    test_scan_email_endpoint()
    print("\nTests completed!")
