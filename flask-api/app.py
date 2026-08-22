from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

import service.allot as allot

app = Flask(__name__)
CORS(app)

# Configure logging for production
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200


@app.route('/allot', methods=['POST'])
def allot_students():
    """Run the 2-phase matching (mutual preferences, then Louvain
    compatibility) on ONE room-type list of students.

    Spring Boot performs the preference-based grouping itself and sends the
    students of a single room-type list inline, so this service no longer
    calls back into Java.
    """
    try:
        request_data = request.get_json() or {}
    except Exception as e:
        return jsonify({"message": f"Invalid request data: {str(e)}"}), 400

    students = request_data.get("students") or []
    try:
        capacity = int(request_data.get("capacity", 3))
    except (TypeError, ValueError):
        return jsonify({"message": "capacity must be a number"}), 400

    if not students:
        return jsonify({"groups": []}), 200

    try:
        groups = allot.allotment(students, capacity=capacity)
        return jsonify({"groups": groups}), 200
    except Exception as e:
        logger.error(f"Error during allotment: {str(e)}")
        return jsonify({"message": f"Allotment failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
