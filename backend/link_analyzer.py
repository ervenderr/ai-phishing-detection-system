"""
Link and Domain Analysis Module

This module provides functionality to analyze URLs and domains for potential phishing threats.
It integrates with external APIs like VirusTotal, AbuseIPDB, and WhoisXML.
"""

import re
import json
import os
import time
import requests
from urllib.parse import urlparse
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load API keys from environment variables
API_KEYS = {
    "virustotal": os.environ.get("VIRUSTOTAL_API_KEY", ""),
    "abuseipdb": os.environ.get("ABUSEIPDB_API_KEY", ""),
    "whoisxml": os.environ.get("WHOISXML_API_KEY", "")
}

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
        parsed_url = urlparse(url)
        domain = parsed_url.netloc
        return domain
    except Exception:
        return ""

def check_url_with_virustotal(url: str) -> Dict[str, Any]:
    """
    Check a URL using VirusTotal API.
    
    Args:
        url: The URL to check
        
    Returns:
        Analysis results from VirusTotal
    """
    api_key = API_KEYS.get("virustotal")
    if not api_key:
        return {
            "error": "No VirusTotal API key provided",
            "status": "error"
        }
    
    try:
        # First, submit the URL for analysis
        headers = {
            "x-apikey": api_key,
            "Content-Type": "application/x-www-form-urlencoded"
        }
        
        data = {"url": url}
        response = requests.post(
            "https://www.virustotal.com/api/v3/urls",
            headers=headers,
            data=data
        )
        
        if response.status_code != 200:
            return {
                "error": f"VirusTotal API error: {response.status_code}",
                "status": "error"
            }
        
        # Extract the analysis ID
        result = response.json()
        analysis_id = result.get("data", {}).get("id")
        
        if not analysis_id:
            return {
                "error": "Failed to get analysis ID from VirusTotal",
                "status": "error"
            }
        
        # Wait for analysis to complete
        time.sleep(2)
        
        # Get the analysis results
        response = requests.get(
            f"https://www.virustotal.com/api/v3/analyses/{analysis_id}",
            headers=headers
        )
        
        if response.status_code != 200:
            return {
                "error": f"VirusTotal analysis error: {response.status_code}",
                "status": "error"
            }
        
        result = response.json()
        attributes = result.get("data", {}).get("attributes", {})
        stats = attributes.get("stats", {})
        
        # Process and return relevant results
        return {
            "url": url,
            "status": "success",
            "malicious": stats.get("malicious", 0),
            "suspicious": stats.get("suspicious", 0),
            "harmless": stats.get("harmless", 0),
            "undetected": stats.get("undetected", 0),
            "total_scans": sum(stats.values() or [0]),
            "last_analysis_date": attributes.get("last_analysis_date"),
            "analysis_id": analysis_id
        }
        
    except Exception as e:
        return {
            "error": f"Exception during VirusTotal check: {str(e)}",
            "status": "error"
        }

def check_domain_with_abuseipdb(domain: str) -> Dict[str, Any]:
    """
    Check a domain using AbuseIPDB API.
    
    Args:
        domain: The domain to check
        
    Returns:
        Analysis results from AbuseIPDB
    """
    api_key = API_KEYS.get("abuseipdb")
    if not api_key:
        return {
            "error": "No AbuseIPDB API key provided",
            "status": "error"
        }
    
    try:
        headers = {
            "Key": api_key,
            "Accept": "application/json"
        }
        
        params = {
            "domain": domain,
            "maxAgeInDays": 90,
            "verbose": True
        }
        
        response = requests.get(
            "https://api.abuseipdb.com/api/v2/check-domain",
            headers=headers,
            params=params
        )
        
        if response.status_code != 200:
            return {
                "error": f"AbuseIPDB API error: {response.status_code}",
                "status": "error"
            }
        
        result = response.json()
        data = result.get("data", {})
        
        return {
            "domain": domain,
            "status": "success",
            "abuse_score": data.get("abuseConfidenceScore", 0),
            "reports_count": data.get("totalReports", 0),
            "last_reported_at": data.get("lastReportedAt"),
            "domain_exists": data.get("domain") is not None
        }
        
    except Exception as e:
        return {
            "error": f"Exception during AbuseIPDB check: {str(e)}",
            "status": "error"
        }

def check_domain_age(domain: str) -> Dict[str, Any]:
    """
    Check a domain's age using WhoisXML API.
    
    Args:
        domain: The domain to check
        
    Returns:
        Domain age information
    """
    api_key = API_KEYS.get("whoisxml")
    if not api_key:
        return {
            "error": "No WhoisXML API key provided",
            "status": "error"
        }
    
    try:
        params = {
            "apiKey": api_key,
            "domainName": domain,
            "outputFormat": "JSON"
        }
        
        response = requests.get(
            "https://www.whoisxmlapi.com/whoisserver/WhoisService",
            params=params
        )
        
        if response.status_code != 200:
            return {
                "error": f"WhoisXML API error: {response.status_code}",
                "status": "error"
            }
        
        result = response.json()
        
        # Extract creation date
        creation_date_str = result.get("WhoisRecord", {}).get("createdDate")
        if creation_date_str:
            try:
                # Standardize date format
                creation_date = datetime.strptime(creation_date_str[:19], "%Y-%m-%dT%H:%M:%S")
                now = datetime.now()
                domain_age_days = (now - creation_date).days
                
                # If domain is less than 30 days old, it might be suspicious
                is_suspicious = domain_age_days < 30
                
                return {
                    "domain": domain,
                    "status": "success",
                    "creation_date": creation_date_str,
                    "domain_age_days": domain_age_days,
                    "is_new_domain": is_suspicious
                }
            except Exception as e:
                return {
                    "error": f"Error parsing date: {str(e)}",
                    "status": "error",
                    "domain": domain,
                    "raw_creation_date": creation_date_str
                }
        else:
            return {
                "error": "Creation date not found in WhoisXML response",
                "status": "error",
                "domain": domain
            }
        
    except Exception as e:
        return {
            "error": f"Exception during WhoisXML check: {str(e)}",
            "status": "error",
            "domain": domain
        }

class LinkAnalyzer:
    """
    Main class for analyzing links and domains in messages.
    """
    
    def __init__(self, virustotal_key: str = "", abuseipdb_key: str = "", whoisxml_key: str = ""):
        """
        Initialize the LinkAnalyzer.
        
        Args:
            virustotal_key: VirusTotal API key
            abuseipdb_key: AbuseIPDB API key
            whoisxml_key: WhoisXML API key
        """
        # Update API keys if provided
        if virustotal_key:
            API_KEYS["virustotal"] = virustotal_key
        if abuseipdb_key:
            API_KEYS["abuseipdb"] = abuseipdb_key
        if whoisxml_key:
            API_KEYS["whoisxml"] = whoisxml_key
    
    def analyze_url(self, url: str) -> Dict[str, Any]:
        """
        Perform comprehensive analysis on a URL.
        
        Args:
            url: The URL to analyze
            
        Returns:
            Comprehensive analysis results
        """
        domain = extract_domain_from_url(url)
        
        # Run all checks
        virustotal_results = check_url_with_virustotal(url)
        abuseipdb_results = check_domain_with_abuseipdb(domain) if domain else {"status": "error", "error": "No domain found"}
        domain_age_results = check_domain_age(domain) if domain else {"status": "error", "error": "No domain found"}
        
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
        Extract and analyze all URLs found in a text.
        
        Args:
            text: The text to analyze
            
        Returns:
            Analysis results for all URLs found
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
        Calculate a risk score based on the analysis results.
        
        Args:
            virustotal_results: Results from VirusTotal
            abuseipdb_results: Results from AbuseIPDB
            domain_age_results: Results from domain age check
            
        Returns:
            Risk score (0-100)
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
