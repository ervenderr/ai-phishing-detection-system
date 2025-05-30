"""
Verdict Engine Module

This module combines results from ML text analysis and link analysis to determine
the final verdict on whether an email is phishing or legitimate.
"""

from typing import Dict, Any, List, Optional, Union, Tuple
import json
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("verdict_engine.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("verdict_engine")

# Define verdict levels
VERDICT_LEVELS = {
    "safe": {
        "score_range": (0, 30),
        "color": "green",
        "description": "Likely a legitimate message",
        "action": "No action needed"
    },
    "suspicious": {
        "score_range": (31, 70),
        "color": "yellow",
        "description": "Contains some suspicious elements",
        "action": "Exercise caution before trusting links or attachments"
    },
    "dangerous": {
        "score_range": (71, 85),
        "color": "orange",
        "description": "High likelihood of being a phishing attempt",
        "action": "Do not click links or open attachments"
    },
    "critical": {
        "score_range": (86, 100),
        "color": "red",
        "description": "Almost certainly a phishing or malicious message",
        "action": "Report immediately and delete the message"
    }
}

class VerdictEngine:
    """
    Engine for determining final phishing verdict based on multiple analysis results.
    """
    
    def __init__(self, config_path: Optional[str] = None):
        """
        Initialize the verdict engine with optional custom configuration.
        
        Args:
            config_path: Path to custom configuration file
        """
        self.config = {
            "weights": {
                "ml_subject": 0.25,  # 25% weight for ML analysis of subject
                "ml_body": 0.35,     # 35% weight for ML analysis of body
                "link_analysis": 0.25, # 25% weight for link analysis
                "sender_domain": 0.15  # 15% weight for sender domain analysis
            },
            "thresholds": {
                "safe": 30,
                "suspicious": 70,
                "dangerous": 85,
                "critical": 100
            }
        }
        
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    custom_config = json.load(f)
                    # Update config with custom values
                    for key, value in custom_config.items():
                        if key in self.config:
                            self.config[key].update(value)
            except Exception as e:
                logger.error(f"Error loading custom config: {str(e)}")
                
    def get_detailed_verdict(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a detailed verdict from analysis results, including evidence collection
        and recommended actions.
        
        Args:
            analysis_results: Results from multiple types of analysis
            
        Returns:
            Detailed verdict with evidence and recommendations
        """
        # Run the core verdict analysis
        verdict = self.analyze(analysis_results)
        
        # Add log entry
        logger.info(f"Generated verdict for email: {verdict['verdict']} with score {verdict['risk_score']}")
        
        # Add a more detailed response with actionable insights
        verdict["actionable_insights"] = self._generate_insights(verdict)
        
        # Add visualization data for frontend
        verdict["visualization_data"] = {
            "risk_factors": [
                {"name": "Subject Analysis", "value": analysis_results.get("subject_analysis", {}).get("risk_score", 0)},
                {"name": "Body Analysis", "value": analysis_results.get("body_analysis", {}).get("risk_score", 0)},
                {"name": "Link Analysis", "value": analysis_results.get("links_analysis", {}).get("max_risk_score", 0)},
                {"name": "Sender Analysis", "value": verdict.get("analysis_details", {}).get("sender_score", 0)}
            ],
            "risk_score": verdict["risk_score"],
            "color": verdict.get("color_code", "gray")
        }
        
        return verdict
    
    def _generate_insights(self, verdict: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Generate actionable insights based on the verdict.
        
        Args:
            verdict: The verdict to generate insights from
            
        Returns:
            List of actionable insights
        """
        insights = []
        
        # Base insights on verdict level
        if verdict["verdict"] == "safe":
            insights.append({
                "type": "info",
                "message": "This message appears safe, but always be cautious with unexpected emails."
            })
        
        elif verdict["verdict"] == "suspicious":
            insights.append({
                "type": "warning",
                "message": "Treat this message with caution. Verify sender identity before clicking links or downloading attachments."
            })
            
        elif verdict["verdict"] in ["dangerous", "critical"]:
            insights.append({
                "type": "danger",
                "message": "Do not interact with this message. It is likely a phishing attempt."
            })
            
        # Add specific insights based on evidence
        for evidence in verdict.get("evidence", []):
            if evidence["type"] == "links" and evidence.get("suspicious_urls"):
                insights.append({
                    "type": "danger",
                    "message": f"Contains suspicious URLs: {', '.join(evidence['suspicious_urls'][:3])}"
                })
            
            elif evidence["type"] == "sender" and evidence["score"] > 50:
                insights.append({
                    "type": "warning", 
                    "message": "Sender domain appears suspicious or newly created."
                })
                
            elif evidence["type"] == "content" and evidence["score"] > 70:
                insights.append({
                    "type": "danger",
                    "message": "Message contains highly suspicious content patterns."
                })
                
        return insights
    
    def get_verdict_level(self, score: float) -> str:
        """
        Get the verdict level based on the score.
        
        Args:
            score: Risk score (0-100)
            
        Returns:
            Verdict level (safe, suspicious, dangerous, critical)
        """
        thresholds = self.config["thresholds"]
        
        if score <= thresholds["safe"]:
            return "safe"
        elif score <= thresholds["suspicious"]:
            return "suspicious"
        elif score <= thresholds["dangerous"]:
            return "dangerous"
        else:
            return "critical"
    
    def analyze(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a verdict based on multiple analysis results.
        
        Args:
            analysis_results: Dictionary containing analysis results
            
        Returns:
            Verdict with risk score and details
        """
        # Extract relevant scores
        ml_subject_score = analysis_results.get("subject_analysis", {}).get("risk_score", 0)
        ml_body_score = analysis_results.get("body_analysis", {}).get("risk_score", 0)
        
        # Link analysis score (use max risk score or 0)
        link_analysis = analysis_results.get("links_analysis", {})
        link_score = link_analysis.get("max_risk_score", 0) if link_analysis else 0
        
        # Sender domain analysis
        sender_analysis = analysis_results.get("sender_analysis", {})
        sender_score = 0
        
        # Calculate sender domain score based on domain age and reputation
        if sender_analysis:
            # Check if domain is new (less than 30 days)
            domain_age = sender_analysis.get("domain_age", {})
            if domain_age.get("status") == "success" and domain_age.get("is_new_domain", False):
                sender_score += 50
            
            # Check abuse reports
            abuse_report = sender_analysis.get("abuse_report", {})
            if abuse_report.get("status") == "success":
                abuse_score = abuse_report.get("abuse_score", 0)
                sender_score += abuse_score
        
        # Cap sender score at 100
        sender_score = min(sender_score, 100)
        
        # Calculate weighted score
        weights = self.config["weights"]
        weighted_score = (
            ml_subject_score * weights["ml_subject"] +
            ml_body_score * weights["ml_body"] +
            link_score * weights["link_analysis"] +
            sender_score * weights["sender_domain"]
        )
        
        # Round to nearest integer
        final_score = round(weighted_score)
        
        # Get verdict level
        verdict_level = self.get_verdict_level(final_score)
        verdict_details = VERDICT_LEVELS[verdict_level].copy()
        
        # Build evidence list
        evidence = []
        
        # ML subject evidence
        if ml_subject_score > 50:
            evidence.append({
                "type": "subject",
                "description": "Suspicious language in subject line",
                "score": ml_subject_score,
                "weight": weights["ml_subject"]
            })
        
        # ML body evidence
        if ml_body_score > 50:
            evidence.append({
                "type": "content",
                "description": "Suspicious content in message body",
                "score": ml_body_score,
                "weight": weights["ml_body"]
            })
        
        # Link analysis evidence
        if link_score > 50:
            suspicious_urls = []
            if link_analysis and "results" in link_analysis:
                for url_result in link_analysis["results"]:
                    if url_result.get("is_suspicious", False):
                        suspicious_urls.append(url_result.get("url", "unknown"))
            
            evidence.append({
                "type": "links",
                "description": "Suspicious links detected",
                "suspicious_urls": suspicious_urls[:5],  # Limit to 5 URLs
                "score": link_score,
                "weight": weights["link_analysis"]
            })
        
        # Sender domain evidence
        if sender_score > 50:
            evidence.append({
                "type": "sender",
                "description": "Suspicious sender domain",
                "score": sender_score,
                "weight": weights["sender_domain"]
            })
        
        # Create verdict
        verdict = {
            "timestamp": datetime.now().isoformat(),
            "risk_score": final_score,
            "verdict": verdict_level,
            "description": verdict_details["description"],
            "recommended_action": verdict_details["action"],
            "color_code": verdict_details["color"],
            "evidence": evidence,
            "analysis_details": {
                "ml_subject_score": ml_subject_score,
                "ml_body_score": ml_body_score,
                "link_score": link_score,
                "sender_score": sender_score,
                "weights": weights
            }
        }
        
        # Log the verdict
        logger.info(f"Verdict: {verdict_level} (Score: {final_score})")
        
        return verdict

def get_verdict_engine(config_path: Optional[str] = None) -> VerdictEngine:
    """
    Factory function to create and return a VerdictEngine instance.
    
    Args:
        config_path: Path to custom configuration file
        
    Returns:
        VerdictEngine instance
    """
    return VerdictEngine(config_path)
