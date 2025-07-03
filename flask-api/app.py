from flask import Flask, request, jsonify
from datetime import datetime
import itertools
from flask_cors import CORS
import requests
import json

import model.students as student
import service.allot as allot

app = Flask(__name__)
CORS(app)

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

    print("Request Data Sent:", request_data)

    # Make the POST request to the Java backend
    response = requests.post("http://localhost:8080/getStudents", json=request_data, headers=headers)

    print("Response Status Code:", response.status_code)
    print("Response Text:", response.text)

    if response.status_code != 200:
        return jsonify({
            "message": f"Failed to fetch students from external API, status code: {response.status_code}",
            "response_text": response.text
        }), 500

    # Parse the response JSON
    try:
        students = response.json()
        print("Parsed Students:", students)
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
        allotment, roomType = allot.allotment(students)
        print(allotment)
        print(roomType)
        payload = {"groups":[], "roomType": roomType}
        for group in allotment:
            formGroup = {"student_1": group[0], "students_2": group[1], "student_3": group[2]}
            payload["groups"].append(formGroup)
        print(payload)
        response = requests.post("http://localhost:8080/save-groups", json=payload, headers=headers)
        print(response)
        print(allotment)
        return jsonify({"message": "Allotment Successful"})
    except Exception as e:  # Fixed: Use Exception instead of sys.exception
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)