import io
import os
import json
import sqlite3
from datetime import datetime
import joblib
import numpy as np
import pandas as pd
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    send_file,
    url_for,
    redirect,
    flash,
)
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# ----- Config -----
DB_PATH = "predictions.db"
MODEL_PATH = "diabetes_model.pkl"

# ----- Load model + threshold -----
THRESHOLD = float(os.environ.get("THRESHOLD", 0.502))
model = joblib.load(MODEL_PATH)

# features order must match training
FEATURES = [
    "HighBP", "HighChol", "CholCheck", "BMI", "Smoker", "Stroke",
    "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies",
    "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost",
    "GenHlth", "MentHlth", "PhysHlth", "DiffWalk",
    "Gender", "Age", "Education", "Income",
]

# ----- App -----
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "fallback_random_key")

# ----- DB helpers -----
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT,
            input_json TEXT,
            prob REAL,
            result INTEGER
        )
    """)
    conn.commit()
    conn.close()

def save_record(input_dict, prob, result):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO predictions (created_at, input_json, prob, result) VALUES (?, ?, ?, ?)",
        (datetime.utcnow().isoformat(), json.dumps(input_dict, ensure_ascii=False), float(prob), int(result))
    )
    conn.commit()
    rec_id = c.lastrowid
    conn.close()
    return rec_id

def get_record(rec_id):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT id, created_at, input_json, prob, result FROM predictions WHERE id = ?", (rec_id,))
    row = c.fetchone()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "created_at": row[1], "input": json.loads(row[2]), "prob": row[3], "result": row[4]}

init_db()

# ----- Validation + BMI calculation -----
def parse_and_validate(form_or_json, source="form"):
    data = {}
    errors = []

    #  Height and Weight 
    try:
        height_cm = float(form_or_json.get("Height", 0))
        weight_kg = float(form_or_json.get("Weight", 0))
        if not (50 <= height_cm <= 250):
            errors.append("Height out of range (50-250 cm)")
        if not (20 <= weight_kg <= 300):
            errors.append("Weight out of range (20-300 kg)")
    except:
        errors.append("Invalid Height or Weight")
    
    # محاسبه BMI
    if not errors:
        height_m = height_cm / 100
        bmi = weight_kg / (height_m ** 2)
        bmi = round(bmi, 1)  
        data["BMI"] = bmi
        data["Height"] = height_cm
        data["Weight"] = weight_kg

    # دریافت بقیه ویژگی‌ها
    for feature in FEATURES:
        if feature in ["BMI", "Height", "Weight"]:
            continue  
        raw = form_or_json.get(feature)
        if raw is None:
            errors.append(f"Missing field: {feature}")
            continue
        try:
            if feature in ["MentHlth", "PhysHlth"]:
                val = int(raw)
            else:
                val = int(raw) if raw else 0
        except:
            errors.append(f"Invalid value for {feature}")
            continue
        data[feature] = val

    if errors:
        return False, {"errors": errors}

    try:
        row = pd.DataFrame([[data[f] for f in FEATURES]], columns=FEATURES)
    except Exception as e:
        return False, {"errors": [f"Data error: {str(e)}"]}

    return True, {"data": data, "row": row}

# ----- Routes -----
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        valid, payload = parse_and_validate(request.form)
        if not valid:
            for e in payload["errors"]:
                flash(e, "danger")
            return redirect(url_for("index"))

        row = payload["row"]
        data = payload["data"]
        prob = model.predict_proba(row)[0][1]
        result = int(prob > THRESHOLD)
        rec_id = save_record(data, prob, result)
        prob_percent = f"{prob:.1%}"

        return render_template("result.html", prediction={
            "result": result,
            "prob": prob_percent,
            "id": rec_id,
            "date": datetime.now().strftime("%B %d, %Y")
        })

    return render_template("index.html")

@app.route("/api/predict", methods=["POST"])
def api_predict():
    if not request.is_json:
        return jsonify({"error": "JSON required"}), 400

    valid, payload = parse_and_validate(request.get_json())
    if not valid:
        return jsonify({"errors": payload["errors"]}), 400

    row = payload["row"]
    data = payload["data"]
    prob = model.predict_proba(row)[0][1]
    result = int(prob > THRESHOLD)
    rec_id = save_record(data, prob, result)

    return jsonify({"prob": float(prob), "result": result, "id": rec_id})

@app.route("/download/<int:rec_id>")
def download_pdf(rec_id):
    rec = get_record(rec_id)
    if not rec:
        return "Record not found", 404

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Header
    p.setFillColorRGB(0.1, 0.5, 0.7)
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredString(width / 2, height - 80, "Diabetes Risk Assessment Report")

    p.setFillColorRGB(0.3, 0.3, 0.3)
    p.setFont("Helvetica-Oblique", 12)
    p.drawCentredString(width / 2, height - 110, "10-Year Type 2 Diabetes Risk Prediction")

    p.setStrokeColorRGB(0.1, 0.7, 0.6)
    p.setLineWidth(3)
    p.line(50, height - 130, width - 50, height - 130)

    # Details
    p.setFillColorRGB(0, 0, 0)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 160, "Report Details")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 190, f"Report ID: {rec['id']}")
    p.drawString(50, height - 210, f"Generated: {datetime.fromisoformat(rec['created_at']).strftime('%B %d, %Y at %H:%M UTC')}")
    p.drawString(50, height - 230, f"Risk Probability: {rec['prob']:.1%}")
    p.drawString(50, height - 250, f"Final Result: {'HIGH RISK' if rec['result']==1 else 'LOW RISK'}")

    # Risk Box
    if rec['result'] == 1:
        p.setFillColorRGB(0.95, 0.3, 0.3)
    else:
        p.setFillColorRGB(0.3, 0.8, 0.5)
    p.rect(380, height - 260, 160, 50, fill=1)
    p.setFillColorRGB(1, 1, 1)
    p.setFont("Helvetica-Bold", 18)
    p.drawCentredString(460, height - 235, "HIGH RISK" if rec['result']==1 else "LOW RISK")

    # Answers
    p.setFillColorRGB(0, 0, 0)
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, height - 310, "Your Answers")
    p.setFont("Helvetica", 11)
    y = height - 340

    readable = {
        "HighBP": "High Blood Pressure", "HighChol": "High Cholesterol", "CholCheck": "Cholesterol Check (5y)",
        "BMI": "Body Mass Index (BMI)", "Smoker": "Current Smoker", "Stroke": "History of Stroke",
        "HeartDiseaseorAttack": "Heart Disease or Attack", "PhysActivity": "Physical Activity",
        "Fruits": "Eat Fruit Daily", "Veggies": "Eat Vegetables Daily", "HvyAlcoholConsump": "Heavy Alcohol Use",
        "AnyHealthcare": "Have Health Insurance", "NoDocbcCost": "Couldn’t See Doctor Due to Cost",
        "GenHlth": "General Health (1=Excellent, 5=Poor)", "MentHlth": "Poor Mental Health Days (past 30)",
        "PhysHlth": "Poor Physical Health Days (past 30)", "DiffWalk": "Difficulty Walking",
        "Gender": "Gender (0=Female, 1=Male)", "Age": "Age Group", "Education": "Education Level",
        "Income": "Annual Household Income", "Height": "Height (cm)", "Weight": "Weight (kg)"
    }

    for i, (key, value) in enumerate(rec["input"].items()):
        if i % 2 == 0:
            p.setFillColorRGB(0.95, 0.95, 0.95)
            p.rect(50, y - 8, width - 100, 20, fill=1)
        p.setFillColorRGB(0, 0, 0)
        label = readable.get(key, key)
        p.drawString(60, y, f"• {label}")
        p.drawString(380, y, str(value))
        y -= 25
        if y < 80:
            p.showPage()
            y = height - 50

    # Footer
    p.setFont("Helvetica-Oblique", 9)
    p.setFillColorRGB(0.4, 0.4, 0.4)
    p.drawCentredString(width / 2, 30, "This is a screening tool • Not a medical diagnosis • Consult a healthcare provider")

    p.save()
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"Diabetes_Risk_Report_{rec['id']}_{datetime.now().strftime('%Y%m%d')}.pdf",
        mimetype="application/pdf"
    )

@app.route("/record/<int:rec_id>")
def view_record(rec_id):
    rec = get_record(rec_id)
    if not rec:
        return "Not found", 404
    return jsonify(rec)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
