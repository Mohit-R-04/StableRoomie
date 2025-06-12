from ast import List
from sys import exception
from flask import Flask, request, jsonify
from datetime import datetime
import itertools
from flask_cors import CORS 

import model.students as student
import service.allot as allot

app = Flask(__name__)
CORS(app)

@app.route('/allot_roommates', methods=['POST'])
def allot_roommates():
    data = request.get_json()
    print(data)
    students = student.getStudents(data)
    if not students:
        return jsonify({"message": "Invalid input: Expecting a dictionary of students"}), 400
    try:
        allotment = allot.allotment(students)
        print(allotment)
        return jsonify({"message":"Allotment Successful"})
    except exception as e:
        return jsonify({"message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)