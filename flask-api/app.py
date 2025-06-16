from ast import List
from sys import exception
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
    response = requests.post("http://localhost:8080/getStudents", data=request.data, headers=headers)  # Change to your actual API URL

    if response.status_code != 200:
        return jsonify({"message": "Failed to fetch students from external API"}), 500

    # Step 2: Parse the response JSON
    students = response.json()
    print(students)
    if not students:
        return jsonify({"message": "No Students found with this filter"}), 400
    try:
        allotment = allot.allotment(students)
        return jsonify({"message":"Allotment Successful"})
    except exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)