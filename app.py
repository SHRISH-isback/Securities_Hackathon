from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from analyzer.engine import analyze_announcement

app = Flask(__name__)

# Enable CORS for the React frontend
frontend_origin = os.environ.get("FRONTEND_ORIGIN", "*")
CORS(app, resources={r"/api/*": {"origins": frontend_origin}})


def _get_field(data: dict, *keys: str):
    """Return the first non-empty value found among the given keys."""
    for k in keys:
        v = data.get(k)
        if v:
            return v
    return None


def _parse_request():
    """
    Unified parser: accepts multipart/form-data OR application/json bodies.
    Returns (company_name, symbol, announcement_text) or raises ValueError.
    """
    if request.is_json:
        data = request.get_json(silent=True) or {}
    else:
        data = request.form

    company_name = _get_field(data, "company_name")
    symbol = _get_field(data, "symbol")
    announcement_text = _get_field(data, "announcement_text")

    fields = [
        ("company_name", company_name),
        ("symbol", symbol),
        ("announcement_text", announcement_text),
    ]
    missing = [f for f, v in fields if not v]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    return company_name, symbol, announcement_text


@app.route("/")
def index():
    return jsonify({
        "message": "InsightGuard API",
        "version": "2.0",
        "status": "running",
        "endpoints": {
            "health": "/api/health",
            "analyze": "/api/analyze (POST)",
            "compare": "/api/compare (POST)",
        },
    })


@app.route("/api/health")
def health_check():
    """Health check endpoint for monitoring."""
    return jsonify({"status": "healthy", "service": "InsightGuard API"}), 200


@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    try:
        company_name, symbol, announcement_text = _parse_request()
        result = analyze_announcement(announcement_text, company_name, symbol)
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "An internal error occurred. Please try again."}), 500


@app.route("/api/compare", methods=["POST"])
def compare_api():
    try:
        if request.is_json:
            data = request.get_json(silent=True) or {}
        else:
            data = request.form

        left = {
            "company_name": _get_field(data, "left_company_name"),
            "symbol": _get_field(data, "left_symbol"),
            "announcement_text": _get_field(data, "left_announcement_text"),
        }
        right = {
            "company_name": _get_field(data, "right_company_name"),
            "symbol": _get_field(data, "right_symbol"),
            "announcement_text": _get_field(data, "right_announcement_text"),
        }

        missing_left  = [k for k, v in left.items()  if not v]
        missing_right = [k for k, v in right.items() if not v]
        if missing_left or missing_right:
            return jsonify({"error": "Please provide both announcements completely."}), 400

        left_result  = analyze_announcement(left["announcement_text"],  left["company_name"],  left["symbol"])
        right_result = analyze_announcement(right["announcement_text"], right["company_name"], right["symbol"])

        return jsonify({"left": left_result, "right": right_result})
    except Exception:
        return jsonify({"error": "An internal error occurred. Please try again."}), 500


@app.route("/favicon.ico")
def favicon():
    return "", 204


if __name__ == "__main__":
    app.run(debug=True)

