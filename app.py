import io
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
THRESHOLD_PATH = "threshold.json"

# ----- Load model + threshold -----
model = joblib.load(MODEL_PATH)
with open(THRESHOLD_PATH, "r") as f:
    THRESHOLD = float(json.load(f)["threshold"])

# features order must match training
FEATURES = [
    "HighBP",
    "HighChol",
    "CholCheck",
    "BMI",
    "Smoker",
    "Stroke",
    "HeartDiseaseorAttack",
    "PhysActivity",
    "Fruits",
    "Veggies",
    "HvyAlcoholConsump",
    "AnyHealthcare",
    "NoDocbcCost",
    "GenHlth",
    "MentHlth",
    "PhysHlth",
    "DiffWalk",
    "Gender",
    "Age",
    "Education",
    "Income",
]

# ----- App -----
app = Flask(__name__)
app.secret_key = "replace_this_with_a_secure_random_key"

# ----- DB helpers -----
def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT,
        input_json TEXT,
        prob REAL,
        result INTEGER
    )
    """
    )
    conn.commit()
    conn.close()


def save_record(input_dict, prob, result):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        "INSERT INTO predictions (created_at, input_json, prob, result) VALUES (?, ?, ?, ?)",
        (datetime.utcnow().isoformat(), json.dumps(input_dict, ensure_ascii=False), float(prob), int(result)),
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


# initialize DB
init_db()


# ----- utility: build dataframe from inputs and validate server-side -----
def parse_and_validate(form_or_json, source="form"):
    """
    Accepts either request.form (ImmutableMultiDict) or a JSON dict (parsed).
    Returns: (valid, data_dict or errors)
    """
    data = {}
    errors = []
    for feature in FEATURES:
        raw = form_or_json.get(feature)
        if raw is None:
            errors.append(f"فیلد {feature} ارسال نشده.")
            continue

        # boolean encoded as "0"/"1" for many features
        # For numeric fields (BMI, MentHlth, PhysHlth, GenHlth, Age, Education, Income) we allow numeric
        if feature in ["BMI"]:
            try:
                val = float(raw)
            except:
                errors.append(f"فیلد {feature} باید عددی باشد.")
                continue
        elif feature in ["MentHlth", "PhysHlth"]:
            try:
                val = int(raw)
            except:
                errors.append(f"فیلد {feature} باید عدد صحیح باشد.")
                continue
        else:
            # Accept ints or strings representing 0/1 or category codes
            try:
                # allow floats for safety but cast to int when appropriate
                if "." in str(raw):
                    val = float(raw)
                else:
                    val = int(raw)
            except:
                # fallback to raw string
                val = raw

        data[feature] = val

    if errors:
        return False, {"errors": errors}

    # create DataFrame row with specified column order
    try:
        row = pd.DataFrame([[data[f] for f in FEATURES]], columns=FEATURES)
    except Exception as e:
        return False, {"errors": [f"خطا در ایجاد DataFrame: {str(e)}"]}

    return True, {"data": data, "row": row}


# ----- Routes -----
@app.route("/", methods=["GET", "POST"])
def index():
    prediction = None
    record_id = None
    prob = None
    if request.method == "POST":
        valid, payload = parse_and_validate(request.form, source="form")
        if not valid:
            for e in payload["errors"]:
                flash(e, "danger")
            return redirect(url_for("index"))

        row = payload["row"]
        data = payload["data"]

        # predict probability
        prob = model.predict_proba(row)[0][1]
        result = int(prob > THRESHOLD)

        # save to DB and return
        record_id = save_record(data, prob, result)
        prediction = {"prob": round(float(prob), 4), "result": result, "id": record_id}

    return render_template("index.html", prediction=prediction, threshold=THRESHOLD)


@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    Accepts JSON with the FEATURES keys. Returns JSON:
    { "prob": float, "result": 0/1, "id": int }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload_json = request.get_json()
    valid, payload = parse_and_validate(payload_json, source="json")
    if not valid:
        return jsonify({"errors": payload["errors"]}), 400

    row = payload["row"]
    data = payload["data"]
    prob = model.predict_proba(row)[0][1]
    result = int(prob > THRESHOLD)
    rec_id = save_record(data, prob, result)
    return jsonify({"prob": float(prob), "result": result, "id": rec_id})


@app.route("/download/<int:rec_id>", methods=["GET"])
def download_pdf(rec_id):
    rec = get_record(rec_id)
    if not rec:
        return "Record not found", 404

    # build PDF in-memory
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, height - 50, "گزارش پیش‌بینی دیابت")
    p.setFont("Helvetica", 12)
    p.drawString(40, height - 80, f"شناسه گزارش: {rec['id']}")
    p.drawString(40, height - 100, f"زمان (UTC): {rec['created_at']}")
    p.drawString(40, height - 120, f"احتمال دیابت (model prob): {rec['prob']:.4f}")
    p.drawString(40, height - 140, f"نتیجه با threshold={THRESHOLD}: {'مثبت' if rec['result']==1 else 'منفی'}")
    p.drawString(40, height - 170, "ورودی‌ها:")

    y = height - 190
    for k, v in rec["input"].items():
        p.drawString(60, y, f"{k}: {v}")
        y -= 16
        if y < 50:
            p.showPage()
            y = height - 50

    p.showPage()
    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"diabetes_report_{rec_id}.pdf",
        mimetype="application/pdf",
    )


# optional: simple page to view a record (could be extended)
@app.route("/record/<int:rec_id>")
def view_record(rec_id):
    rec = get_record(rec_id)
    if not rec:
        return "Not found", 404
    return jsonify(rec)


# run
if __name__ == "__main__":
    # debug True for development; switch to False in production
    app.run(host="0.0.0.0", port=5000, debug=True)
