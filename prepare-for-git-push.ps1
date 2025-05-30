# This script removes large model files before pushing to Git
# It's recommended to run this script before pushing to GitHub

echo "Removing large model files before Git push..."

# Check if model.safetensors exists and remove it
if (Test-Path -Path "ml/models/phishing-detector/model.safetensors") {
    git rm --cached ml/models/phishing-detector/model.safetensors
    echo "Removed model.safetensors from Git index"
}

# Add any other large files to check for here
# Example:
# if (Test-Path -Path "path/to/large/file") {
#     git rm --cached path/to/large/file
#     echo "Removed large file from Git index"
# }

echo "Done! You can now push to GitHub."
echo "Note: The files still exist locally, they're just not tracked by Git anymore."
