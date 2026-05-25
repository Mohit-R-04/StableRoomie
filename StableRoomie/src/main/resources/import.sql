-- Pre-seed default room types if table is empty
MERGE INTO ROOMS (ROOM_ID, ROOM_TYPE, NO_OF_STUDENTS) KEY (ROOM_ID) VALUES (1, '3-Sharing', 3);
MERGE INTO ROOMS (ROOM_ID, ROOM_TYPE, NO_OF_STUDENTS) KEY (ROOM_ID) VALUES (2, '2-Sharing', 2);
