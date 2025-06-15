import networkx as nx
import community as community_louvain  
from collections import defaultdict
from sklearn.neighbors import KDTree
import numpy as np

def study_habit_score(habit1, habit2):
    if habit1 == habit2:
        return 0.3
    pair = {habit1, habit2}
    if pair == {"silent", "music"}:
        return 0.0
    elif pair == {"silent", "group"}:
        return 0.1
    elif pair == {"music", "group"}:
        return 0.2
    else:
        return 0.0  # fallback safety

def compatibility(s1, s2, students):
        score = 0
        MAX_DIFF = 2

        
        sleep_diff = abs(int(s1["sleepTime"].split(":")[0]) - int(s2["sleepTime"].split(":")[0]))
        sleep_score = max(0, (MAX_DIFF - sleep_diff) / MAX_DIFF) * 0.4
        score += sleep_score

        
        wake_diff = abs(int(s1["wakeTime"].split(":")[0]) - int(s2["wakeTime"].split(":")[0]))
        wake_score = max(0, (MAX_DIFF - wake_diff) / MAX_DIFF) * 0.4
        score += wake_score

        
        if s1["noiseLevel"] == s2["noiseLevel"]:
            score += 0.3

        if s1["lightSensitivity"] == s2["lightSensitivity"]:
            score += 0.3

        cleanliness_score = 0
        if s1["cleanliness"] == s2["cleanliness"]:
            cleanliness_score = 0.3
        elif 'moderately-clean' in [s1["cleanliness"], s2["cleanliness"]]:
            cleanliness_score = 0.2
        else:
            cleanliness_score = 0  
        score += cleanliness_score
        study1 = s1["studyHabits"]
        study2 = s2["studyHabits"]
        if study1 and study2:
            score += study_habit_score(study1, study2)
        if s2["studentId"] in getFriendsId(getFriends(s1),students) and s1["studentId"] in getFriendsId(getFriends(s2),students):
            score += 1.0
        elif s2["studentId"] in getFriendsId(getFriends(s1),students) or s1["studentId"] in getFriendsId(getFriends(s2),students):
            score += 0.5
        return score

def getFriendsId(name, students):
    lst=[]
    for student in students:
        if name == student["name"]:
            lst.append(student["studentId"])
    return lst

def getFriends(student):
    return student["preferredRoommates"].split(",")


def allotment(students):
    groups = []
    assigned = set()
    student_map = {s["studentId"]: s for s in students}
    for student in students:
        if student["studentId"] in assigned:
            continue
        
        friends = student["preferredRoommates"].split(",")
        f1, f2 = getFriendsId(friends[0], students), getFriendsId(friends[1], students)
        if f1 and f2 and all(fid in student_map for fid in [f1, f2]):
            if (student["studentId"] in getFriendsId(getFriends(student_map[f1]),students) and
                student["studentId"] in getFriendsId(getFriends(student_map[f2]),students) and
                f1 in getFriendsId(getFriends(student_map[f2]),students)):

                group = [student["studentId"], f1, f2]
                if all(sid not in assigned for sid in group):
                    groups.append(group)
                    assigned.update(group)
    G = nx.Graph()
    unassigned = [s for s in students if s["studentId"] not in assigned]

    for i in range(len(unassigned)):
        s1 = unassigned[i]
        G.add_node(s1["studentId"])
        for j in range(i+1, len(unassigned)):
            s2 = unassigned[j]
            score = compatibility(s1, s2, students)
            if score > 0:
                G.add_edge(s1["studentId"], s2["studentId"], weight=score)


    partition = community_louvain.best_partition(G, weight='weight')


    communities = defaultdict(list)
    for sid, cid in partition.items():
        communities[cid].append(sid)


    for cid, members in communities.items():
        while len(members) >= 3:
            group = members[:3]
            groups.append(group)
            assigned.update(group)
            members = members[3:]
        for rem in members:
            G.remove_node(rem)


    remaining = [s for s in students if s["studentId"] not in assigned]
    remaining_ids = [s["studentId"] for s in remaining]

    compatibility_graph = defaultdict(list)
    for i in range(len(remaining)):
        for j in range(i+1, len(remaining)):
            s1 = remaining[i]
            s2 = remaining[j]
            score = compatibility(s1, s2, students)
            if score > 0:
                compatibility_graph[s1["studentId"]].append((s2["studentId"], score))
                compatibility_graph[s2["studentId"]].append((s1["studentId"], score))

    while len(remaining_ids) >= 3:
        anchor = remaining_ids[0]
        candidates = sorted(compatibility_graph[anchor], key=lambda x: -x[1])
        picks = []
        for cid, _ in candidates:
            if cid in remaining_ids and cid != anchor:
                picks.append(cid)
            if len(picks) == 2:
                break
        if len(picks) == 2:
            group = [anchor] + picks
            groups.append(group)
            for sid in group:
                remaining_ids.remove(sid)
                assigned.add(sid)
        else:
            break

    study_habits_map = {
    'silent': 0,
    'music': 1,
    'group': 2
    }

    noise_map = {
        'silent': 0,
        'low':1,
        'moderate': 2
        
    }

    light_map = {
        'no-light': 0,
        'any-light': 1,
        
    }

    cleanliness_map = {
        'casual': 0,
        'moderately-clean': 1,
        'very-clean': 2
    }


    leftover_students = [student_map[sid] for sid in remaining_ids]
    if leftover_students:
        vectors = []
        id_list = []
        for s in leftover_students:
            vectors.append([
                int(s["sleepTime"].split(":")[0]), 
                int(s["wakeTime"].split(":")[0]), 
                noise_map[s["noiseLevel"]], 
                light_map[s["lightSensitivity"]], 
                cleanliness_map[s["cleanliness"]],
                study_habits_map.get(s["studyHabits"], 0)
            ])
            id_list.append(s["studentId"])

        tree = KDTree(np.array(vectors))
        visited = set()
        for i in range(len(id_list)):
            if id_list[i] in visited:
                continue
            k = min(3, len(vectors))
            dist, idxs = tree.query([vectors[i]], k=k)
            group_ids = [id_list[j] for j in idxs[0] if id_list[j] not in visited]
            if len(group_ids) == 3:
                groups.append(group_ids)
                visited.update(group_ids)
    leftover = [s for s in students if s["studentId"] not in assigned]

    if len(leftover) == 1:
        groups.append([leftover[0]["studentId"]])  

    elif len(leftover) == 2:
        groups.append([leftover[0]["studentId"], leftover[1]["studentId"]])
    return groups
#check function
students = [
  {
    "studentId": "S001",
    "name": "John Doe",
    "sleepTime": "11:00 PM",
    "wakeTime": "7:00 AM",
    "department": "Computer Science",
    "year": 2,
    "phone": "9080577849",
    "StudyTime": "evening",
    "roomType": "double",
    "address": "123 Main St, City",
    "emergencyContact": "9876543210",
    "preferredRoommates": "Jane,Smith",
    "studyHabits": "silent",
    "cleanliness": "moderately-clean",
    "lightSensitivity": "no-light",
    "noiseLevel": "low"
  },
  {
    "studentId": "S002",
    "name": "Jane Smith",
    "sleepTime": "10:30 PM",
    "wakeTime": "6:30 AM",
    "department": "Electrical Engineering",
    "year": 3,
    "phone": "9123456789",
    "StudyTime": "morning",
    "roomType": "single",
    "address": "456 Elm St, Town",
    "emergencyContact": "9234567890",
    "preferredRoommates": "John,Doe",
    "studyHabits": "group",
    "cleanliness": "very-clean",
    "lightSensitivity": "any-light",
    "noiseLevel": "silent"
  },
  {
    "studentId": "S003",
    "name": "Alice Johnson",
    "sleepTime": "12:00 AM",
    "wakeTime": "8:00 AM",
    "department": "Mechanical Engineering",
    "year": 1,
    "phone": "9345678901",
    "StudyTime": "afternoon",
    "roomType": "triple",
    "address": "789 Oak St, Village",
    "emergencyContact": "9456789012",
    "preferredRoommates": "hello,yellow",
    "studyHabits": "music",
    "cleanliness": "casual",
    "lightSensitivity": "any-light",
    "noiseLevel": "moderate"
  },
  {
    "studentId": "S004",
    "name": "Bob Williams",
    "sleepTime": "11:30 PM",
    "wakeTime": "7:30 AM",
    "department": "Civil Engineering",
    "year": 4,
    "phone": "9567890123",
    "StudyTime": "night",
    "roomType": "double",
    "address": "101 Pine St, City",
    "emergencyContact": "9678901234",
    "preferredRoommates": "Alice,Johnson",
    "studyHabits": "silent",
    "cleanliness": "very-clean",
    "lightSensitivity": "no-light",
    "noiseLevel": "low"
  },
  {
    "studentId": "S005",
    "name": "Emma Brown",
    "sleepTime": "10:00 PM",
    "wakeTime": "6:00 AM",
    "department": "Information Technology",
    "year": 2,
    "phone": "9789012345",
    "StudyTime": "evening",
    "roomType": "single",
    "address": "202 Birch St, Town",
    "emergencyContact": "9890123456",
    "preferredRoommates": "welcome,home",
    "studyHabits": "group",
    "cleanliness": "moderately-clean",
    "lightSensitivity": "any-light",
    "noiseLevel": "moderate"
  }
]
