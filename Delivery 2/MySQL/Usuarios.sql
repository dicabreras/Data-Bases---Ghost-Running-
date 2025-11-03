USE Ghost_Running;


DROP USER IF EXISTS 'admin_ghost'@'%';
CREATE USER IF NOT EXISTS 'admin_ghost'@'%' IDENTIFIED BY 'Admin123';
GRANT ALL PRIVILEGES ON Ghost_Running.* TO 'admin_ghost'@'%';


GRANT SELECT ON Ghost_Running.vw_admin_user_summary                    TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_performance            TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_publications_activity           TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_monthly_challenge_participation TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_user_physical_state             TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_activity_by_sport_and_age       TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_most_used_routes                TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_activity_by_month      TO 'admin_ghost'@'%';


DROP PROCEDURE IF EXISTS CreateUserAccounts;
DELIMITER //
CREATE PROCEDURE CreateUserAccounts()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_name VARCHAR(255);
    DECLARE cur CURSOR FOR SELECT User_Username FROM UserGR;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO user_name;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- Eliminar usuario si existe
        SET @drop_user = CONCAT('DROP USER IF EXISTS ''', user_name, '''@''%''');
        PREPARE stmt FROM @drop_user;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Crear usuario
        SET @create_user = CONCAT('CREATE USER ''', user_name, '''@''%'' IDENTIFIED BY ''User123''');
        PREPARE stmt FROM @create_user;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Asignar permisos a tablas
        SET @grant_tables = CONCAT(
            'GRANT SELECT, INSERT ON Ghost_Running.Training TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.Publication TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.Comments TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.Followed TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.Kilometer TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.PhysicalState TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.WeeklyGoal TO ''', user_name, '''@''%''; ',
            'GRANT SELECT, INSERT ON Ghost_Running.User_has_MonthlyChallenge TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.MonthlyChallenge TO ''', user_name, '''@''%''; '
        );
        PREPARE stmt FROM @grant_tables;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Permisos de actualización limitados
        SET @grant_update = CONCAT(
            'GRANT UPDATE (user_Names, user_LastNames, user_Description, user_ProfilePhoto) ',
            'ON Ghost_Running.UserGR TO ''', user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_update;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Vistas seguras del usuario
        SET @grant_views = CONCAT(
            'GRANT SELECT ON Ghost_Running.vw_user_my_trainings TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_user_weekly_goal_progress TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_user_my_challenges TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_user_my_publications TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_user_followers_and_following TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_user_progress_comparison TO ''', user_name, '''@''%''; '
        );
        PREPARE stmt FROM @grant_views;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- Vistas públicas
        SET @grant_public_views = CONCAT(
            'GRANT SELECT ON Ghost_Running.vw_top_routes TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_active_challenges TO ''', user_name, '''@''%''; ',
            'GRANT SELECT ON Ghost_Running.vw_global_stats TO ''', user_name, '''@''%''; '
        );
        PREPARE stmt FROM @grant_public_views;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;


FLUSH PRIVILEGES;