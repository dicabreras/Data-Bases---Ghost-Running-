USE Ghost_Running;

-- 1. CREAR USUARIO ADMINISTRADOR
DROP USER IF EXISTS 'admin_ghost'@'%';
CREATE USER 'admin_ghost'@'%' IDENTIFIED BY 'Admin123';
GRANT ALL PRIVILEGES ON Ghost_Running.* TO 'admin_ghost'@'%';

-- Vistas administrativas específicas
GRANT SELECT ON Ghost_Running.vw_admin_user_summary TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_performance TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_publications_activity TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_monthly_challenge_participation TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_user_physical_state TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_activity_by_sport_and_age TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_most_used_routes TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_activity_by_month TO 'admin_ghost'@'%';

-- 2. PROCEDIMIENTO PARA CREAR USUARIOS NORMALES
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
        
        -- A) PERMISOS DE ESCRITURA - CADA GRANT POR SEPARADO
        SET @grant1 = CONCAT('GRANT INSERT ON Ghost_Running.Training TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant1;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant2 = CONCAT('GRANT INSERT ON Ghost_Running.Publication TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant2;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant3 = CONCAT('GRANT INSERT ON Ghost_Running.Comments TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant3;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant4 = CONCAT('GRANT INSERT, DELETE ON Ghost_Running.Followed TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant4;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant5 = CONCAT('GRANT INSERT, UPDATE ON Ghost_Running.PhysicalState TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant5;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant6 = CONCAT('GRANT INSERT, UPDATE ON Ghost_Running.WeeklyGoal TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant6;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant7 = CONCAT('GRANT INSERT, DELETE ON Ghost_Running.User_has_MonthlyChallenge TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant7;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant8 = CONCAT('GRANT INSERT ON Ghost_Running.Kilometer TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant8;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- B) PERMISOS DE LECTURA EN TABLAS DE REFERENCIA
        SET @grant9 = CONCAT('GRANT SELECT ON Ghost_Running.MonthlyChallenge TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant9;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant10 = CONCAT('GRANT SELECT ON Ghost_Running.Route TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant10;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant11 = CONCAT('GRANT SELECT ON Ghost_Running.Coordinate TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant11;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant12 = CONCAT('GRANT SELECT ON Ghost_Running.Route_has_Coordinate TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant12;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- C) PERMISOS PARA ACTUALIZAR INFORMACIÓN BÁSICA
        SET @grant13 = CONCAT('GRANT UPDATE (user_Names, user_LastNames, user_Description, user_ProfilePhoto, user_Age) ON Ghost_Running.UserGR TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant13;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- D) VISTAS SEGURAS DEL USUARIO
        SET @grant14 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_my_trainings TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant14;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant15 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_weekly_goal_progress TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant15;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant16 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_my_challenges TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant16;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant17 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_my_publications TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant17;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant18 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_followers_and_following TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant18;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant19 = CONCAT('GRANT SELECT ON Ghost_Running.vw_user_progress_comparison TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant19;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        -- E) VISTAS PÚBLICAS
        SET @grant20 = CONCAT('GRANT SELECT ON Ghost_Running.vw_top_routes TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant20;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant21 = CONCAT('GRANT SELECT ON Ghost_Running.vw_active_challenges TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant21;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
        SET @grant22 = CONCAT('GRANT SELECT ON Ghost_Running.vw_global_stats TO ''', user_name, '''@''%''');
        PREPARE stmt FROM @grant22;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        
    END LOOP;
    
    CLOSE cur;
END //
DELIMITER ;


CALL CreateUserAccounts();


DROP PROCEDURE CreateUserAccounts;


FLUSH PRIVILEGES;

-- VERIFICACIÓN
SELECT 'Usuarios creados exitosamente' AS Estado;
SELECT user, host FROM mysql.user WHERE user = 'admin_ghost' OR user IN (SELECT User_Username FROM UserGR);