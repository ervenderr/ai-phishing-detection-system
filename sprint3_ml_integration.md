# Sprint 3: ML Model API Integration

This document provides instructions on how to run and test the integrated ML model with the FastAPI backend.

## Overview

We have successfully integrated the trained DistilBERT phishing detection model with our FastAPI backend. The integration includes:

1. A new `/classify-text` endpoint to classify text (URLs, email subjects, etc.) for phishing detection
2. Updated `/scan-email` endpoint that uses the ML model to analyze both subject and body
3. A test script to verify the integration is working correctly

## Running the Integrated System

1. First, ensure you have all the required dependencies installed:

```bash
cd backend
# Activate your virtual environment
.\venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac

# Install the required dependencies
pip install -r requirements.txt
```

2. Start the FastAPI server:

```bash
cd backend
uvicorn main:app --reload
```

3. The server should now be running at `http://127.0.0.1:8000`. You can verify this by accessing the API documentation at `http://127.0.0.1:8000/docs` in your web browser.

## Testing the Integration

1. In a new terminal window, run the test script:

```bash
cd backend
# Activate your virtual environment if not already activated
.\venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Linux/Mac

python test_api.py
```

2. The test script will:

   - Test the `/classify-text` endpoint with known phishing and safe URLs
   - Test the `/scan-email` endpoint with sample phishing and legitimate emails
   - Display the verdicts and confidence scores for each test case

3. You can also use the Swagger UI at `http://127.0.0.1:8000/docs` to test the endpoints manually:
   - Click on an endpoint
   - Click "Try it out"
   - Enter the required parameters
   - Click "Execute"

## Expected Results

- The `/classify-text` endpoint should return a verdict (phishing/safe), confidence score, and risk score for the provided text
- The `/scan-email` endpoint should analyze both subject and body, providing detailed results for each component
- The model should generally classify known phishing URLs/emails as malicious and legitimate ones as safe

## Model Performance

Our current model achieves:

- Accuracy: 95.22%
- Precision: 75.87%
- Recall: 47.38%
- F1 Score: 58.33%

These metrics indicate that the model is quite accurate overall but may have some room for improvement in recall (identifying all phishing instances). Future improvements could focus on improving the recall without sacrificing precision.

## Model Files

**Important Note:** The model file (`model.safetensors`) is approximately 255 MB, which exceeds GitHub's file size limit of 100 MB. Therefore, this file is excluded from the Git repository. You have two options:

1. Train the model yourself using the training script in the ML directory:

   ```bash
   cd ml
   python train_classifier.py
   ```

2. Request the model file directly from a team member who has already trained it.

For more information, see the README.md file in the `ml/models/phishing-detector/` directory.

## Troubleshooting

If you encounter any issues:

1. Ensure that the ML model files are correctly located at `/ml/models/phishing-detector/`
2. Check that the path in `ml_integration.py` is correctly pointing to your model files
3. Verify that all dependencies are installed correctly
4. Look for any error messages in the server console output

If the model fails to load, you may see an error message when starting the server. The API will still function but will return an error when attempting to use the ML-dependent endpoints.
