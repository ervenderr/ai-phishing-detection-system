# ML Model Files

This directory contains the trained phishing detection model based on DistilBERT.

## Large Model Files

**Note:** Large model files (>100MB) are not included in the GitHub repository due to GitHub's file size limitations. These files include:

- `model.safetensors` (~255 MB)

## Getting the Model Files

### Option 1: Train the model yourself

1. Navigate to the `ml` directory
2. Run the training script:

```bash
cd ml
python train_classifier.py
```

### Option 2: Download pre-trained models (Future enhancement)

In the future, we plan to host these models on Hugging Face Hub or another model sharing platform.

## Using the Model

The model integration code in `backend/ml_integration.py` is designed to load the model from the `ml/models/phishing-detector/` directory. If the model files are not present, you'll receive an error when trying to use the ML-dependent API endpoints.
