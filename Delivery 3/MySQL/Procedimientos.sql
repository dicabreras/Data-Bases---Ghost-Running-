USE Ghost_Running;

-- USUARIO: entrenamientos personales
DROP PROCEDURE IF EXISTS sp_user_my_trainings;
DELIMITER //
CREATE PROCEDURE sp_user_my_trainings(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_my_trainings
    WHERE user_email = p_user_email COLLATE utf8mb4_unicode_ci
    ORDER BY training_datetime DESC;
END//
DELIMITER ;


-- USUARIO: progreso semanal vs metas

DROP PROCEDURE IF EXISTS sp_user_weekly_goal_progress;
DELIMITER //
CREATE PROCEDURE sp_user_weekly_goal_progress(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_weekly_goal_progress
    WHERE user_email = p_user_email COLLATE utf8mb4_unicode_ci
    ORDER BY week_start_date DESC;
END//
DELIMITER ;
-- USUARIO: retos mensuales del usuario

DROP PROCEDURE IF EXISTS sp_user_my_challenges;
DELIMITER //
CREATE PROCEDURE sp_user_my_challenges(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_my_challenges
    WHERE user_email = p_user_email COLLATE utf8mb4_unicode_ci
    ORDER BY start_date DESC;
END//
DELIMITER ;


-- USUARIO: publicaciones personales

DROP PROCEDURE IF EXISTS sp_user_my_publications;
DELIMITER //
CREATE PROCEDURE sp_user_my_publications(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_my_publications
    WHERE user_email = p_user_email COLLATE utf8mb4_unicode_ci
    ORDER BY publication_date DESC;
END//
DELIMITER ;


-- USUARIO: seguidores y seguidos (solo los relacionados conmigo)

DROP PROCEDURE IF EXISTS sp_user_followers_and_following;
DELIMITER //
CREATE PROCEDURE sp_user_followers_and_following(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_followers_and_following
    WHERE follower_email = p_user_email COLLATE utf8mb4_unicode_ci
       OR followed_email = p_user_email COLLATE utf8mb4_unicode_ci
    ORDER BY followed_email;
END//
DELIMITER ;



-- USUARIO: comparación de progreso vs promedio global

DROP PROCEDURE IF EXISTS sp_user_progress_comparison;
DELIMITER //
CREATE PROCEDURE sp_user_progress_comparison(
    IN p_user_email VARCHAR(100)
)
BEGIN
    SELECT *
    FROM vw_user_progress_comparison
    WHERE user_email = p_user_email COLLATE utf8mb4_unicode_ci;
END//
DELIMITER ;

-- ADMIN: resumen general de usuarios

DROP PROCEDURE IF EXISTS sp_admin_user_summary;
DELIMITER //
CREATE PROCEDURE sp_admin_user_summary()
BEGIN
    SELECT * FROM vw_admin_user_summary;
END//
DELIMITER ;

-- ADMIN: rendimiento promedio por usuario

DROP PROCEDURE IF EXISTS sp_admin_training_performance;
DELIMITER //
CREATE PROCEDURE sp_admin_training_performance()
BEGIN
    SELECT * FROM vw_admin_training_performance;
END//
DELIMITER ;

-- ADMIN: actividad en publicaciones

DROP PROCEDURE IF EXISTS sp_admin_publications_activity;
DELIMITER //
CREATE PROCEDURE sp_admin_publications_activity()
BEGIN
    SELECT * FROM vw_admin_publications_activity;
END//
DELIMITER ;


-- ADMIN: participación en retos mensuales

DROP PROCEDURE IF EXISTS sp_admin_monthly_challenge_participation;
DELIMITER //
CREATE PROCEDURE sp_admin_monthly_challenge_participation()
BEGIN
    SELECT * FROM vw_admin_monthly_challenge_participation;
END//
DELIMITER ;


-- ADMIN: estado físico promedio

DROP PROCEDURE IF EXISTS sp_admin_user_physical_state;
DELIMITER //
CREATE PROCEDURE sp_admin_user_physical_state()
BEGIN
    SELECT * FROM vw_admin_user_physical_state;
END//
DELIMITER ;


-- ADMIN: actividad por tipo de entrenamiento y edad

DROP PROCEDURE IF EXISTS sp_admin_activity_by_sport_and_age;
DELIMITER //
CREATE PROCEDURE sp_admin_activity_by_sport_and_age()
BEGIN
    SELECT * FROM vw_admin_activity_by_sport_and_age;
END//
DELIMITER ;


-- ADMIN: rutas más utilizadas

DROP PROCEDURE IF EXISTS sp_admin_most_used_routes;
DELIMITER //
CREATE PROCEDURE sp_admin_most_used_routes()
BEGIN
    SELECT * FROM vw_admin_most_used_routes;
END//
DELIMITER ;


-- ADMIN: actividad por mes

DROP PROCEDURE IF EXISTS sp_admin_training_activity_by_month;
DELIMITER //
CREATE PROCEDURE sp_admin_training_activity_by_month()
BEGIN
    SELECT * FROM vw_admin_training_activity_by_month;
END//
DELIMITER ;


-- Procedimientos consultas 
-- 1) Usuarios que han participado en al menos un reto
DROP PROCEDURE IF EXISTS sp_q01_users_with_challenge;
DELIMITER //
CREATE PROCEDURE sp_q01_users_with_challenge()
BEGIN
    SELECT DISTINCT u.user_Email
    FROM UserGR AS u
    INNER JOIN User_has_MonthlyChallenge AS umc 
        ON u.user_Email = umc.user_Email;
END//
DELIMITER ;

-- 2) Top usuarios por número de entrenamientos
DROP PROCEDURE IF EXISTS sp_q02_top_users_by_training;
DELIMITER //
CREATE PROCEDURE sp_q02_top_users_by_training()
BEGIN
    SELECT 
        t.user_Email,
        COUNT(t.tra_Counter) AS total_trainings
    FROM Training AS t
    GROUP BY t.user_Email
    ORDER BY total_trainings DESC;
END//
DELIMITER ;

-- 3) Velocidad promedio por ruta
DROP PROCEDURE IF EXISTS sp_q03_avg_speed_per_route;
DELIMITER //
CREATE PROCEDURE sp_q03_avg_speed_per_route()
BEGIN
    SELECT 
        r.rou_Id,
        AVG(t.tra_AvgSpeed) AS avg_speed_kmh
    FROM Training AS t
    INNER JOIN Route AS r 
        ON t.rou_Id = r.rou_Id
    GROUP BY r.rou_Id
    ORDER BY avg_speed_kmh DESC;
END//
DELIMITER ;

-- 4) Usuarios sin entrenamientos
DROP PROCEDURE IF EXISTS sp_q04_users_without_trainings;
DELIMITER //
CREATE PROCEDURE sp_q04_users_without_trainings()
BEGIN
    SELECT u.user_Email
    FROM UserGR AS u
    WHERE u.user_Email NOT IN (
        SELECT DISTINCT t.user_Email
        FROM Training AS t
    );
END//
DELIMITER ;

-- 5) Publicaciones con sus likes (agregado)
DROP PROCEDURE IF EXISTS sp_q05_publications_likes_agg;
DELIMITER //
CREATE PROCEDURE sp_q05_publications_likes_agg()
BEGIN
    SELECT 
        p.pub_Counter,
        p.user_Email,
        SUM(p.pub_Likes) AS likes_total
    FROM Publication AS p
    GROUP BY p.pub_Counter, p.user_Email
    ORDER BY likes_total DESC;
END//
DELIMITER ;

-- 6) Usuarios mutuos (A sigue a B y B sigue a A)
DROP PROCEDURE IF EXISTS sp_q06_mutual_followers;
DELIMITER //
CREATE PROCEDURE sp_q06_mutual_followers()
BEGIN
    SELECT 
        f1.user_EmailFollower AS follower,
        f1.user_EmailFollowed AS followed
    FROM Followed AS f1
    INNER JOIN Followed AS f2 
        ON f1.user_EmailFollower = f2.user_EmailFollowed 
       AND f1.user_EmailFollowed = f2.user_EmailFollower;
END//
DELIMITER ;

-- 7) Número promedio de kilómetros por entrenamiento
DROP PROCEDURE IF EXISTS sp_q07_avg_km_per_training;
DELIMITER //
CREATE PROCEDURE sp_q07_avg_km_per_training()
BEGIN
    SELECT 
        AVG(km_count) AS avg_km_per_training
    FROM (
        SELECT 
            tra_Counter,
            COUNT(km_Counter) AS km_count
        FROM Kilometer
        GROUP BY tra_Counter
    ) AS training_km_counts;
END//
DELIMITER ;


DROP PROCEDURE IF EXISTS sp_register_training_with_kilometers;
DELIMITER //
CREATE PROCEDURE sp_register_training_with_kilometers(
    IN p_user_email       VARCHAR(100),
    IN p_rou_id           INT,
    IN p_tra_datetime     DATETIME,
    IN p_tra_duration     TIME,
    IN p_tra_rithm        DECIMAL(4,2),
    IN p_tra_maxspeed     DECIMAL(5,2),
    IN p_tra_avgspeed     DECIMAL(5,2),
    IN p_tra_calories     DECIMAL(6,2),
    IN p_tra_elevation    DECIMAL(5,2),
    IN p_tra_trainingtype VARCHAR(10),   -- 'Running' o 'Cycling'
    IN p_tra_isghost      TINYINT,
    IN p_tra_avgstride    DECIMAL(5,2),  -- NULL si no aplica
    IN p_km_times         TEXT           -- ej: '00:05:10,00:05:05,00:04:58'
)
BEGIN
    DECLARE v_tra_counter INT;
    DECLARE v_segment     VARCHAR(20);
    DECLARE v_pos         INT DEFAULT 0;
    DECLARE v_next_pos    INT;
    
    -- Handler de errores: revertir todo
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1) Insertar entrenamiento
    INSERT INTO Training (
        user_Email,
        rou_Id,
        tra_Datetime,
        tra_Duration,
        tra_Rithm,
        tra_MaxSpeed,
        tra_AvgSpeed,
        tra_Calories,
        tra_ElevationGain,
        tra_TrainingType,
        tra_IsGhost,
        tra_AvgStride
    ) VALUES (
        p_user_email,
        p_rou_id,
        p_tra_datetime,
        p_tra_duration,
        p_tra_rithm,
        p_tra_maxspeed,
        p_tra_avgspeed,
        p_tra_calories,
        p_tra_elevation,
        p_tra_trainingtype,
        p_tra_isghost,
        p_tra_avgstride
    );

    SET v_tra_counter = LAST_INSERT_ID();

    -- 2) Recorrer la cadena de tiempos de km separados por coma
    SET p_km_times = TRIM(p_km_times);

    WHILE p_km_times IS NOT NULL AND p_km_times <> '' DO
        SET v_next_pos = LOCATE(',', p_km_times);

        IF v_next_pos = 0 THEN
            SET v_segment = TRIM(p_km_times);
            SET p_km_times = '';
        ELSE
            SET v_segment = TRIM(SUBSTRING(p_km_times, 1, v_next_pos - 1));
            SET p_km_times = SUBSTRING(p_km_times, v_next_pos + 1);
        END IF;

        -- Insertar un kilómetro
        INSERT INTO Kilometer (
            km_Time,
            rou_Id,
            tra_Counter,
            user_Email
        ) VALUES (
            TIME(v_segment),
            p_rou_id,
            v_tra_counter,
            p_user_email
        );
    END WHILE;

    COMMIT;
END//
DELIMITER ;

DROP PROCEDURE IF EXISTS sp_user_join_monthly_challenge;
DELIMITER //
CREATE PROCEDURE sp_user_join_monthly_challenge(
    IN p_user_email VARCHAR(100),
    IN p_mon_id     INT
)
BEGIN
    DECLARE v_start DATE;
    DECLARE v_end   DATE;
    DECLARE v_count INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1) Verificar que el reto existe
    SELECT mon_StartDate, mon_EndDate
    INTO v_start, v_end
    FROM MonthlyChallenge
    WHERE mon_id = p_mon_id
    FOR UPDATE;

    IF v_start IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El reto mensual no existe.';
    END IF;

    -- 2) Verificar que estamos dentro del rango de fechas
    IF CURDATE() < v_start OR CURDATE() > v_end THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No es posible inscribirse: fuera del rango de fechas del reto.';
    END IF;

    -- 3) Verificar si ya está inscrito
    SELECT COUNT(*)
    INTO v_count
    FROM User_has_MonthlyChallenge
    WHERE mon_Id = p_mon_id
      AND user_Email = p_user_email;

    IF v_count > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El usuario ya está inscrito en este reto.';
    END IF;

    -- 4) Inscribir
    INSERT INTO User_has_MonthlyChallenge (mon_Id, user_Email)
    VALUES (p_mon_id, p_user_email);

    COMMIT;
END//
DELIMITER ;


DROP PROCEDURE IF EXISTS sp_user_leave_monthly_challenge;
DELIMITER //
CREATE PROCEDURE sp_user_leave_monthly_challenge(
    IN p_user_email VARCHAR(100),
    IN p_mon_id     INT
)
BEGIN
    DECLARE v_start DATE;
    DECLARE v_end   DATE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1) Obtener fechas del reto
    SELECT mon_StartDate, mon_EndDate
    INTO v_start, v_end
    FROM MonthlyChallenge
    WHERE mon_id = p_mon_id
    FOR UPDATE;

    IF v_start IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El reto mensual no existe.';
    END IF;

    -- 2) No permitir salir después de que terminó
    IF CURDATE() > v_end THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No es posible retirarse: el reto ya finalizó.';
    END IF;

    -- 3) Eliminar inscripción
    DELETE FROM User_has_MonthlyChallenge
    WHERE mon_Id = p_mon_id
      AND user_Email = p_user_email;

    COMMIT;
END//
DELIMITER ;
