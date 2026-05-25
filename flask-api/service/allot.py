import networkx as nx
import community as community_louvain
from collections import defaultdict
from sklearn.neighbors import KDTree
import numpy as np


def sleep_hour(time_str):
    """Convert sleep time string (PM or early AM) to a linear comparable number.
    e.g. '11:00 PM' -> 23, '12:00 AM' -> 24, '1:00 AM' -> 25, '2:00 AM' -> 26
    """
    try:
        time_str = time_str.strip().upper()
        parts = time_str.split()
        hour = int(parts[0].split(":")[0])
        period = parts[1] if len(parts) > 1 else "PM"
        if period == "PM" and hour != 12:
            hour += 12          # 9 PM -> 21, 11 PM -> 23
        elif period == "PM" and hour == 12:
            hour = 12           # 12 PM (noon) -> 12
        elif period == "AM" and hour == 12:
            hour = 24           # 12 AM (midnight) -> 24
        else:
            hour += 24          # 1 AM -> 25, 2 AM -> 26
        return hour
    except Exception:
        return 22               # default to 10 PM


def wake_hour(time_str):
    """Convert wake time string (AM) to hour number.
    e.g. '7:00 AM' -> 7, '5:00 AM' -> 5
    """
    try:
        time_str = time_str.strip().upper()
        parts = time_str.split()
        hour = int(parts[0].split(":")[0])
        period = parts[1] if len(parts) > 1 else "AM"
        if period == "PM" and hour != 12:
            hour += 12
        elif period == "AM" and hour == 12:
            hour = 0
        return hour
    except Exception:
        return 7                # default to 7 AM


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
    return 0.0


def get_preferred_ids(student, students):
    """Return list of studentIds that this student listed as preferred roommates."""
    raw = student.get("preferredRoommates", "") or ""
    names = [n.strip() for n in raw.split(",") if n.strip()]
    return [s["studentId"] for s in students if s["name"].strip() in names]


def compatibility(s1, s2, students):
    score = 0
    MAX_DIFF = 2

    sleep_diff = abs(sleep_hour(s1["sleepTime"]) - sleep_hour(s2["sleepTime"]))
    score += max(0, (MAX_DIFF - sleep_diff) / MAX_DIFF) * 0.4

    wake_diff = abs(wake_hour(s1["wakeTime"]) - wake_hour(s2["wakeTime"]))
    score += max(0, (MAX_DIFF - wake_diff) / MAX_DIFF) * 0.4

    if s1["noiseLevel"] == s2["noiseLevel"]:
        score += 0.3

    if s1["lightSensitivity"] == s2["lightSensitivity"]:
        score += 0.3

    if s1["cleanliness"] == s2["cleanliness"]:
        score += 0.3
    elif "moderately-clean" in [s1["cleanliness"], s2["cleanliness"]]:
        score += 0.2

    study1 = s1.get("studyHabits", "")
    study2 = s2.get("studyHabits", "")
    if study1 and study2:
        score += study_habit_score(study1, study2)

    s1_prefs = get_preferred_ids(s1, students)
    s2_prefs = get_preferred_ids(s2, students)
    if s2["studentId"] in s1_prefs and s1["studentId"] in s2_prefs:
        score += 1.0
    elif s2["studentId"] in s1_prefs or s1["studentId"] in s2_prefs:
        score += 0.5

    return score


def allotment(students):
    groups = []
    assigned = set()
    student_map = {s["studentId"]: s for s in students}

    # --- Pass 1: Mutual 3-way friend preference ---
    for student in students:
        if student["studentId"] in assigned:
            continue

        raw = student.get("preferredRoommates", "") or ""
        pref_names = [n.strip() for n in raw.split(",") if n.strip()]
        if len(pref_names) < 2:
            continue

        # Find first student matching each preferred name
        f1_id = next((s["studentId"] for s in students if s["name"].strip() == pref_names[0]), None)
        f2_id = next((s["studentId"] for s in students if s["name"].strip() == pref_names[1]), None)

        if f1_id is None or f2_id is None:
            continue
        if f1_id not in student_map or f2_id not in student_map:
            continue

        f1_student = student_map[f1_id]
        f2_student = student_map[f2_id]

        f1_prefs = get_preferred_ids(f1_student, students)
        f2_prefs = get_preferred_ids(f2_student, students)

        # All three must mutually prefer each other
        if (student["studentId"] in f1_prefs and
                student["studentId"] in f2_prefs and
                f2_id in f1_prefs):
            group = [student["studentId"], f1_id, f2_id]
            if all(sid not in assigned for sid in group):
                groups.append(group)
                assigned.update(group)

    # --- Pass 2: Louvain community detection on unassigned students ---
    unassigned = [s for s in students if s["studentId"] not in assigned]
    G = nx.Graph()
    for i in range(len(unassigned)):
        s1 = unassigned[i]
        G.add_node(s1["studentId"])
        for j in range(i + 1, len(unassigned)):
            s2 = unassigned[j]
            score = compatibility(s1, s2, students)
            if score > 0:
                G.add_edge(s1["studentId"], s2["studentId"], weight=score)

    if G.number_of_nodes() > 0:
        partition = community_louvain.best_partition(G, weight="weight")
        communities = defaultdict(list)
        for sid, cid in partition.items():
            communities[cid].append(sid)

        for cid, members in communities.items():
            while len(members) >= 3:
                group = members[:3]
                groups.append(group)
                assigned.update(group)
                members = members[3:]
            # Remaining 1-2 members go back for pass 3
            for rem in members:
                if rem in G:
                    G.remove_node(rem)

    # --- Pass 3: Greedy compatibility matching for remaining ---
    remaining = [s for s in students if s["studentId"] not in assigned]
    remaining_ids = [s["studentId"] for s in remaining]

    compat_graph = defaultdict(list)
    for i in range(len(remaining)):
        for j in range(i + 1, len(remaining)):
            s1 = remaining[i]
            s2 = remaining[j]
            score = compatibility(s1, s2, students)
            if score > 0:
                compat_graph[s1["studentId"]].append((s2["studentId"], score))
                compat_graph[s2["studentId"]].append((s1["studentId"], score))

    while len(remaining_ids) >= 3:
        anchor = remaining_ids[0]
        candidates = sorted(compat_graph[anchor], key=lambda x: -x[1])
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

    # --- Pass 4: KDTree nearest-neighbour for hard-to-match leftovers ---
    study_habits_map = {"silent": 0, "music": 1, "group": 2}
    noise_map = {"silent": 0, "low": 1, "moderate": 2}
    light_map = {"no-light": 0, "any-light": 1}
    cleanliness_map = {"casual": 0, "moderately-clean": 1, "very-clean": 2}

    leftover_students = [student_map[sid] for sid in remaining_ids if sid in student_map]
    if leftover_students:
        vectors = []
        id_list = []
        for s in leftover_students:
            vectors.append([
                sleep_hour(s["sleepTime"]),
                wake_hour(s["wakeTime"]),
                noise_map.get(s.get("noiseLevel", "low"), 1),
                light_map.get(s.get("lightSensitivity", "any-light"), 1),
                cleanliness_map.get(s.get("cleanliness", "casual"), 0),
                study_habits_map.get(s.get("studyHabits", "silent"), 0),
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
                assigned.update(group_ids)

    # --- Collect absolute leftovers (1 or 2 remaining) ---
    leftover = [s for s in students if s["studentId"] not in assigned]
    if len(leftover) == 1:
        groups.append([leftover[0]["studentId"]])
    elif len(leftover) == 2:
        groups.append([leftover[0]["studentId"], leftover[1]["studentId"]])

    room_type = students[0]["roomType"] if students else "3-Sharing"
    return groups, room_type
