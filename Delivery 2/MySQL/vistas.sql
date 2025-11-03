USE Ghost_Running;


-- VISTA: Resumen general de usuarios y su actividad

CREATE OR REPLACE VIEW vw_admin_user_summary AS
SELECT 
    u.User_Email                  AS user_email,
    u.User_Username               AS username,
    CONCAT(u.user_Names, ' ', u.user_LastNames) AS full_name,
    u.user_RegistrationDate       AS registration_date,
    COUNT(DISTINCT t.tra_Counter) AS total_trainings,
    COUNT(DISTINCT p.pub_Counter) AS total_publications,
    COUNT(DISTINCT f.user_EmailFollower) AS total_followers
FROM UserGR AS u
LEFT JOIN Training    AS t ON u.User_Email = t.user_Email
LEFT JOIN Publication AS p ON u.User_Email = p.user_Email
LEFT JOIN Followed    AS f ON u.User_Email = f.user_EmailFollowed
GROUP BY u.User_Email
ORDER BY total_trainings DESC;



-- VISTA: Rendimiento promedio por usuario

CREATE OR REPLACE VIEW vw_admin_training_performance AS
SELECT 
    t.user_Email                       AS user_email,
    ROUND(AVG(t.tra_AvgSpeed), 2)      AS average_speed_kmh,
    ROUND(AVG(t.tra_Rithm), 2)         AS average_rithm_min_per_km,
    ROUND(SUM(r.rou_Distance), 2)      AS total_distance_km,
    COUNT(t.tra_Counter)               AS total_training_sessions
FROM Training AS t
INNER JOIN Route AS r ON t.rou_Id = r.rou_Id
GROUP BY t.user_Email
ORDER BY average_speed_kmh DESC;



-- VISTA: Actividad en publicaciones y participación

CREATE OR REPLACE VIEW vw_admin_publications_activity AS
SELECT 
    p.user_Email                 AS user_email,
    COUNT(p.pub_Counter)         AS total_publications,
    SUM(p.pub_Likes)             AS total_likes,
    COUNT(c.com_Counter)         AS total_comments
FROM Publication AS p
LEFT JOIN Comments AS c 
       ON p.pub_Counter = c.pub_Counter
      AND p.user_Email   = c.user_Email
      AND p.tra_Counter  = c.tra_Counter
      AND p.rou_Id       = c.rou_Id
GROUP BY p.user_Email
ORDER BY total_likes DESC;



-- VISTA: Participación en retos mensuales

CREATE OR REPLACE VIEW vw_admin_monthly_challenge_participation AS
SELECT 
    m.mon_id                 AS challenge_identifier,
    m.mon_Distance           AS goal_distance_km,
    m.mon_StartDate          AS start_date,
    m.mon_EndDate            AS end_date,
    COUNT(u.user_Email)      AS total_participants
FROM MonthlyChallenge AS m
LEFT JOIN User_has_MonthlyChallenge AS u 
       ON m.mon_id = u.mon_Id
GROUP BY m.mon_id
ORDER BY total_participants DESC;

-- VISTA: Promedio del estado físico de los usuarios

CREATE OR REPLACE VIEW vw_admin_user_physical_state AS
SELECT 
    p.user_Email                    AS user_email,
    ROUND(AVG(p.phy_Height), 2)     AS average_height_m,
    ROUND(AVG(p.phy_Weight), 2)     AS average_weight_kg
FROM PhysicalState AS p
GROUP BY p.user_Email
ORDER BY average_weight_kg DESC;

-- VISTA: Entrenamientos personales con métricas detalladas

CREATE OR REPLACE VIEW vw_user_my_trainings AS
SELECT 
    t.user_Email              AS user_email,
    t.tra_Datetime            AS training_datetime,
    t.tra_TrainingType        AS training_type,
    ROUND(t.tra_AvgSpeed, 2)  AS average_speed_kmh,
    ROUND(t.tra_Rithm, 2)     AS rithm_min_per_km,
    ROUND(r.rou_Distance, 2)  AS route_distance_km,
    t.tra_Duration            AS duration_time,
    t.tra_Calories            AS calories_burned
FROM Training AS t
INNER JOIN Route AS r ON t.rou_Id = r.rou_Id
ORDER BY t.tra_Datetime DESC;



-- VISTA: Progreso semanal según metas planteadas

CREATE OR REPLACE VIEW vw_user_weekly_goal_progress AS
SELECT 
    w.user_Email                        AS user_email,
    w.wee_StartDate                     AS week_start_date,
    w.wee_TrainingQuantity              AS planned_sessions,
    w.wee_Distance                      AS target_distance_km,
    w.wee_Completed                     AS goal_completed,
    ROUND(SUM(r.rou_Distance), 2)       AS distance_completed_km
FROM WeeklyGoal AS w
LEFT JOIN Training AS t 
       ON w.user_Email = t.user_Email
      AND t.tra_Datetime >= w.wee_StartDate
      AND t.tra_Datetime <  DATE_ADD(w.wee_StartDate, INTERVAL 7 DAY)
LEFT JOIN Route AS r ON t.rou_Id = r.rou_Id
GROUP BY w.user_Email, w.wee_StartDate
ORDER BY w.wee_StartDate DESC;



-- VISTA: Retos mensuales inscritos por el usuario

CREATE OR REPLACE VIEW vw_user_my_challenges AS
SELECT 
    u.user_Email         AS user_email,
    m.mon_id             AS challenge_identifier,
    m.mon_Distance       AS distance_goal_km,
    m.mon_StartDate      AS start_date,
    m.mon_EndDate        AS end_date,
    CASE 
        WHEN CURDATE() BETWEEN m.mon_StartDate AND m.mon_EndDate THEN 'Active'
        WHEN CURDATE() > m.mon_EndDate THEN 'Finished'
        ELSE 'Upcoming'
    END AS challenge_status
FROM User_has_MonthlyChallenge AS u
INNER JOIN MonthlyChallenge AS m ON u.mon_Id = m.mon_id
ORDER BY m.mon_StartDate DESC;



-- VISTA: Publicaciones personales con interacción social

CREATE OR REPLACE VIEW vw_user_my_publications AS
SELECT 
    p.user_Email              AS user_email,
    p.pub_Counter             AS publication_identifier,
    p.pub_Likes               AS likes_received,
    p.pub_Privacity           AS privacy_level,
    COUNT(c.com_Counter)      AS comments_count,
    p.pub_Datetime            AS publication_date
FROM Publication AS p
LEFT JOIN Comments AS c 
       ON p.pub_Counter = c.pub_Counter
      AND p.user_Email   = c.user_Email
      AND p.tra_Counter  = c.tra_Counter
      AND p.rou_Id       = c.rou_Id
GROUP BY p.user_Email, p.pub_Counter
ORDER BY p.pub_Datetime DESC;



-- VISTA: Red de seguidores y seguidos del usuario

CREATE OR REPLACE VIEW vw_user_followers_and_following AS
SELECT 
    f.user_EmailFollower   AS follower_email,
    f.user_EmailFollowed   AS followed_email
FROM Followed AS f
ORDER BY f.user_EmailFollowed;



-- VISTA : Comparación personal frente al promedio global

CREATE OR REPLACE VIEW vw_user_progress_comparison AS
SELECT 
    t.user_Email                         AS user_email,
    ROUND(AVG(t.tra_Rithm), 2)           AS user_average_rithm,
    ROUND((SELECT AVG(tra_Rithm) FROM Training), 2) AS global_average_rithm,
    ROUND(AVG(t.tra_AvgSpeed), 2)        AS user_average_speed,
    ROUND((SELECT AVG(tra_AvgSpeed) FROM Training), 2) AS global_average_speed
FROM Training AS t
GROUP BY t.user_Email
ORDER BY user_average_speed DESC;
