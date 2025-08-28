from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_caching import Cache
from analyzer.engine import analyze_announcement

app = Flask(__name__)

# Configure caching
# Using a simple in-memory cache. For production, consider 'redis' or 'memcached'.
app.config["CACHE_TYPE"] = "simple"
app.config["CACHE_DEFAULT_TIMEOUT"] = 300  # Cache results for 5 minutes

cache = Cache(app)

# Enable CORS for the React frontend
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyzer")
def analyzer_page():
    return render_template("analyzer.html")

@app.route("/about")
def about_page():
    return render_template("about.html")

@app.route("/compare")
def compare_page():
    return render_template("compare.html")

@app.route("/api/analyze", methods=["POST"])
@cache.cached(timeout=300, key_prefix='analysis_result')
def analyze_api():
    company_name = request.form.get("company_name")
    symbol = request.form.get("symbol")
    announcement_text = request.form.get("announcement_text")
    
    if not all([company_name, symbol, announcement_text]):
        return jsonify({"error": "Please provide all fields: Company Name, Stock Symbol, and Announcement Text."}), 400

    result = analyze_announcement(announcement_text, company_name, symbol)
    return jsonify(result)

@app.route("/api/compare", methods=["POST"])
def compare_api():
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

if __name__ == "__main__":
    app.run(debug=True)
