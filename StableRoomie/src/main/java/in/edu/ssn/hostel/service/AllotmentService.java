package in.edu.ssn.hostel.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import in.edu.ssn.hostel.model.Allotment;
import in.edu.ssn.hostel.model.Groups;
import in.edu.ssn.hostel.model.Rooms;
import in.edu.ssn.hostel.model.Student;
import in.edu.ssn.hostel.repo.allotmentRepo;
import in.edu.ssn.hostel.repo.groupsRepo;
import in.edu.ssn.hostel.repo.roomRepo;
import in.edu.ssn.hostel.repo.studentRepo;

@Service
public class AllotmentService {

    @Autowired
    private groupsRepo grepo;

    @Autowired
    private allotmentRepo arepo;

    @Autowired
    private roomRepo rrepo;

    @Autowired
    private studentRepo srepo;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${FLASK_API_URL:http://127.0.0.1:5000}")
    private String flaskApiUrl;

    @Autowired
    private SettingsService settingsService;

    /** Preferences are locked once any group exists. */
    public boolean isLocked() {
        return grepo.count() > 0;
    }

    /**
     * Lock and Allot in a single stretch:
     * 1. Validate warden has entered totalRooms for every room type.
     * 2. Students ordered by preference update time are placed into their 1st
     *    choice room-type list (capped at totalRooms * capacity); if full, 2nd
     *    choice, then 3rd.
     * 3. Each room-type list is sorted by department and the whole list runs
     *    through the 2-phase matching algorithm (mutual preferences, then
     *    Louvain) with that type's per-room capacity -> one group per room,
     *    persisted into room_groups + allotment.
     * 4. Students who fit into no list remain unallotted (reported only, no
     *    allotment entry).
     */
    @Transactional
    public Map<String, Object> lockAndAllot() {
        if (isLocked()) {
            throw new IllegalStateException("Allotment has already been finalized. Reset the allotment before running it again.");
        }

        List<Rooms> roomTypes = rrepo.findAll(Sort.by("roomId"));
        if (roomTypes.isEmpty()) {
            throw new IllegalStateException("No room types configured. Add room types and enter total rooms first.");
        }
        for (Rooms rt : roomTypes) {
            if (rt.getCapacity() == null || rt.getCapacity() <= 0) {
                throw new IllegalStateException("Warden must enter the number of students per room for room type: " + rt.getRoomType());
            }
            if (rt.getTotalRooms() == null || rt.getTotalRooms() <= 0) {
                throw new IllegalStateException("Warden must enter the total number of rooms available for room type: " + rt.getRoomType());
            }
        }

        List<Student> students = srepo.findAllByOrderByUpdatedAtAsc();
        if (students.isEmpty()) {
            throw new IllegalStateException("No students have submitted their preferences yet.");
        }

        Map<String, Rooms> typeByName = new HashMap<>();
        for (Rooms rt : roomTypes) {
            typeByName.put(rt.getRoomType().trim().toLowerCase(), rt);
        }

        // Step 2: preference-based grouping into per-room-type lists.
        Map<Long, List<Student>> typeLists = new HashMap<>();
        Map<Long, Integer> typeCapacity = new HashMap<>();
        for (Rooms rt : roomTypes) {
            typeCapacity.put(rt.getRoomId(), rt.getTotalRooms() * rt.getCapacity());
        }

        List<Student> unallotted = new ArrayList<>();
        for (Student s : students) {
            boolean placed = false;
            for (String pref : Arrays.asList(s.getRoomTypePref1(), s.getRoomTypePref2(), s.getRoomTypePref3())) {
                if (pref == null || pref.trim().isEmpty()) {
                    continue;
                }
                Rooms rt = typeByName.get(pref.trim().toLowerCase());
                if (rt == null) {
                    continue;
                }
                List<Student> list = typeLists.get(rt.getRoomId());
                int used = list == null ? 0 : list.size();
                if (used >= typeCapacity.get(rt.getRoomId())) {
                    continue; // this type is full -> try next preference
                }
                typeLists.computeIfAbsent(rt.getRoomId(), k -> new ArrayList<>()).add(s);
                placed = true;
                break;
            }
            if (!placed) {
                unallotted.add(s);
            }
        }

        // Step 3: per-list department sort + 2-phase algorithm -> rooms.
        for (Rooms rt : roomTypes) {
            List<Student> list = typeLists.get(rt.getRoomId());
            if (list == null || list.isEmpty()) {
                continue;
            }
            list.sort(Comparator.comparing(Student::getDepartment, Comparator.nullsLast(String::compareTo))
                    .thenComparing(Student::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())));

            List<List<Integer>> groups = runTwoPhase(list, rt.getCapacity());
            for (List<Integer> group : groups) {
                if (group == null || group.isEmpty()) {
                    continue;
                }
                Groups g = new Groups();
                g.setRoomId(rt.getRoomId());
                g = grepo.save(g);
                for (Integer sid : group) {
                    if (sid == null) {
                        continue;
                    }
                    Allotment a = new Allotment();
                    a.setGroupId(g.getGroupId());
                    a.setStudentId(sid);
                    arepo.save(a);
                }
            }
        }

        // Step 4: unallotted students are reported only (no allotment rows).
        return getResults();
    }

    /** Runs the Flask 2-phase matching for one room-type list. */
    @SuppressWarnings("unchecked")
    private List<List<Integer>> runTwoPhase(List<Student> list, int capacity) {
        String url = flaskApiUrl + "/allot";
        Map<String, Object> body = new HashMap<>();
        body.put("students", list);
        body.put("capacity", capacity);
        Map<String, Object> resp = restTemplate.postForObject(url, body, Map.class);
        if (resp == null || !resp.containsKey("groups")) {
            throw new IllegalStateException("Matching service returned an invalid response.");
        }
        Object raw = resp.get("groups");
        List<List<Integer>> groups = new ArrayList<>();
        if (raw instanceof List<?> rawList) {
            for (Object g : rawList) {
                List<Integer> ids = new ArrayList<>();
                if (g instanceof List<?> gl) {
                    for (Object sid : gl) {
                        if (sid instanceof Number n) {
                            ids.add(n.intValue());
                        }
                    }
                }
                groups.add(ids);
            }
        }
        return groups;
    }

    /** Current allotment results: rooms allotted room-type-wise + unallotted students. */
    public Map<String, Object> getResults() {
        Map<String, Object> result = new HashMap<>();
        result.put("locked", isLocked());
        result.put("preferencesOpen", settingsService.arePreferencesOpen());

        List<Rooms> roomTypes = rrepo.findAll(Sort.by("roomId"));
        List<Map<String, Object>> roomTypeList = new ArrayList<>();
        int allottedCount = 0;

        for (Rooms rt : roomTypes) {
            Map<String, Object> typeMap = new HashMap<>();
            typeMap.put("roomType", rt.getRoomType());
            typeMap.put("capacity", rt.getCapacity());
            typeMap.put("totalRooms", rt.getTotalRooms());

            List<Groups> groups = grepo.findByRoomId(rt.getRoomId());
            typeMap.put("usedRooms", groups.size());

            List<Map<String, Object>> rooms = new ArrayList<>();
            for (Groups g : groups) {
                Map<String, Object> roomMap = new HashMap<>();
                roomMap.put("groupId", g.getGroupId());

                List<Map<String, Object>> memberList = new ArrayList<>();
                for (Allotment a : arepo.findByGroupId(g.getGroupId())) {
                    srepo.findById(a.getStudentId()).ifPresent(st -> {
                        Map<String, Object> sm = new HashMap<>();
                        sm.put("studentId", st.getStudentId());
                        sm.put("name", st.getName());
                        sm.put("department", st.getDepartment());
                        sm.put("year", st.getYear());
                        sm.put("email", st.getEmail());
                        sm.put("phone", st.getPhone());
                        memberList.add(sm);
                    });
                }
                allottedCount += memberList.size();
                roomMap.put("students", memberList);
                rooms.add(roomMap);
            }
            typeMap.put("rooms", rooms);
            roomTypeList.add(typeMap);
        }
        result.put("roomTypes", roomTypeList);

        List<Map<String, Object>> unallotted = new ArrayList<>();
        for (Student s : srepo.findAll()) {
            if (!arepo.existsByStudentId(s.getStudentId())) {
                Map<String, Object> sm = new HashMap<>();
                sm.put("studentId", s.getStudentId());
                sm.put("name", s.getName());
                sm.put("department", s.getDepartment());
                sm.put("year", s.getYear());
                sm.put("email", s.getEmail());
                sm.put("phone", s.getPhone());
                sm.put("preferences", Arrays.asList(s.getRoomTypePref1(), s.getRoomTypePref2(), s.getRoomTypePref3()));
                unallotted.add(sm);
            }
        }
        result.put("unallotted", unallotted);
        result.put("allottedCount", allottedCount);
        result.put("unallottedCount", unallotted.size());
        return result;
    }

    /** Clears all groups and allotments, unlocking preferences for a re-run. */
    @Transactional
    public void resetAllotment() {
        arepo.deleteAll();
        grepo.deleteAll();
    }
}
