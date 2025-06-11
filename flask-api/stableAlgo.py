import networkx as nx
import community as community_louvain  
from collections import defaultdict
from sklearn.neighbors import KDTree
import numpy as np

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

groups = []
assigned = set()
student_map = {s.id: s for s in students}


for student in students:
    if student.id in assigned:
        continue

    f1, f2 = student.friend1, student.friend2
    if f1 and f2 and all(fid in student_map for fid in [f1, f2]):
        if (student.id in [student_map[f1].friend1, student_map[f1].friend2] and
            student.id in [student_map[f2].friend1, student_map[f2].friend2] and
            f1 in [student_map[f2].friend1, student_map[f2].friend2]):

            group = [student.id, f1, f2]
            if all(sid not in assigned for sid in group):
                groups.append(group)
                assigned.update(group)


def compatibility(s1, s2):
    score = 0
    MAX_DIFF = 2

    
    sleep_diff = abs(s1.sleep_time - s2.sleep_time)
    sleep_score = max(0, (MAX_DIFF - sleep_diff) / MAX_DIFF) * 0.4
    score += sleep_score

    
    wake_diff = abs(s1.wake_time - s2.wake_time)
    wake_score = max(0, (MAX_DIFF - wake_diff) / MAX_DIFF) * 0.4
    score += wake_score

    
    if s1.noise_tolerance == s2.noise_tolerance:
        score += 0.3

    if s1.light_sensitivity == s2.light_sensitivity:
        score += 0.3

    cleanliness_score = 0
    if s1.cleanliness == s2.cleanliness:
        cleanliness_score = 0.3
    elif 'Medium' in [s1.cleanliness, s2.cleanliness]:
        cleanliness_score = 0.2
    else:
        cleanliness_score = 0  
    score += cleanliness_score

    if s2.id in [s1.friend1, s1.friend2] and s1.id in [s2.friend1, s2.friend2]:
        score += 1.0
    elif s2.id in [s1.friend1, s1.friend2] or s1.id in [s2.friend1, s2.friend2]:
        score += 0.5

    return score



G = nx.Graph()
unassigned = [s for s in students if s.id not in assigned]

for i in range(len(unassigned)):
    s1 = unassigned[i]
    G.add_node(s1.id)
    for j in range(i+1, len(unassigned)):
        s2 = unassigned[j]
        score = compatibility(s1, s2)
        if score > 0:
            G.add_edge(s1.id, s2.id, weight=score)


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


remaining = [s for s in students if s.id not in assigned]
remaining_ids = [s.id for s in remaining]

compatibility_graph = defaultdict(list)
for i in range(len(remaining)):
    for j in range(i+1, len(remaining)):
        s1 = remaining[i]
        s2 = remaining[j]
        score = compatibility(s1, s2)
        if score > 0:
            compatibility_graph[s1.id].append((s2.id, score))
            compatibility_graph[s2.id].append((s1.id, score))

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

noise_map = {
    'LOW': 0,
    'MEDIUM': 1,
    'HIGH': 2
}

light_map = {
    'LOW': 0,
    'MEDIUM': 1,
    'HIGH': 2
}

cleanliness_map = {
    'NO PROBLEM': 0,
    'MEDIUM': 1,
    'HIGH': 2
}


leftover_students = [student_map[sid] for sid in remaining_ids]
if leftover_students:
    vectors = []
    id_list = []
    for s in leftover_students:
        vectors.append([
            s.sleep_time, 
            s.wake_time, 
            noise_map[s.noise_tolerance], 
            light_map[s.light_sensitivity], 
            cleanliness_map[s.cleanliness]
        ])
        id_list.append(s.id)

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
leftover = [s for s in students if s.id not in assigned]

if len(leftover) == 1:
    groups.append([leftover[0].id])  

elif len(leftover) == 2:
    groups.append([leftover[0].id, leftover[1].id])


print(groups)
