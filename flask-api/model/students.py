class Student:
    def __init__(self, id, sleep_time, wake_time, noise_tolerance, light_sensitivity, cleanliness, friend1=None, friend2=None):
        self.id = id
        self.sleep_time = sleep_time      
        self.wake_time = wake_time        
        self.noise_tolerance = noise_tolerance  # "High", "Medium", "Low"
        self.light_sensitivity = light_sensitivity  # "High", "Low"
        self.cleanliness = cleanliness    # "High", "Medium", "No Problem"
        self.friend1 = friend1            # friend1's student id
        self.friend2 = friend2            # friend2's student id
def getStudents(filter):
    students = [
        
        Student("S1", 23, 8, "LOW", "HIGH", "MEDIUM", "S4", None),
        Student("S2", 21, 6, "HIGH", "LOW", "NO PROBLEM", None, None),
        Student("S3", 25, 8, "MEDIUM", "LOW", "MEDIUM", None, None),

        
        Student("S4", 20, 6, "MEDIUM", "LOW", "NO PROBLEM", "S5", "S6"),
        Student("S5", 20, 6, "LOW", "LOW", "NO PROBLEM", "S4", "S6"),
        Student("S6", 20, 6, "HIGH", "HIGH", "MEDIUM", "S4", "S5"),

        
        Student("S7", 25, 8, "LOW", "LOW", "MEDIUM", None, None),
        Student("S8", 21, 6, "HIGH", "HIGH", "NO PROBLEM", None, None),
        Student("S9", 21, 7, "MEDIUM", "HIGH", "NO PROBLEM", None, None),
    ]
    return students