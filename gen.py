import random

# Sample feature options
sleep_options = ["9pm", "10pm", "11pm", "12am", "1am"]
wake_options = ["5am", "6am", "7am", "8am"]
study_options = ["quite", "little talks", "music"]
cleanliness_options = ["low", "medium", "high"]

# Generate 200 synthetic students
students = []
for i in range(1, 201):
    student_id = f"s{i}"
    features = {
        "sleep": random.choice(sleep_options),
        "wake": random.choice(wake_options),
        "study": random.choice(study_options),
        "cleanliness": random.choice(cleanliness_options)
    }
    # Each student may prefer up to 2 other random students (excluding self)
    possible_pref = [f"s{j}" for j in range(1, 201) if j != i]
    preferred = random.sample(possible_pref, k=random.randint(0, 2))
    students.append((student_id, features, preferred))

print(students)  # Show first 5 as example

