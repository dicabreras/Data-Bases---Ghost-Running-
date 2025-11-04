

START TRANSACTION;

-- 1) Insert 20 users
INSERT INTO UserGR (User_Email, User_Username, user_Password, user_Names, user_LastNames, user_Age, user_ProfilePhoto, user_Description, user_RegistrationDate, user_gender)
VALUES
('user1@ghost.com','user1','${HASH1}','Aiden','Walker',29,NULL,'Enjoys night runs','2023-01-12 06:10:00','Male'),
('user2@ghost.com','user2','${HASH2}','Olivia','Brown',34,NULL,'Trail lover','2022-05-03 07:00:00','Female'),
('user3@ghost.com','user3','${HASH3}','Liam','Smith',26,NULL,'New to running','2024-03-10 18:20:00','Male'),
('user4@ghost.com','user4','${HASH4}','Emma','Johnson',31,NULL,'Loves long distances','2021-11-21 05:30:00','Female'),
('user5@ghost.com','user5','${HASH5}','Noah','Garcia',37,NULL,'Prefers cycling','2020-08-05 09:40:00','Male'),
('user6@ghost.com','user6','${HASH6}','Ava','Martinez',24,NULL,'Weekend sprinter','2024-06-12 10:10:00','Female'),
('user7@ghost.com','user7','${HASH7}','Ethan','Robinson',41,NULL,'Marathoner','2019-02-18 06:00:00','Male'),
('user8@ghost.com','user8','${HASH8}','Sophia','Clark',28,NULL,'Urban runner','2023-09-07 07:15:00','Female'),
('user9@ghost.com','user9','${HASH9}','Mason','Rodriguez',33,NULL,'Runs with a dog','2022-02-02 06:50:00','Male'),
('user10@ghost.com','user10','${HASH10}','Isabella','Lewis',30,NULL,'Track sessions','2024-12-01 05:25:00','Female'),
('user11@ghost.com','user11','${HASH11}','Lucas','Lee',27,NULL,'Hills specialist','2023-03-22 07:45:00','Male'),
('user12@ghost.com','user12','${HASH12}','Mia','Walker',32,NULL,'Recovery runner','2021-06-15 08:30:00','Female'),
('user13@ghost.com','user13','${HASH13}','Henry','Hall',36,NULL,'Data driven','2020-12-05 06:05:00','Male'),
('user14@ghost.com','user14','${HASH14}','Amelia','Allen',29,NULL,'Social runner','2022-10-19 18:00:00','Female'),
('user15@ghost.com','user15','${HASH15}','Alexander','Young',38,NULL,'Cycling commuter','2019-08-24 07:30:00','Male'),
('user16@ghost.com','user16','${HASH16}','Harper','Hernandez',25,NULL,'Interval lover','2024-04-11 05:50:00','Female'),
('user17@ghost.com','user17','${HASH17}','Logan','King',35,NULL,'Ultra curious','2023-07-30 06:20:00','Male'),
('user18@ghost.com','user18','${HASH18}','Evelyn','Wright',31,NULL,'New to app','2025-01-03 09:00:00','Female'),
('user19@ghost.com','user19','${HASH19}','Daniel','Lopez',42,NULL,'Weekend warrior','2020-09-18 06:40:00','Male'),
('user20@ghost.com','user20','${HASH20}','Charlotte','Hill',26,NULL,'Loves sunrise runs','2024-02-02 05:10:00','Female');

-- 2) PhysicalState: 20 entries (one per user)
INSERT INTO PhysicalState (user_Email, phy_Date, phy_Height, phy_Weight) VALUES
('user1@ghost.com','2025-09-01 08:00:00',1.80,75.2),
('user2@ghost.com','2025-08-15 09:15:00',1.65,60.5),
('user3@ghost.com','2025-07-20 07:20:00',1.72,68.1),
('user4@ghost.com','2025-06-05 06:45:00',1.68,59.0),
('user5@ghost.com','2025-05-25 10:30:00',1.76,82.4),
('user6@ghost.com','2025-04-12 11:00:00',1.62,55.0),
('user7@ghost.com','2025-03-03 06:10:00',1.85,84.0),
('user8@ghost.com','2025-02-14 07:05:00',1.70,62.2),
('user9@ghost.com','2025-01-22 06:50:00',1.78,74.5),
('user10@ghost.com','2025-01-05 08:30:00',1.66,58.6),
('user11@ghost.com','2024-12-18 07:25:00',1.81,77.3),
('user12@ghost.com','2024-11-11 09:40:00',1.63,61.8),
('user13@ghost.com','2024-10-02 06:55:00',1.79,80.2),
('user14@ghost.com','2024-09-09 07:10:00',1.67,57.9),
('user15@ghost.com','2024-08-21 06:30:00',1.82,85.0),
('user16@ghost.com','2024-07-19 08:05:00',1.64,56.7),
('user17@ghost.com','2024-06-25 06:40:00',1.77,73.0),
('user18@ghost.com','2024-05-14 08:20:00',1.69,63.5),
('user19@ghost.com','2024-04-03 07:50:00',1.83,88.1),
('user20@ghost.com','2024-03-12 06:15:00',1.65,59.6);

-- 3) WeeklyGoal: 20 entries (one per user)
INSERT INTO WeeklyGoal (user_Email, wee_StartDate, wee_TrainingQuantity, wee_Distance, wee_Completed) VALUES
('user1@ghost.com','2025-10-20 00:00:00',3,30.00,0),
('user2@ghost.com','2025-10-20 00:00:00',4,40.50,0),
('user3@ghost.com','2025-10-13 00:00:00',2,20.00,1),
('user4@ghost.com','2025-10-20 00:00:00',5,55.00,0),
('user5@ghost.com','2025-10-06 00:00:00',3,30.00,1),
('user6@ghost.com','2025-10-20 00:00:00',4,36.00,0),
('user7@ghost.com','2025-10-20 00:00:00',5,60.00,0),
('user8@ghost.com','2025-10-13 00:00:00',3,25.00,1),
('user9@ghost.com','2025-09-29 00:00:00',2,15.00,1),
('user10@ghost.com','2025-10-20 00:00:00',4,42.00,0),
('user11@ghost.com','2025-10-20 00:00:00',3,28.00,0),
('user12@ghost.com','2025-10-06 00:00:00',3,26.50,1),
('user13@ghost.com','2025-10-20 00:00:00',5,70.00,0),
('user14@ghost.com','2025-10-20 00:00:00',3,24.00,0),
('user15@ghost.com','2025-10-13 00:00:00',4,44.00,1),
('user16@ghost.com','2025-10-20 00:00:00',2,18.00,0),
('user17@ghost.com','2025-10-20 00:00:00',5,65.00,0),
('user18@ghost.com','2025-10-20 00:00:00',3,27.00,0),
('user19@ghost.com','2025-10-06 00:00:00',4,48.00,1),
('user20@ghost.com','2025-10-20 00:00:00',3,30.00,0);

-- 4) Routes: insert 20 and capture their ids
INSERT INTO Route (rou_Distance) VALUES (5.10); SET @r1 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (10.00); SET @r2 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (7.25); SET @r3 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (12.40); SET @r4 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (3.60); SET @r5 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (15.00); SET @r6 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (6.50); SET @r7 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (8.20); SET @r8 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (9.90); SET @r9 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (4.75); SET @r10 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (11.00); SET @r11 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (132.80); SET @r12 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (13.30); SET @r13 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (5.55); SET @r14 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (7.70); SET @r15 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (14.00); SET @r16 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (6.00); SET @r17 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (8.80); SET @r18 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (10.50); SET @r19 = LAST_INSERT_ID();
INSERT INTO Route (rou_Distance) VALUES (400.20); SET @r20 = LAST_INSERT_ID();

-- 5) Coordinates: insert 20 coords capturing IDs
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7001,-74.0710,255.0); SET @c1 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7012,-74.0725,258.0); SET @c2 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7023,-74.0735,260.0); SET @c3 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7034,-74.0745,262.0); SET @c4 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7045,-74.0755,265.0); SET @c5 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7056,-74.0765,267.0); SET @c6 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7067,-74.0775,270.0); SET @c7 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7078,-74.0785,272.0); SET @c8 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7089,-74.0795,274.0); SET @c9 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7090,-74.0805,276.0); SET @c10 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7101,-74.0815,278.0); SET @c11 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7112,-74.0825,280.0); SET @c12 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7123,-74.0835,282.0); SET @c13 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7134,-74.0845,284.0); SET @c14 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7145,-74.0855,286.0); SET @c15 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7156,-74.0865,288.0); SET @c16 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7167,-74.0875,290.0); SET @c17 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7178,-74.0885,292.0); SET @c18 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7189,-74.0895,294.0); SET @c19 = LAST_INSERT_ID();
INSERT INTO Coordinate (coo_Latitude, coo_Longitude, coo_Altitude) VALUES (4.7190,-74.0905,296.0); SET @c20 = LAST_INSERT_ID();

-- 6) Route_has_Coordinate: map each route to 3 coordinates (wrap-around)
INSERT INTO Route_has_Coordinate (rou_Id, coo_Id) VALUES
(@r1,@c1),(@r1,@c2),(@r1,@c3),
(@r2,@c2),(@r2,@c3),(@r2,@c4),
(@r3,@c3),(@r3,@c4),(@r3,@c5),
(@r4,@c4),(@r4,@c5),(@r4,@c6),
(@r5,@c5),(@r5,@c6),(@r5,@c7),
(@r6,@c6),(@r6,@c7),(@r6,@c8),
(@r7,@c7),(@r7,@c8),(@r7,@c9),
(@r8,@c8),(@r8,@c9),(@r8,@c10),
(@r9,@c9),(@r9,@c10),(@r9,@c11),
(@r10,@c10),(@r10,@c11),(@r10,@c12),
(@r11,@c11),(@r11,@c12),(@r11,@c13),
(@r12,@c12),(@r12,@c13),(@r12,@c14),
(@r13,@c13),(@r13,@c14),(@r13,@c15),
(@r14,@c14),(@r14,@c15),(@r14,@c16),
(@r15,@c15),(@r15,@c16),(@r15,@c17),
(@r16,@c16),(@r16,@c17),(@r16,@c18),
(@r17,@c17),(@r17,@c18),(@r17,@c19),
(@r18,@c18),(@r18,@c19),(@r18,@c20),
(@r19,@c19),(@r19,@c20),(@r19,@c1),
(@r20,@c20),(@r20,@c1),(@r20,@c2);

-- 7) MonthlyChallenge: insert 20
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(100.00,'2025-01-01','2025-01-31'); SET @m1 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(150.00,'2025-02-01','2025-02-28'); SET @m2 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(200.00,'2025-03-01','2025-03-31'); SET @m3 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(80.00,'2025-04-01','2025-04-30'); SET @m4 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(250.00,'2025-05-01','2025-05-31'); SET @m5 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(120.00,'2025-06-01','2025-06-30'); SET @m6 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(300.00,'2025-07-01','2025-07-31'); SET @m7 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(50.00,'2025-08-01','2025-08-31'); SET @m8 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(400.00,'2025-09-01','2025-09-30'); SET @m9 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(75.00,'2025-10-01','2025-10-31'); SET @m10 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(90.00,'2025-11-01','2025-11-30'); SET @m11 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(110.00,'2025-12-01','2025-12-31'); SET @m12 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(130.00,'2026-01-01','2026-01-31'); SET @m13 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(95.00,'2026-02-01','2026-02-28'); SET @m14 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(85.00,'2026-03-01','2026-03-31'); SET @m15 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(210.00,'2026-04-01','2026-04-30'); SET @m16 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(170.00,'2026-05-01','2026-05-31'); SET @m17 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(60.00,'2026-06-01','2026-06-30'); SET @m18 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(140.00,'2026-07-01','2026-07-31'); SET @m19 = LAST_INSERT_ID();
INSERT INTO MonthlyChallenge (mon_Distance, mon_StartDate, mon_EndDate) VALUES
(180.00,'2026-08-01','2026-08-31'); SET @m20 = LAST_INSERT_ID();

-- 8) User_has_MonthlyChallenge: give each user at least 1 challenge (20 entries)
INSERT INTO User_has_MonthlyChallenge (mon_Id, user_Email) VALUES
(@m1,'user1@ghost.com'),
(@m2,'user2@ghost.com'),
(@m3,'user3@ghost.com'),
(@m4,'user4@ghost.com'),
(@m5,'user5@ghost.com'),
(@m6,'user6@ghost.com'),
(@m7,'user7@ghost.com'),
(@m8,'user8@ghost.com'),
(@m9,'user9@ghost.com'),
(@m10,'user10@ghost.com'),
(@m11,'user11@ghost.com'),
(@m12,'user12@ghost.com'),
(@m13,'user13@ghost.com'),
(@m14,'user14@ghost.com'),
(@m15,'user15@ghost.com'),
(@m16,'user16@ghost.com'),
(@m17,'user17@ghost.com'),
(@m18,'user18@ghost.com'),
(@m19,'user19@ghost.com'),
(@m20,'user20@ghost.com');

-- 9) Training: insert 20 trainings (one per user), capture tra_Counter
-- We'll pick route assignments in round-robin from @r1..@r20
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user1@ghost.com', @r1, '2025-10-20 06:00:00','00:45:00',5.50,12.00,9.00,420.00,45.0,'Running',0,80.0); SET @t1 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user2@ghost.com', @r2, '2025-10-21 07:30:00','01:10:00',5.90,15.00,11.00,650.00,120.0,'Cycling',1,NULL); SET @t2 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user3@ghost.com', @r3, '2025-10-18 18:15:00','00:30:00',6.00,11.50,10.50,300.00,20.0,'Running',0,78.0); SET @t3 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user4@ghost.com', @r4, '2025-10-19 05:50:00','00:52:00',5.20,13.00,10.00,480.00,60.0,'Running',0,82.0); SET @t4 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user5@ghost.com', @r5, '2025-10-20 09:10:00','00:55:00',5.60,14.00,10.50,510.00,90.0,'Cycling',0,NULL); SET @t5 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user6@ghost.com', @r6, '2025-10-17 06:40:00','00:38:00',5.40,12.50,9.50,390.00,40.0,'Running',0,79.0); SET @t6 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user7@ghost.com', @r7, '2025-10-16 07:00:00','01:30:00',6.10,18.00,12.00,900.00,200.0,'Cycling',1,NULL); SET @t7 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user8@ghost.com', @r8, '2025-10-15 06:15:00','00:35:00',5.30,11.80,9.20,360.00,30.0,'Running',0,81.0); SET @t8 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user9@ghost.com', @r9, '2025-10-14 18:05:00','00:50:00',5.70,13.50,10.80,500.00,70.0,'Running',0,77.0); SET @t9 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user10@ghost.com', @r10, '2025-10-13 07:20:00','00:27:00',5.10,10.50,9.50,250.00,15.0,'Running',0,83.0); SET @t10 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user11@ghost.com', @r11, '2025-10-12 06:45:00','01:05:00',5.95,16.00,12.50,700.00,140.0,'Cycling',1,NULL); SET @t11 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user12@ghost.com', @r12, '2025-10-11 06:00:00','00:46:00',5.65,12.30,9.80,430.00,50.0,'Running',0,79.0); SET @t12 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user13@ghost.com', @r13, '2025-10-10 05:50:00','02:10:00',6.30,20.00,14.00,1200.00,300.0,'Cycling',1,NULL); SET @t13 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user14@ghost.com', @r14, '2025-10-09 06:30:00','00:33:00',5.25,11.20,9.70,310.00,35.0,'Running',0,80.0); SET @t14 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user15@ghost.com', @r15, '2025-10-08 07:10:00','01:05:00',5.85,15.50,12.00,680.00,130.0,'Cycling',0,NULL); SET @t15 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user16@ghost.com', @r16, '2025-10-07 05:55:00','00:28:00',5.45,11.00,9.20,270.00,18.0,'Running',0,82.0); SET @t16 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user17@ghost.com', @r17, '2025-10-06 06:10:00','00:59:00',5.60,13.00,10.40,460.00,65.0,'Running',0,78.0); SET @t17 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user18@ghost.com', @r18, '2025-10-05 06:00:00','00:48:00',5.70,13.20,10.60,490.00,72.0,'Running',0,79.0); SET @t18 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user19@ghost.com', @r19, '2025-10-04 07:40:00','00:42:00',5.35,11.90,9.90,340.00,28.0,'Running',0,81.0); SET @t19 = LAST_INSERT_ID();
INSERT INTO Training (user_Email, rou_Id, tra_Datetime, tra_Duration, tra_Rithm, tra_MaxSpeed, tra_AvgSpeed, tra_Calories, tra_ElevationGain, tra_TrainingType, tra_IsGhost, tra_AvgStride)
VALUES
('user20@ghost.com', @r20, '2025-10-03 06:05:00','00:34:00',5.15,10.80,9.40,280.00,22.0,'Running',0,84.0); SET @t20 = LAST_INSERT_ID();

-- 10) Kilometer: insert 20 entries referencing trainings (user_Email, rou_Id, tra_Counter)
-- Use one km row per training; km_Counter will be auto-generated if omitted, but schema had composite PK including it.
-- We'll explicitly set km_Counter values for clarity (MySQL allows specifying auto_increment column values if not forbidden)
INSERT INTO Kilometer (km_Counter, Km_Time, rou_Id, tra_Counter, user_Email) VALUES
(5001,'00:05:20', @r1, @t1, 'user1@ghost.com'),
(5002,'00:06:10', @r2, @t2, 'user2@ghost.com'),
(5003,'00:05:50', @r3, @t3, 'user3@ghost.com'),
(5004,'00:04:40', @r4, @t4, 'user4@ghost.com'),
(5005,'00:05:55', @r5, @t5, 'user5@ghost.com'),
(5006,'00:05:00', @r6, @t6, 'user6@ghost.com'),
(5007,'00:06:30', @r7, @t7, 'user7@ghost.com'),
(5008,'00:05:10', @r8, @t8, 'user8@ghost.com'),
(5009,'00:05:45', @r9, @t9, 'user9@ghost.com'),
(5010,'00:04:55', @r10, @t10, 'user10@ghost.com'),
(5011,'00:06:05', @r11, @t11, 'user11@ghost.com'),
(5012,'00:05:25', @r12, @t12, 'user12@ghost.com'),
(5013,'00:07:10', @r13, @t13, 'user13@ghost.com'),
(5014,'00:05:35', @r14, @t14, 'user14@ghost.com'),
(5015,'00:06:50', @r15, @t15, 'user15@ghost.com'),
(5016,'00:05:05', @r16, @t16, 'user16@ghost.com'),
(5017,'00:05:55', @r17, @t17, 'user17@ghost.com'),
(5018,'00:05:15', @r18, @t18, 'user18@ghost.com'),
(5019,'00:05:40', @r19, @t19, 'user19@ghost.com'),
(5020,'00:06:00', @r20, @t20, 'user20@ghost.com');

-- 11) Publication: insert 20 (one per training), capture pub ids
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (10,'img_route1.jpg',0,'2025-10-20 08:00:00','user1@ghost.com', @t1, @r1); SET @p1 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (4,NULL,2,'2025-10-21 10:00:00','user2@ghost.com', @t2, @r2); SET @p2 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (8,'img_route3.jpg',0,'2025-10-19 07:30:00','user3@ghost.com', @t3, @r3); SET @p3 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (12,'img_route4.jpg',0,'2025-10-18 09:00:00','user4@ghost.com', @t4, @r4); SET @p4 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (3,NULL,1,'2025-10-17 12:00:00','user5@ghost.com', @t5, @r5); SET @p5 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (20,'img_route6.jpg',0,'2025-10-16 14:00:00','user6@ghost.com', @t6, @r6); SET @p6 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (7,NULL,2,'2025-10-15 16:00:00','user7@ghost.com', @t7, @r7); SET @p7 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (6,'img_route8.jpg',0,'2025-10-14 18:00:00','user8@ghost.com', @t8, @r8); SET @p8 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (9,NULL,0,'2025-10-13 06:00:00','user9@ghost.com', @t9, @r9); SET @p9 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (2,'img_route10.jpg',1,'2025-10-12 07:30:00','user10@ghost.com', @t10, @r10); SET @p10 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (14,'img_route11.jpg',0,'2025-10-11 08:20:00','user11@ghost.com', @t11, @r11); SET @p11 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (1,NULL,2,'2025-10-10 09:10:00','user12@ghost.com', @t12, @r12); SET @p12 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (18,'img_route13.jpg',0,'2025-10-09 10:00:00','user13@ghost.com', @t13, @r13); SET @p13 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (5,'img_route14.jpg',1,'2025-10-08 11:00:00','user14@ghost.com', @t14, @r14); SET @p14 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (11,NULL,0,'2025-10-07 12:30:00','user15@ghost.com', @t15, @r15); SET @p15 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (13,'img_route16.jpg',0,'2025-10-06 13:00:00','user16@ghost.com', @t16, @r16); SET @p16 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (0,NULL,2,'2025-10-05 14:10:00','user17@ghost.com', @t17, @r17); SET @p17 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (16,'img_route18.jpg',0,'2025-10-04 15:30:00','user18@ghost.com', @t18, @r18); SET @p18 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (21,'img_route19.jpg',0,'2025-10-03 16:40:00','user19@ghost.com', @t19, @r19); SET @p19 = LAST_INSERT_ID();
INSERT INTO Publication (pub_Likes, pub_RouteImage, pub_Privacity, pub_Datetime, user_Email, tra_Counter, rou_Id)
VALUES (19,'img_route20.jpg',1,'2025-10-02 17:50:00','user20@ghost.com', @t20, @r20); SET @p20 = LAST_INSERT_ID();


INSERT INTO Comments (pub_Counter, user_Email, tra_Counter, rou_Id, com_Text, com_Likes, com_Datetime)
SELECT 
    p.pub_Counter,
    p.user_Email,
    p.tra_Counter,
    p.rou_Id,
    CONCAT('Comment on publication ', p.pub_Counter),
    FLOOR(RAND()*15),  -- Likes random entre 0 y 5
    NOW() - INTERVAL FLOOR(RAND()*30) DAY  -- Fecha aleatoria reciente
FROM Publication AS p
LIMIT 25;





-- 13) Followed: create 20 follower relationships (some symmetric, some not)
INSERT INTO Followed (user_EmailFollower, user_EmailFollowed) VALUES
('user2@ghost.com','user1@ghost.com'),
('user3@ghost.com','user1@ghost.com'),
('user4@ghost.com','user2@ghost.com'),
('user5@ghost.com','user3@ghost.com'),
('user6@ghost.com','user4@ghost.com'),
('user7@ghost.com','user5@ghost.com'),
('user8@ghost.com','user6@ghost.com'),
('user9@ghost.com','user7@ghost.com'),
('user10@ghost.com','user8@ghost.com'),
('user11@ghost.com','user9@ghost.com'),
('user12@ghost.com','user10@ghost.com'),
('user13@ghost.com','user11@ghost.com'),
('user14@ghost.com','user12@ghost.com'),
('user15@ghost.com','user13@ghost.com'),
('user16@ghost.com','user14@ghost.com'),
('user17@ghost.com','user15@ghost.com'),
('user18@ghost.com','user16@ghost.com'),
('user19@ghost.com','user17@ghost.com'),
('user20@ghost.com','user18@ghost.com'),
('user1@ghost.com','user19@ghost.com');





COMMIT;
