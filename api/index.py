import sys
import os

# Add the parent directory to the Python path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

# This is the entry point for Vercel serverless functions
# The app instance is what Vercel will use to handle requests

