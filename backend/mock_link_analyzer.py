"""
Mock implementation of Link Analyzer for testing purposes

This module provides mock implementations of the link analysis functions to enable
testing without requiring real API keys or network connections.
"""

from typing import Dict, Any, List
from datetime import datetime
import re

# Regular expression pattern to extract URLs from text
URL_PATTERN = r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+'

def extract_urls_from_text(text: str) -> List[str]:
    """
    Extract all URLs from a given text.
    
    Args:
        text: The text to extract URLs from
        
    Returns:
        A list of URLs found in the text
    """
    if not text:
        return []
        
    urls = re.findall(URL_PATTERN, text)
    return list(set(urls))  # Remove duplicates

def extract_domain_from_url(url: str) -> str:
    """
    Extract the domain from a URL.
    
    Args:
        url: The URL to extract the domain from
        
    Returns:
        The domain name
    """
    try:
        from urllib.parse import urlparse
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        return domain
    except Exception:
        return ""

def mock_check_url_with_virustotal(url: str) -> Dict[str, Any]:
    """
    Mock VirusTotal API response.
    """
    is_malicious = "phishing" in url or "malware" in url or "suspicious" in url
    
    if is_malicious:
        return {
            "url": url,
            "status": "success",
            "malicious": 12,
            "suspicious": 5,
            "harmless": 40,
            "undetected": 8,
            "total_scans": 65,
            "last_analysis_date": int(datetime.now().timestamp()),
            "analysis_id": "mock-analysis-id"
        }
    else:
        return {
            "url": url,
            "status": "success",
            "malicious": 0,
            "suspicious": 1,
            "harmless": 58,
            "undetected": 6,
            "total_scans": 65,
            "last_analysis_date": int(datetime.now().timestamp()),
            "analysis_id": "mock-analysis-id"
        }

def mock_check_domain_with_abuseipdb(domain: str) -> Dict[str, Any]:
    """
    Mock AbuseIPDB API response.
    """
    is_suspicious = "phishing" in domain or "malware" in domain or "suspicious" in domain
    
    if is_suspicious:
        return {
            "domain": domain,
            "status": "success",
            "abuse_score": 75,
            "reports_count": 12,
            "last_reported_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "domain_exists": True
        }
    else:
        return {
            "domain": domain,
            "status": "success",
            "abuse_score": 0,
            "reports_count": 0,
            "last_reported_at": None,
            "domain_exists": True
        }

def mock_check_domain_age(domain: str) -> Dict[str, Any]:
    """
    Mock WhoisXML API response for domain age check.
    """
    is_new = "phishing" in domain or "malware" in domain or "suspicious" in domain
    
    if is_new:
        return {
            "domain": domain,
            "status": "success",
            "creation_date": (datetime.now().replace(day=1)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "domain_age_days": 15,
            "is_new_domain": True
        }
    else:
        return {
            "domain": domain,
            "status": "success",
            "creation_date": "2020-01-01T00:00:00Z",
            "domain_age_days": 1000,
            "is_new_domain": False
        }

class MockLinkAnalyzer:
    """
    Mock implementation of LinkAnalyzer for testing.
    """
    
    def analyze_url(self, url: str) -> Dict[str, Any]:
        """
        Mock URL analysis without making actual API calls.
        """
        domain = extract_domain_from_url(url)
        
        # Check if this URL looks suspicious based on keywords
        is_suspicious = any(keyword in url.lower() for keyword in [
            "phishing", "malware", "suspicious", "verify", "secure", "account", "login", 
            "password", "bank", "update", "confirm"
        ])
        
        # Get mock analysis results
        virustotal_results = mock_check_url_with_virustotal(url)
        abuseipdb_results = mock_check_domain_with_abuseipdb(domain)
        domain_age_results = mock_check_domain_age(domain)
        
        # Calculate risk score
        risk_score = self._calculate_risk_score(virustotal_results, abuseipdb_results, domain_age_results)
        
        return {
            "url": url,
            "domain": domain,
            "risk_score": risk_score,
            "is_suspicious": risk_score > 50,
            "analysis": {
                "virustotal": virustotal_results,
                "abuseipdb": abuseipdb_results,
                "domain_age": domain_age_results
            }
        }
    
    def analyze_text(self, text: str) -> Dict[str, Any]:
        """
        Mock text analysis for testing.
        """
        urls = extract_urls_from_text(text)
        
        if not urls:
            return {
                "urls_found": 0,
                "has_suspicious_urls": False,
                "max_risk_score": 0,
                "results": []
            }
        
        results = []
        max_risk_score = 0
        has_suspicious = False
        
        for url in urls:
            result = self.analyze_url(url)
            results.append(result)
            
            # Track highest risk score
            if result.get("risk_score", 0) > max_risk_score:
                max_risk_score = result.get("risk_score", 0)
            
            # Track if any URL is suspicious
            if result.get("is_suspicious", False):
                has_suspicious = True
        
        return {
            "urls_found": len(urls),
            "has_suspicious_urls": has_suspicious,
            "max_risk_score": max_risk_score,
            "results": results
        }
    
    def _calculate_risk_score(self, 
                             virustotal_results: Dict[str, Any], 
                             abuseipdb_results: Dict[str, Any], 
                             domain_age_results: Dict[str, Any]) -> int:
        """
        Calculate risk score based on analysis results.
        """
        score = 0
        
        # VirusTotal scoring (0-50 points)
        if virustotal_results.get("status") == "success":
            total_scans = virustotal_results.get("total_scans", 0)
            if total_scans > 0:
                malicious = virustotal_results.get("malicious", 0)
                suspicious = virustotal_results.get("suspicious", 0)
                
                # Calculate percentage of malicious/suspicious detections
                detection_percentage = (malicious + suspicious) / total_scans * 100
                
                # Map to 0-50 score range
                score += min(50, detection_percentage)
        
        # AbuseIPDB scoring (0-25 points)
        if abuseipdb_results.get("status") == "success":
            abuse_score = abuseipdb_results.get("abuse_score", 0)
            # Map AbuseIPDB 0-100 score to 0-25
            score += abuse_score * 0.25
        
        # Domain age scoring (0-25 points)
        if domain_age_results.get("status") == "success":
            domain_age_days = domain_age_results.get("domain_age_days", 365)
            
            # Newer domains get higher risk scores
            if domain_age_days < 30:
                # Less than 1 month: 15-25 points
                domain_age_score = 25 - (domain_age_days / 30) * 10
            elif domain_age_days < 90:
                # 1-3 months: 5-15 points
                domain_age_score = 15 - ((domain_age_days - 30) / 60) * 10
            elif domain_age_days < 180:
                # 3-6 months: 0-5 points
                domain_age_score = 5 - ((domain_age_days - 90) / 90) * 5
            else:
                # More than 6 months: 0 points
                domain_age_score = 0
            
            score += domain_age_score
            
        return min(100, int(score))
