# AI-Powered Phishing Detection System

A comprehensive system for detecting phishing attempts in emails and URLs using machine learning and security APIs.

## Project Overview

This system combines modern frontend technologies, robust backend APIs, and state-of-the-art machine learning to provide effective phishing detection capabilities:

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Python FastAPI
- **ML Engine**: HuggingFace transformers (DistilBERT)
- **Database**: (TBD)

## Features

- Email parsing and analysis
- URL and domain reputation checking
- Machine learning-based text classification
- Comprehensive phishing verdict engine
- Modern and intuitive user interface

## Project Structure

```
ai-phishing-detection-system/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend services
├── ml/                # Machine learning models and training
├── data/              # Datasets and data processing
└── db/                # Database schemas and migrations
```

## Current Progress

### Completed

- ✅ Project initialization and folder structure
- ✅ Frontend setup with Next.js, TypeScript, and Tailwind CSS
- ✅ Backend API with FastAPI
- ✅ Email parser implementation
- ✅ Dataset collection and preprocessing
- ✅ ML model training with DistilBERT (95.22% accuracy)
- ✅ ML model integration with API
- ✅ CI/CD workflow setup

### In Progress

- 🔄 Link and domain analysis components
- 🔄 Verdict engine development

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

### ML Setup

```bash
# Navigate to ML directory
cd ml

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Train the model (required as large model files are not in GitHub)
python train_classifier.py
```

**Note about the ML model:** Due to GitHub's file size limitations (100MB max), the trained model file (`model.safetensors`, ~255MB) is not included in the repository. You'll need to train the model yourself using the provided training script or obtain it from a team member.

## ML Model Performance

Our current phishing detection model achieves:

- Accuracy: 95.22%
- Precision: 75.87%
- Recall: 47.38%
- F1 Score: 58.33%

## Project Roadmap

- **Sprint 1-2**: Project setup and initial implementation ✅
- **Sprint 3**: ML model training and integration ✅
- **Sprint 4**: Link and domain analysis components 🔄
- **Sprint 5**: Verdict engine and alert system
- **Sprint 6**: User interface development
- **Sprint 7**: Admin features and feedback system
- **Sprint 8**: QA, testing, and deployment

## License

[MIT License](LICENSE)

## Acknowledgments

- [PhishTank](https://www.phishtank.com/) for providing phishing URL datasets
- [HuggingFace](https://huggingface.co/) for transformer models and tools
