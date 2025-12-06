USE Ghost_Running;

DROP PROCEDURE IF EXISTS sp_user_update_profile;
DELIMITER //
CREATE PROCEDURE sp_user_update_profile(
    IN p_user_email      VARCHAR(100),
    IN p_names           VARCHAR(45),
    IN p_lastnames       VARCHAR(45),
    IN p_description     MEDIUMTEXT,
    IN p_profile_photo   VARCHAR(255),
    IN p_age             INT
)
BEGIN
    UPDATE UserGR 
    SET 
        user_Names        = p_names,
        user_LastNames    = p_lastnames,
        user_Description  = p_description,
        user_ProfilePhoto = p_profile_photo,
        user_Age          = p_age
    WHERE User_Email = p_user_email COLLATE utf8mb4_unicode_ci;
END//
DELIMITER ;


DROP FUNCTION IF EXISTS fn_weekly_goal_status;
DELIMITER //
CREATE FUNCTION fn_weekly_goal_status(
    p_completed_distance DECIMAL(5,2),
    p_target_distance    DECIMAL(5,2)
) RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_status VARCHAR(20);

    IF p_target_distance IS NULL OR p_target_distance <= 0 THEN
        SET v_status = 'Sin objetivo';
    ELSEIF p_completed_distance IS NULL OR p_completed_distance <= 0 THEN
        SET v_status = 'No iniciada';
    ELSEIF p_completed_distance < p_target_distance THEN
        SET v_status = 'En progreso';
    ELSE
        SET v_status = 'Completada';
    END IF;

    RETURN v_status;
END//
DELIMITER ;


-- 
DROP FUNCTION IF EXISTS fn_privacy_label;
DELIMITER //
CREATE FUNCTION fn_privacy_label(
    p_privacity INT
) RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE v_label VARCHAR(20);

    IF p_privacity = 0 THEN
        SET v_label = 'Pública';
    ELSEIF p_privacity = 1 THEN
        SET v_label = 'Privada';
    ELSEIF p_privacity = 2 THEN
        SET v_label = 'Solo seguidores';
    ELSE
        SET v_label = 'Desconocida';
    END IF;

    RETURN v_label;
END//
DELIMITER ;

DROP FUNCTION IF EXISTS fn_kmh_from_rithm;
DELIMITER //
CREATE FUNCTION fn_kmh_from_rithm(
    p_rithm DECIMAL(4,2)  -- minutos por km
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    IF p_rithm IS NULL OR p_rithm <= 0 THEN
        RETURN NULL;
    END IF;

    -- km/h = 60 / min_por_km
    RETURN ROUND(60 / p_rithm, 2);
END//
DELIMITER ;



DROP FUNCTION IF EXISTS fn_expected_finish_time;
DELIMITER //
CREATE FUNCTION fn_expected_finish_time(
    p_distance_km DECIMAL(6,2),
    p_rithm      DECIMAL(4,2)   -- min/km
) RETURNS TIME
DETERMINISTIC
BEGIN
    DECLARE v_total_minutes DECIMAL(8,2);

    IF p_distance_km IS NULL OR p_distance_km <= 0
       OR p_rithm IS NULL OR p_rithm <= 0 THEN
        RETURN NULL;
    END IF;

    SET v_total_minutes = p_distance_km * p_rithm;

    -- convertir minutos a TIME (HH:MM:SS)
    RETURN SEC_TO_TIME(ROUND(v_total_minutes * 60));
END//
DELIMITER ;


DROP FUNCTION IF EXISTS fn_challenge_progress_pct;
DELIMITER //
CREATE FUNCTION fn_challenge_progress_pct(
    p_completed_distance DECIMAL(6,2),
    p_target_distance    DECIMAL(6,2)
) RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    IF p_target_distance IS NULL OR p_target_distance <= 0 THEN
        RETURN NULL;
    END IF;

    IF p_completed_distance IS NULL OR p_completed_distance < 0 THEN
        SET p_completed_distance = 0;
    END IF;

    RETURN ROUND( (p_completed_distance / p_target_distance) * 100, 2 );
END//
DELIMITER ;


DROP FUNCTION IF EXISTS fn_ghost_label;
DELIMITER //
CREATE FUNCTION fn_ghost_label(
    p_is_ghost TINYINT
) RETURNS VARCHAR(15)
DETERMINISTIC
BEGIN
    IF p_is_ghost = 1 THEN
        RETURN 'Ghost run';
    ELSE
        RETURN 'Normal';
    END IF;
END//
DELIMITER ;


