"""
Unit tests for the Link Analyzer module

This module contains comprehensive unit tests for the link_analyzer module.
It uses both mock implementations and real API calls depending on configuration.
"""

import os
import unittest
from unittest.mock import patch, MagicMock
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import the modules to test
from link_analyzer import (
    extract_urls_from_text,
    extract_domain_from_url,
    check_url_with_virustotal,
    check_domain_with_abuseipdb,
    check_domain_age,
    LinkAnalyzer
)

# Import mock implementations
from mock_link_analyzer import (
    mock_check_url_with_virustotal,
    mock_check_domain_with_abuseipdb,
    mock_check_domain_age,
    MockLinkAnalyzer
)

# Flag to control whether to use real APIs for testing
USE_REAL_APIS = False  # Set to True to test with actual API calls


class TestLinkExtraction(unittest.TestCase):
    """Tests for URL and domain extraction functions"""

    def test_extract_urls(self):
        """Test URL extraction from text"""
        test_text = """
        Here are some URLs to test:
        - https://www.google.com
        - http://phishing-example.com/login.php
        - Visit https://secure-bank.phishing-attempt.com/login now!
        - Email me at user@example.com
        """
        
        urls = extract_urls_from_text(test_text)
        self.assertEqual(len(urls), 3)
        self.assertIn("https://www.google.com", urls)
        self.assertIn("http://phishing-example.com/login.php", urls)
        self.assertIn("https://secure-bank.phishing-attempt.com/login", urls)
        
        # Test edge cases
        self.assertEqual(extract_urls_from_text(""), [])
        self.assertEqual(extract_urls_from_text(None), [])
        self.assertEqual(extract_urls_from_text("No URLs here"), [])

    def test_extract_domain(self):
        """Test domain extraction from URL"""
        test_cases = [
            {"url": "https://www.google.com/search?q=test", "expected": "www.google.com"},
            {"url": "http://example.com", "expected": "example.com"},
            {"url": "https://subdomain.domain.co.uk/path", "expected": "subdomain.domain.co.uk"},
            {"url": "not a url", "expected": ""}
        ]
        
        for tc in test_cases:
            result = extract_domain_from_url(tc["url"])
            self.assertEqual(result, tc["expected"])


@unittest.skipIf(not USE_REAL_APIS, "Skipping real API tests")
class TestRealAPIs(unittest.TestCase):
    """Tests using actual API calls"""

    def test_virustotal_api(self):
        """Test VirusTotal API integration"""
        # Skip if API key not available
        if not os.environ.get("VIRUSTOTAL_API_KEY"):
            self.skipTest("VirusTotal API key not set")
            
        result = check_url_with_virustotal("https://www.google.com")
        self.assertEqual(result["status"], "success")
        self.assertIn("malicious", result)
        self.assertIn("total_scans", result)

    def test_abuseipdb_api(self):
        """Test AbuseIPDB API integration"""
        # Skip if API key not available
        if not os.environ.get("ABUSEIPDB_API_KEY"):
            self.skipTest("AbuseIPDB API key not set")
            
        result = check_domain_with_abuseipdb("google.com")
        self.assertEqual(result["status"], "success")
        self.assertIn("abuse_score", result)
        self.assertIn("domain_exists", result)

    def test_whoisxml_api(self):
        """Test WhoisXML API integration"""
        # Skip if API key not available
        if not os.environ.get("WHOISXML_API_KEY"):
            self.skipTest("WhoisXML API key not set")
            
        result = check_domain_age("google.com")
        self.assertEqual(result["status"], "success")
        self.assertIn("domain_age_days", result)
        self.assertIn("is_new_domain", result)


class TestWithMocks(unittest.TestCase):
    """Tests using mock API responses"""

    def setUp(self):
        """Set up test environment"""
        self.analyzer = MockLinkAnalyzer()

    def test_analyze_url_safe(self):
        """Test analysis of a safe URL"""
        result = self.analyzer.analyze_url("https://www.example.com")
        self.assertLess(result["risk_score"], 50)
        self.assertFalse(result["is_suspicious"])
        
    def test_analyze_url_suspicious(self):
        """Test analysis of a suspicious URL"""
        result = self.analyzer.analyze_url("https://phishing.example.com/login.php")
        self.assertGreaterEqual(result["risk_score"], 50)
        self.assertTrue(result["is_suspicious"])
        
    def test_analyze_text_with_urls(self):
        """Test analysis of text containing URLs"""
        text = """
        Dear Customer,
        
        Your account has been locked. Please verify your account at:
        https://phishing.example.com/verify.php
        
        Thank you,
        Support Team
        """
        
        result = self.analyzer.analyze_text(text)
        self.assertEqual(result["urls_found"], 1)
        self.assertTrue(result["has_suspicious_urls"])
        self.assertGreater(result["max_risk_score"], 50)
        
    def test_analyze_text_no_urls(self):
        """Test analysis of text without URLs"""
        text = "This is a plain text message without any URLs."
        
        result = self.analyzer.analyze_text(text)
        self.assertEqual(result["urls_found"], 0)
        self.assertFalse(result["has_suspicious_urls"])
        self.assertEqual(result["max_risk_score"], 0)


@unittest.skipIf(not USE_REAL_APIS, "Skipping integration tests with real APIs")
class TestLinkAnalyzerIntegration(unittest.TestCase):
    """Integration tests for LinkAnalyzer with real APIs"""
    
    def setUp(self):
        """Set up test environment"""
        # Skip all tests in this class if any API key is missing
        required_keys = ["VIRUSTOTAL_API_KEY", "ABUSEIPDB_API_KEY", "WHOISXML_API_KEY"]
        for key in required_keys:
            if not os.environ.get(key):
                self.skipTest(f"Missing API key: {key}")
        
        self.analyzer = LinkAnalyzer()
    
    def test_analyze_url_integration(self):
        """Test full URL analysis with real APIs"""
        result = self.analyzer.analyze_url("https://www.google.com")
        self.assertIn("risk_score", result)
        self.assertIn("is_suspicious", result)
        self.assertIn("analysis", result)
    
    def test_analyze_text_integration(self):
        """Test full text analysis with real APIs"""
        text = "Check out https://www.example.com for more information."
        result = self.analyzer.analyze_text(text)
        self.assertEqual(result["urls_found"], 1)
        self.assertIn("results", result)


if __name__ == "__main__":
    print(f"\nRunning tests with {'REAL' if USE_REAL_APIS else 'MOCK'} APIs")
    print("To change this behavior, set USE_REAL_APIS = True at the top of this file\n")
    
    # Run the tests
    unittest.main(verbosity=2)
