# Setting Up API Keys for Link Analysis

This guide will walk you through the process of obtaining and configuring API keys for the Link Analysis module in our AI-Powered Phishing Detection System.

## Overview

The Link Analysis module integrates with three external services:

1. **VirusTotal** - For checking URLs against known threats
2. **AbuseIPDB** - For checking domain reputation
3. **WhoisXML API** - For checking domain age

Each service requires an API key, which you'll need to obtain by registering for each service.

## Step 1: Obtain API Keys

### VirusTotal API Key

1. Visit [VirusTotal](https://www.virustotal.com/gui/join-us)
2. Register for a free account
3. Once logged in, go to your profile and find the API key section
4. Copy your API key

**Note:** The free VirusTotal API has usage limits (4 requests per minute). For production use, consider a premium plan.

### AbuseIPDB API Key

1. Visit [AbuseIPDB](https://www.abuseipdb.com/register)
2. Register for a free account
3. Go to [API](https://www.abuseipdb.com/account/api) in your account settings
4. Copy your API key

**Note:** The free tier allows for 1,000 reports per day. For production use, consider a premium plan.

### WhoisXML API Key

1. Visit [WhoisXML API](https://www.whoisxmlapi.com/signup.php)
2. Register for a free account
3. Log in and go to your dashboard
4. Copy your API key

**Note:** The free tier provides a limited number of requests. For production use, consider a premium plan.

## Step 2: Configure the Application

There are two ways to provide API keys to the application:

### Option 1: Using a .env File (Recommended for Development)

1. Create a file named `.env` in the `backend` directory
2. Add the following content, replacing the placeholders with your actual API keys:

```
VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
ABUSEIPDB_API_KEY=your_abuseipdb_api_key_here
WHOISXML_API_KEY=your_whoisxml_api_key_here
```

3. Save the file

### Option 2: Using the API Endpoint (Useful for Testing)

You can also set the API keys using the `/set-api-keys` endpoint:

```bash
curl -X POST "http://localhost:8000/set-api-keys" \
  -H "Content-Type: application/json" \
  -d '{
    "virustotal": "your_virustotal_api_key_here",
    "abuseipdb": "your_abuseipdb_api_key_here",
    "whoisxml": "your_whoisxml_api_key_here"
  }'
```

Or using the Swagger UI at http://localhost:8000/docs when the server is running.

## Step 3: Test the Configuration

1. Run the test script to verify that your API keys are working:

```bash
cd backend
python test_link_analyzer.py
```

If the API keys are configured correctly, you should see results from all three services in the test output.

## Security Considerations

- Never commit API keys to version control. The `.env` file is included in `.gitignore` for this reason.
- In production, use environment variables provided by your deployment platform.
- Consider implementing API key rotation procedures for enhanced security.
