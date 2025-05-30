# 🌐 Link & Domain Analysis Module

This document provides information about the Link & Domain Analysis feature of our AI-Powered Phishing Detection System.

## Overview

The Link & Domain Analysis module integrates with external security APIs to detect suspicious URLs and domains in emails. This adds another layer of security beyond the ML-based text classification.

## Features

- Extract and analyze URLs from email content
- Check URLs against VirusTotal's database of known threats
- Evaluate domain reputation using AbuseIPDB
- Check domain age (new domains are often used for phishing)
- Calculate risk scores based on combined analysis results
- Integrate with the existing email scanning workflow

## API Endpoints

### 1. Analyze a Single URL

```
POST /analyze-url
```

Analyzes a single URL for potential phishing or malicious content.

**Request:**

```json
{
  "url": "https://example.com/login"
}
```

**Response:**

```json
{
  "url": "https://example.com/login",
  "domain": "example.com",
  "risk_score": 65,
  "is_suspicious": true,
  "analysis": {
    "virustotal": { ... },
    "abuseipdb": { ... },
    "domain_age": { ... }
  }
}
```

### 2. Analyze Text for URLs

```
POST /analyze-links
```

Extracts and analyzes all URLs found in a text.

**Request:**

```json
{
  "text": "Please visit https://example.com/login to verify your account."
}
```

**Response:**

```json
{
  "urls_found": 1,
  "has_suspicious_urls": true,
  "max_risk_score": 65,
  "results": [ ... ]
}
```

### 3. Set API Keys

```
POST /set-api-keys
```

Sets the API keys for external services.

**Request:**

```json
{
  "virustotal": "your_virustotal_api_key",
  "abuseipdb": "your_abuseipdb_api_key",
  "whoisxml": "your_whoisxml_api_key"
}
```

### 4. Enhanced Email Scanning

The existing `/scan-email` endpoint has been enhanced to include link analysis.

## API Key Setup

To use the Link & Domain Analysis module, you need to obtain API keys from:

1. **VirusTotal** - [Sign up here](https://www.virustotal.com/gui/join-us)
2. **AbuseIPDB** - [Register here](https://www.abuseipdb.com/register)
3. **WhoisXML API** - [Sign up here](https://www.whoisxmlapi.com/signup.php)

Create a `.env` file in the backend directory based on `.env.example`:

```
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
WHOISXML_API_KEY=your_whoisxml_api_key_here
```

## Risk Score Calculation

The risk score (0-100) is calculated based on:

- **VirusTotal Results** (0-50 points): Based on the percentage of security vendors that flagged the URL as malicious or suspicious
- **AbuseIPDB Score** (0-25 points): Domain reputation score from AbuseIPDB
- **Domain Age** (0-25 points): Newer domains (less than 6 months old) get higher risk scores

A score above 50 is considered suspicious.

## Testing the Link Analyzer

Run the test script to verify the Link Analyzer is working correctly:

```bash
cd backend
python test_link_analyzer.py
```

This will test URL extraction, URL analysis, and text analysis functionality.
