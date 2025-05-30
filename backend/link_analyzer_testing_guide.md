# Link Analyzer Testing Guide

This guide provides instructions for testing the Link Analyzer module, which is responsible for detecting potentially malicious URLs and domains within emails and other content.

## Overview

The Link Analyzer module (`link_analyzer.py`) handles the following tasks:
- Extracting URLs from text
- Analyzing URLs for potential threats
- Checking domain reputation and age
- Generating risk scores for URLs and domains

The module integrates with several external APIs to provide comprehensive analysis:
- VirusTotal API for URL reputation
- AbuseIPDB for IP and domain reputation
- WhoisXML API for domain registration information

## Testing Options

There are two main ways to test the Link Analyzer:

1. **Using Mock Data** (recommended for development and CI/CD)
   - Does not require actual API keys
   - Fast and reliable
   - Deterministic results

2. **Using Real APIs** (for final verification)
   - Requires valid API keys
   - Subject to API rate limits and potential network issues
   - Provides real-world results

## Prerequisites

1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/yourusername/ai-phishing-detection-system.git
   cd ai-phishing-detection-system
   ```

2. Install the required dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Set up API keys (only required for real API testing):
   Create a `.env` file in the `backend` directory with the following content:
   ```
   VIRUSTOTAL_API_KEY=your_virustotal_key
   ABUSEIPDB_API_KEY=your_abuseipdb_key
   WHOISXML_API_KEY=your_whoisxml_key
   ```

## Running Tests

### Option 1: Simple Test Script

The `test_link_analyzer.py` script provides a basic interactive test that demonstrates the functionality of the Link Analyzer.

```bash
cd backend
python test_link_analyzer.py
```

This script will:
1. Check if API keys are configured
2. Test URL extraction
3. Test URL analysis (using mock data by default)
4. Test text analysis (using mock data by default)

To use real APIs instead of mocks, edit the script and set `USE_MOCKS = False` at the top of the file.

### Option 2: Unit Tests

For more comprehensive testing, use the unit test script:

```bash
cd backend
python test_link_analyzer_unittest.py
```

This script runs a full suite of tests including:
- URL extraction
- Domain extraction
- API integration tests (skipped by default)
- Mock implementation tests

To run tests with real APIs, edit the script and set `USE_REAL_APIS = True` at the top of the file.

## Test Output

Successful test output will show all tests passing. For example:

```
=== Checking API Keys ===

VirusTotal API Key: Not set
AbuseIPDB API Key: Not set
WhoisXML API Key: Not set

Running tests with MOCK API calls

To change this behavior, set USE_MOCKS = False at the top of this file.

=== Testing URL Extraction ===

Found 3 URLs:
- https://secure-bank.phishing-attempt.com/login
- https://www.google.com
- http://phishing-example.com/login.php

=== Testing Domain Extraction ===

URL: https://www.google.com/search?q=test → Domain: www.google.com
URL: http://example.com → Domain: example.com
URL: https://subdomain.domain.co.uk/path → Domain: subdomain.domain.co.uk
URL: not a url → Domain: 

=== Testing URL Analysis ===

Analyzing URL: https://www.google.com
Risk Score: 20/100
Suspicious: False

Detailed Analysis:
- Domain: www.google.com
- VirusTotal: 0 malicious, 1 suspicious detections
- AbuseIPDB: Score 0, 0 reports
- Domain Age: 1000 days
- New Domain: False

Analyzing URL: http://malware-test.com/test.php
Risk Score: 75/100
Suspicious: True

Detailed Analysis:
- Domain: malware-test.com
- VirusTotal: 10 malicious, 5 suspicious detections
- AbuseIPDB: Score 80, 25 reports
- Domain Age: 5 days
- New Domain: True

=== Testing Text Analysis ===

Analyzing text for URLs and threats...
URLs found: 1
Has suspicious URLs: True
Maximum risk score: 75/100

URL: http://securebank.phishing-example.net/verify.php?user=12345&token=abc
Risk Score: 75/100
Suspicious: True

✅ All tests completed successfully!
```

## Troubleshooting

### Missing API Keys

If you're trying to use real APIs but seeing errors about missing API keys:

1. Ensure your `.env` file is correctly formatted and located in the `backend` directory
2. Make sure the API keys are valid and have not expired
3. Check that the dotenv package is correctly installed (`pip install python-dotenv`)

### API Rate Limiting

When using real APIs, you might encounter rate limiting errors. In this case:

1. Reduce the number of tests you run
2. Implement delays between API calls
3. Consider using mock data for development

### Mock Data Issues

If you're having problems with the mock data:

1. Ensure the mock implementation is up to date with the real APIs
2. Check that the mock responses match the structure expected by the analyzer

## Adding New Tests

To add new tests:

1. Add new test cases to `test_link_analyzer_unittest.py`
2. Update mock responses in `mock_link_analyzer.py` if necessary
3. Run the tests to ensure they pass

## Continuous Integration

For CI/CD pipelines, always use the mock implementation to avoid API rate limiting and reduce dependencies. Set `USE_REAL_APIS = False` in your test scripts.

---

For further assistance or to report issues with the tests, please create a new issue in the GitHub repository.
