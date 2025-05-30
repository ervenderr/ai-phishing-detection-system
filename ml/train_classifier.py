import os
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import torch
from transformers import (
    DistilBertTokenizer, 
    DistilBertForSequenceClassification, 
    TrainingArguments, 
    Trainer
)
from datasets import Dataset

# Paths
PROCESSED_DIR = './processed'
MODEL_DIR = './models/phishing-detector'
TRAIN_CSV = os.path.join(PROCESSED_DIR, 'train.csv')
TEST_CSV = os.path.join(PROCESSED_DIR, 'test.csv')

# Create model directory
os.makedirs(MODEL_DIR, exist_ok=True)

# Load and prepare data
print("Loading preprocessed data...")
train_df = pd.read_csv(TRAIN_CSV)
test_df = pd.read_csv(TEST_CSV)

# Convert to HuggingFace datasets
train_dataset = Dataset.from_pandas(train_df)
test_dataset = Dataset.from_pandas(test_df)

# Load model and tokenizer
print("Loading tokenizer and model...")
model_name = "distilbert-base-uncased"
tokenizer = DistilBertTokenizer.from_pretrained(model_name)
model = DistilBertForSequenceClassification.from_pretrained(model_name, num_labels=2)

# Tokenize URLs
def tokenize_function(examples):
    return tokenizer(
        examples["url"],
        padding="max_length",
        truncation=True,
        max_length=128  # URLs are generally shorter
    )

print("Tokenizing datasets...")
train_tokenized = train_dataset.map(tokenize_function, batched=True)
test_tokenized = test_dataset.map(tokenize_function, batched=True)

# Define metrics function
def compute_metrics(pred):
    labels = pred.label_ids
    preds = pred.predictions.argmax(-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average='binary'
    )
    acc = accuracy_score(labels, preds)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

# Define training arguments
training_args = TrainingArguments(
    output_dir=os.path.join(MODEL_DIR, "checkpoints"),
    eval_steps=500,  # Evaluate every 500 steps
    save_steps=500,  # Save checkpoint every 500 steps
    learning_rate=5e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    num_train_epochs=3,
    weight_decay=0.01,
    logging_dir=os.path.join(MODEL_DIR, "logs"),
    logging_steps=100,
    save_total_limit=2  # Only keep the 2 best checkpoints
)

# Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_tokenized,
    eval_dataset=test_tokenized,
    compute_metrics=compute_metrics,
)

# Train the model
print("Training model...")
trainer.train()

# Evaluate the model
print("Evaluating model...")
evaluation = trainer.evaluate()
print(f"Evaluation results: {evaluation}")

# Save the model and tokenizer
print("Saving model...")
trainer.save_model(MODEL_DIR)
tokenizer.save_pretrained(MODEL_DIR)

print(f"Model training complete! Model saved to {MODEL_DIR}")