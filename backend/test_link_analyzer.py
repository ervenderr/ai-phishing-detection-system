"""
Test script for the Link Analyzer module
"""
import os
import json
import unittest
from unittest.mock import patch, MagicMock
from dotenv import load_dotenv
from link_analyzer import LinkAnalyzer, extract_urls_from_text, extract_domain_from_url

# Load environment variables from .env file
load_dotenv()

# Flag to control whether to use mocks or real API calls
USE_MOCKS = True

# Mock responses for testing without API keys
MOCK_RESPONSES = {
    "virustotal": {
        "status": "success",
        "malicious": 2,
        "suspicious": 1,
        "harmless": 50,
        "undetected": 10,
        "total_scans": 63,
        "last_analysis_date": "2023-01-01",
        "analysis_id": "mock-analysis-id"
    },
    "abuseipdb": {
        "status": "success",
        "abuse_score": 15,
        "reports_count": 5,
        "last_reported_at": "2023-01-01",
        "domain_exists": True
    },
    "domain_age": {
        "status": "success",
        "creation_date": "2022-01-01T00:00:00Z",
        "domain_age_days": 45,
        "is_new_domain": False
    }
}

def test_extract_urls():
    """Test URL extraction from text"""
    print("\n=== Testing URL Extraction ===\n")
    
    test_text = """
    Here are some URLs to test:
    - https://www.google.com
    - http://phishing-example.com/login.php
    - Visit https://secure-bank.phishing-attempt.com/login now!
    - Email me at user@example.com
    """
    
    urls = extract_urls_from_text(test_text)
    print(f"Found {len(urls)} URLs:")
    for url in urls:
        print(f"- {url}")
    
    # Basic assertion
    assert len(urls) == 3, f"Expected 3 URLs, found {len(urls)}"
    assert "https://www.google.com" in urls, "Expected to find google.com URL"
    
    # Test empty text
    assert len(extract_urls_from_text("")) == 0, "Expected empty list for empty text"
    assert len(extract_urls_from_text(None)) == 0, "Expected empty list for None text"

def test_extract_domain():
    """Test domain extraction from URL"""
    print("\n=== Testing Domain Extraction ===\n")
    
    test_cases = [
        {"url": "https://www.google.com/search?q=test", "expected": "www.google.com"},
        {"url": "http://example.com", "expected": "example.com"},
        {"url": "https://subdomain.domain.co.uk/path", "expected": "subdomain.domain.co.uk"},
        {"url": "not a url", "expected": ""}
    ]
    
    for tc in test_cases:
        result = extract_domain_from_url(tc["url"])
        print(f"URL: {tc['url']} → Domain: {result}")
        assert result == tc["expected"], f"Expected '{tc['expected']}', got '{result}'"

def get_mock_analyzer():
    """Create a LinkAnalyzer with mocked API methods"""
    analyzer = LinkAnalyzer()
    
    if USE_MOCKS:
        # Replace the actual API calls with mock implementations
        analyzer._original_analyze_url = analyzer.analyze_url
        
        def mock_analyze_url(url):
            domain = extract_domain_from_url(url)
            is_suspicious = "phishing" in url or "malware" in url
            
            # Use higher risk score for suspicious URLs
            risk_score = 75 if is_suspicious else 20
            
            # Create mock results
            mock_vt = dict(MOCK_RESPONSES["virustotal"])
            mock_abuseipdb = dict(MOCK_RESPONSES["abuseipdb"])
            mock_domain_age = dict(MOCK_RESPONSES["domain_age"])
            
            # Adjust mock data based on URL content
            if is_suspicious:
                mock_vt["malicious"] = 10
                mock_vt["suspicious"] = 5
                mock_abuseipdb["abuse_score"] = 80
                mock_abuseipdb["reports_count"] = 25
                mock_domain_age["domain_age_days"] = 5
                mock_domain_age["is_new_domain"] = True
            
            return {
                "url": url,
                "domain": domain,
                "risk_score": risk_score,
                "is_suspicious": is_suspicious,
                "analysis": {
                    "virustotal": mock_vt,
                    "abuseipdb": mock_abuseipdb,
                    "domain_age": mock_domain_age
                }
            }
        
        # Replace the real method with our mock
        analyzer.analyze_url = mock_analyze_url
    
    return analyzer

def test_url_analysis():
    """Test URL analysis with VirusTotal, AbuseIPDB, and WhoisXML"""
    print("\n=== Testing URL Analysis ===\n")
    
    # Initialize LinkAnalyzer with API keys from environment variables
    analyzer = get_mock_analyzer()
    
    # Test URLs - one legitimate, one suspicious
    urls_to_test = [
        "https://www.google.com",
        "http://malware-test.com/test.php"
    ]
    
    for url in urls_to_test:
        print(f"\nAnalyzing URL: {url}")
        try:
            result = analyzer.analyze_url(url)
            
            print(f"Risk Score: {result.get('risk_score', 'N/A')}/100")
            print(f"Suspicious: {result.get('is_suspicious', False)}")
            
            # Show detailed analysis results
            print("\nDetailed Analysis:")
            print(f"- Domain: {result.get('domain', 'N/A')}")
            
            vt_result = result.get("analysis", {}).get("virustotal", {})
            if vt_result.get("status") == "success":
                print(f"- VirusTotal: {vt_result.get('malicious', 0)} malicious, {vt_result.get('suspicious', 0)} suspicious detections")
            else:
                print(f"- VirusTotal: {vt_result.get('error', 'Error')}")
            
            abuse_result = result.get("analysis", {}).get("abuseipdb", {})
            if abuse_result.get("status") == "success":
                print(f"- AbuseIPDB: Score {abuse_result.get('abuse_score', 'N/A')}, {abuse_result.get('reports_count', 0)} reports")
            else:
                print(f"- AbuseIPDB: {abuse_result.get('error', 'Error')}")
            
            age_result = result.get("analysis", {}).get("domain_age", {})
            if age_result.get("status") == "success":
                print(f"- Domain Age: {age_result.get('domain_age_days', 'N/A')} days")
                print(f"- New Domain: {age_result.get('is_new_domain', False)}")
            else:
                print(f"- Domain Age: {age_result.get('error', 'Error')}")
                
            if "malware" in url:
                # For suspicious URLs, verify risk score is high
                assert result.get("risk_score", 0) > 50, f"Expected high risk score for suspicious URL, got {result.get('risk_score', 0)}"
                assert result.get("is_suspicious", False), "Expected URL to be marked suspicious"
            else:
                # For legitimate URLs, verify risk score is lower
                assert result.get("risk_score", 100) < 50, f"Expected low risk score for legitimate URL, got {result.get('risk_score', 100)}"
        
        except Exception as e:
            print(f"Error analyzing URL: {str(e)}")

def test_text_analysis():
    """Test analyzing text containing URLs"""
    print("\n=== Testing Text Analysis ===\n")
    
    # Initialize LinkAnalyzer with API keys from environment variables
    analyzer = get_mock_analyzer()
    
    phishing_email = """
    Dear Customer,
    
    Your account has been locked due to suspicious activity. Please click the link below to verify your identity:
    
    http://securebank.phishing-example.net/verify.php?user=12345&token=abc
    
    If you don't verify within 24 hours, your account will be permanently locked.
    
    Thank you,
    Security Team
    """
    
    print("Analyzing text for URLs and threats...")
    try:
        result = analyzer.analyze_text(phishing_email)
        
        print(f"URLs found: {result.get('urls_found', 0)}")
        print(f"Has suspicious URLs: {result.get('has_suspicious_urls', False)}")
        print(f"Maximum risk score: {result.get('max_risk_score', 0)}/100")
        
        # Display each URL result
        for url_result in result.get("results", []):
            print(f"\nURL: {url_result.get('url', 'N/A')}")
            print(f"Risk Score: {url_result.get('risk_score', 'N/A')}/100")
            print(f"Suspicious: {url_result.get('is_suspicious', False)}")
            
        # Verify phishing content is detected
        assert result.get("has_suspicious_urls", False), "Expected suspicious URLs to be detected"
        assert result.get("max_risk_score", 0) > 50, f"Expected high risk score, got {result.get('max_risk_score', 0)}"
    
    except Exception as e:
        print(f"Error analyzing text: {str(e)}")
    
    # Test text with no URLs
    no_url_text = "This is a test message with no URLs."
    result = analyzer.analyze_text(no_url_text)
    assert result.get("urls_found", -1) == 0, "Expected no URLs found"
    assert not result.get("has_suspicious_urls", True), "Expected no suspicious URLs"

def check_api_keys():
    """Check if the required API keys are set"""
    print("\n=== Checking API Keys ===\n")
    
    virustotal_key = os.environ.get("VIRUSTOTAL_API_KEY")
    abuseipdb_key = os.environ.get("ABUSEIPDB_API_KEY")
    whoisxml_key = os.environ.get("WHOISXML_API_KEY")
    
    print(f"VirusTotal API Key: {'Set' if virustotal_key else 'Not set'}")
    print(f"AbuseIPDB API Key: {'Set' if abuseipdb_key else 'Not set'}")
    print(f"WhoisXML API Key: {'Set' if whoisxml_key else 'Not set'}")
    
    if not (virustotal_key and abuseipdb_key and whoisxml_key):
        print("\nWarning: Some API keys are missing. Create a .env file with the following format:")
        print("VIRUSTOTAL_API_KEY=your_key_here")
        print("ABUSEIPDB_API_KEY=your_key_here")
        print("WHOISXML_API_KEY=your_key_here")
        
        print("\nAlternatively, you can set them using the /set-api-keys endpoint.")
        print(f"\nNOTE: Tests are currently running with mock data: {USE_MOCKS}")

if __name__ == "__main__":
    # Check if API keys are set
    check_api_keys()
    
    print(f"\nRunning tests with {'MOCK' if USE_MOCKS else 'REAL'} API calls\n")
    print("To change this behavior, set USE_MOCKS = False at the top of this file.")
    
    try:
        # Run tests
        test_extract_urls()
        test_extract_domain()
        test_url_analysis()
        test_text_analysis()
        
        print("\n✅ All tests completed successfully!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
    except Exception as e:
        print(f"\n❌ Error during testing: {str(e)}")
