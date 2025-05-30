from typing import Dict, List, Union
import os
import sys
import torch
from fastapi import HTTPException
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# Add the ml directory to the Python path so we can import modules from there if needed
ml_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml")
sys.path.append(ml_dir)

# Path to the saved model
MODEL_DIR = os.path.join(ml_dir, "models", "phishing-detector")

# Load the model and tokenizer
try:
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_DIR)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
    print("ML model loaded successfully!")
except Exception as e:
    print(f"Error loading ML model: {e}")
    # Don't raise an exception here, as this will only run when the module is imported
    # Instead, we'll handle failure scenarios in the prediction function

def classify_text(text: str) -> Dict[str, Union[str, float]]:
    """
    Classify text (URL, email subject, etc.) for phishing probability
    
    Args:
        text: The text to classify
        
    Returns:
        Dict containing classification result and confidence score
    """
    if not text or not isinstance(text, str):
        raise HTTPException(status_code=400, detail="Invalid text provided")
    
    try:
        # Check if model was loaded properly
        if 'model' not in globals() or 'tokenizer' not in globals():
            raise HTTPException(
                status_code=500, 
                detail="ML model not properly loaded. Check server logs."
            )
        
        # Tokenize the input text
        inputs = tokenizer(
            text,
            padding="max_length",
            truncation=True,
            max_length=128,
            return_tensors="pt"
        )
        
        # Move to GPU if available
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Make prediction
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probabilities = torch.nn.functional.softmax(logits, dim=-1)
            predicted_class = torch.argmax(probabilities, dim=-1).item()
            confidence = probabilities[0][predicted_class].item()
        
        # Return classification results
        result = {
            "is_phishing": bool(predicted_class),  # 0: not phishing, 1: phishing
            "confidence": confidence,
            "verdict": "phishing" if predicted_class == 1 else "safe",
            "risk_score": round(confidence * 100) if predicted_class == 1 else round((1 - confidence) * 100)
        }
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
