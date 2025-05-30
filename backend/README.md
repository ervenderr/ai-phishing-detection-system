# AI Phishing Detection System - Backend

This is the backend component of the AI Phishing Detection System. It provides API endpoints for scanning emails and text for phishing attempts.

## Setup

1. Activate the virtual environment:

```bash
# On Windows
cd backend
.\venv\Scripts\activate

# On Linux/Mac
cd backend
source venv/bin/activate
```

2. Install the dependencies:

```bash
pip install -r requirements.txt
```

3. Run the server:

```bash
uvicorn main:app --reload
```

The server will start at http://127.0.0.1:8000.

## API Endpoints

### Status Check

```
GET /status
```

Returns the current status of the API.

### Scan Email

```
POST /scan-email
```

Scans an email for phishing attempts.

Request body:

```json
{
  "subject": "Email subject",
  "sender": "sender@example.com",
  "recipient": "recipient@example.com",
  "body": "Email body text"
}
```

### Parse EML File

```
POST /parse-eml
```

Parses an email file (.eml) and returns its components.

### Classify Text

```
POST /classify-text
```

Classifies text (URL, email subject, etc.) using the ML model.

Request body:

```json
{
  "text": "Text to classify",
  "context": "Optional context"
}
```

## Testing

You can test the API using the included test script:

```bash
python test_api.py
```

This will test the `/classify-text` and `/scan-email` endpoints with sample data.

## Integration

The backend integrates with the trained ML model from the `/ml` directory. The model is loaded when the server starts and is used to classify text for phishing detection.

## Model Metrics

The current model achieves:

- Accuracy: 95.22%
- Precision: 75.87%
- Recall: 47.38%
- F1 Score: 58.33%
