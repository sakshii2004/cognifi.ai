# file: app.py
import os
import io
from bson import ObjectId
import json
import pandas as pd
from flask import Flask, jsonify, request
from pymongo import MongoClient
import google.generativeai as genai  
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

# --- Initialize MongoDB and Gemini ---
mongo = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017"))
db = mongo["test"]

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')  

def strip_markdown_bold(obj):
    """Recursively remove ** from strings in a JSON-like dict/list"""
    if isinstance(obj, str):
        return obj.replace("**", "")
    elif isinstance(obj, list):
        return [strip_markdown_bold(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: strip_markdown_bold(v) for k, v in obj.items()}
    else:
        return obj


def df_to_excel_bytes(df, sheet_name):
    """Return Excel file bytes for a DataFrame"""
    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name)
    buf.seek(0)
    return buf

def df_to_string(df):
    """Convert DataFrame to a plain text string (for Gemini input)"""
    return df.to_csv(index=False)

@app.route("/generate_diagnosis", methods=["POST"])
def generate_diagnosis():
    try:
        user_id = request.json.get("user_id")
        if not user_id:
            return jsonify({"error": "user_id required"}), 400
        
        try:
            user_obj_id = ObjectId(user_id)
        except Exception:
            return jsonify({"error": "Invalid user_id"}), 400

        # 1️⃣ Fetch data from MongoDB
        incomes = list(db.incomes.find({"user": user_obj_id}, {"_id": 0}))
        expenses = list(db.expenses.find({"user": user_obj_id}, {"_id": 0}))

        if not incomes and not expenses:
            return jsonify({"error": "No income/expense data found"}), 404

        # 2️⃣ Convert to DataFrames
        income_df = pd.DataFrame(incomes) if incomes else pd.DataFrame()
        expense_df = pd.DataFrame(expenses) if expenses else pd.DataFrame()

        # 3️⃣ Save Excel files (optional)
        if not income_df.empty:
            df_to_excel_bytes(income_df, "Income")
        if not expense_df.empty:
            df_to_excel_bytes(expense_df, "Expenses")

        # 4️⃣ Convert to string (for Gemini)
        income_str = df_to_string(income_df) if not income_df.empty else "No income records."
        expense_str = df_to_string(expense_df) if not expense_df.empty else "No expense records."

        # 5️⃣ Create AI prompt
        prompt = f"""
You are an AI personal finance coach.
Below is the user's income and expense data from their finance tracker.

Analyze this data and generate:
1. A concise financial diagnosis summary (3-4 lines).
2. Top 3 spending insights.
3. 3 actionable recommendations to improve financial health.

Return your response in strict JSON format:
{{
  "summary": "...",
  "insights": ["...", "...", "..."],
  "recommendations": ["...", "...", "..."]
}}

Return only the JSON, do NOT include ``` or any extra text.


--- Income Data ---
{income_str}

--- Expense Data ---
{expense_str}
"""

        # 6️⃣ Call Gemini using the working API
        try:
            response = model.generate_content(prompt)
            json_response = response.text
        except Exception as e:
            return jsonify({"error": f"Gemini API call failed: {str(e)}"}), 500

        # 7️⃣ Parse the JSON
        try:
            result = json.loads(json_response)
            result = strip_markdown_bold(result)
        except Exception as e:
            # fallback: return raw response if parsing fails
            result = {"raw_response": json_response}

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
