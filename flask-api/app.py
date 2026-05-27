from flask import Flask, request, jsonify
from datetime import datetime
import itertools
from flask_cors import CORS
import requests
import json
import os
import logging

import model.students as student
import service.allot as allot

app = Flask(__name__)
CORS(app)

# Configure logging for production
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

java_backend_url = os.environ.get("JAVA_BACKEND_URL", "http://localhost:8080")

@app.route('/', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"}), 200

@app.route('/allot_roommates', methods=['POST'])
def allot_roommates():
    headers = {
        "Content-Type": "application/json"
    }
    # Parse incoming request data
    try:
        request_data = request.get_json() or {}
    except Exception as e:
        return jsonify({"message": f"Invalid request data: {str(e)}"}), 400

    # Make the POST request to the Java backend
    response = requests.post(f"{java_backend_url}/getStudents", json=request_data, headers=headers)

    if response.status_code != 200:
        return jsonify({
            "message": f"Failed to fetch students from external API, status code: {response.status_code}",
            "response_text": response.text
        }), 500

    # Parse the response JSON
    try:
        students = response.json()
    except requests.exceptions.JSONDecodeError as e:
        return jsonify({
            "message": f"Invalid JSON response: {str(e)}",
            "response_text": response.text
        }), 500

    # Check if the students list is empty
    if not students:
        return jsonify({"message": "No Students found with this filter"}), 400

    # Perform the allotment
    try:
        # Allot roommates using matching algorithm
        allotment, roomType = allot.allotment(students)
        
        # Build payload with only students that exist
        payload = {"groups": [], "roomType": roomType}
        for group in allotment:
            formGroup = {}
            if len(group) > 0:
                formGroup["student_1"] = group[0]
            if len(group) > 1:
                formGroup["student_2"] = group[1]
            if len(group) > 2:
                formGroup["student_3"] = group[2]
            if formGroup:  # Only add non-empty groups
                payload["groups"].append(formGroup)
        
        # Send groups to Java backend for persistence
        response = requests.post(f"{java_backend_url}/save-groups", json=payload, headers=headers)
        
        if response.status_code != 200:
            return jsonify({
                "message": f"Failed to save groups, status code: {response.status_code}",
                "response_text": response.text
            }), 500
        
        return jsonify({"message": "Allotment Successful", "groups": payload["groups"], "roomType": roomType}), 200
    except Exception as e:
        logger.error(f"Error during allotment: {str(e)}")
        return jsonify({"message": f"Allotment failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)