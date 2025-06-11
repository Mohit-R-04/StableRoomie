import model.students as student
import service.allot as allot

students = student.getStudents()
allotment = allot.allotment(students)
print(allotment)