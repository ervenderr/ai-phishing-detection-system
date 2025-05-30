import pandas as pd
from sklearn.model_selection import train_test_split
import os

# Paths
RAW_CSV = '../data/raw/verified_online.csv'
PROCESSED_DIR = './processed'
TRAIN_CSV = os.path.join(PROCESSED_DIR, 'train.csv')
TEST_CSV = os.path.join(PROCESSED_DIR, 'test.csv')

# Ensure processed directory exists
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Load data
print('Loading data...')
df = pd.read_csv(RAW_CSV, sep=',')  # PhishTank CSV is comma-separated

# Basic cleaning: keep only url and target columns, drop NA
print('Cleaning data...')
df = df[['url', 'target']].dropna()
# Convert target to binary label (1=phishing, 0=other)
df['label'] = (df['target'].str.lower() != 'other').astype(int)

# Split data
print('Splitting data...')
train_df, test_df = train_test_split(df[['url', 'label']], test_size=0.2, random_state=42, stratify=df['label'])

# Save splits
train_df.to_csv(TRAIN_CSV, index=False)
test_df.to_csv(TEST_CSV, index=False)
print(f'Train set: {len(train_df)} rows, Test set: {len(test_df)} rows')
print('Preprocessing complete. Files saved to', PROCESSED_DIR)
