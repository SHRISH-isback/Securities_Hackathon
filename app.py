from flask import Flask, render_template, request, jsonify
from analyzer.engine import analyze_announcement

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/analyzer")
def analyzer_page():
    return render_template("analyzer.html")

@app.route("/about")
def about_page():
    return render_template("about.html")

@app.route("/api/analyze", methods=["POST"])
def analyze_api():
    company_name = request.form.get("company_name")
    symbol = request.form.get("symbol")
    announcement_text = request.form.get("announcement_text")
    
    if not all([company_name, symbol, announcement_text]):
        return jsonify({"error": "Please provide all fields: Company Name, Stock Symbol, and Announcement Text."}), 400

    result = analyze_announcement(announcement_text, company_name, symbol)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
