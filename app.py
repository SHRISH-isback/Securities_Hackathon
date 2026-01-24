from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from flask_caching import Cache
from analyzer.engine import analyze_announcement

app = Flask(__name__)

# Configure caching
# Using a simple in-memory cache. For production, consider 'redis' or 'memcached'.
app.config["CACHE_TYPE"] = "simple"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300  # Cache results for 5 minutes

cache = Cache(app)

# Enable CORS for the React frontend
frontend_origin = os.environ.get("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": frontend_origin}})

# Disable Flask caching for Vercel deployment (serverless functions are stateless)
app.config["CACHE_TYPE"] = "null" if os.environ.get("VERCEL") else "simple"

# For Vercel deployment, only serve API endpoints
# The frontend is deployed separately
@app.route("/")
def index():
    return jsonify({
        "message": "InsightGuard API",
        "version": "1.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "analyze": "/api/analyze (POST)",
            "compare": "/api/compare (POST)"
        }
    })

@app.route("/api/health")
def health_check():
    """Health check endpoint for monitoring"""
    return jsonify({"status": "healthy", "service": "InsightGuard API"}), 200

@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    try:
        company_name = request.form.get("company_name")
        symbol = request.form.get("symbol")
        announcement_text = request.form.get("announcement_text")
        
        if not all([company_name, symbol, announcement_text]):
            return jsonify({"error": "Please provide all fields: Company Name, Stock Symbol, and Announcement Text."}), 400

        result = analyze_announcement(announcement_text, company_name, symbol)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/api/compare", methods=["POST"])
def compare_api():
    try:
        data = request.form or request.json or {}
        left = {
            "company_name": data.get("left_company_name"),
            "symbol": data.get("left_symbol"),
            "announcement_text": data.get("left_announcement_text"),
        }
        right = {
            "company_name": data.get("right_company_name"),
            "symbol": data.get("right_symbol"),
            "announcement_text": data.get("right_announcement_text"),
        }

        if not all([left["company_name"], left["symbol"], left["announcement_text"], right["company_name"], right["symbol"], right["announcement_text"]]):
            return jsonify({"error": "Please provide both announcements completely."}), 400

        left_result = analyze_announcement(left["announcement_text"], left["company_name"], left["symbol"])
        right_result = analyze_announcement(right["announcement_text"], right["company_name"], right["symbol"])

        return jsonify({"left": left_result, "right": right_result})
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
