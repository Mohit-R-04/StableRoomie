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