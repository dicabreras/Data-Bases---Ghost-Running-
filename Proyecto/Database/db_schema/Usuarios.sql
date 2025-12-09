USE Ghost_Running;


--  USUARIO ADMINISTRADOR

-- Perfil de aplicación para el admin (solo consulta de vistas)
INSERT INTO UserGR (
    user_Email,
    user_Username,
    user_Password,
    user_Names,
    user_LastNames,
    user_Age,
    user_RegistrationDate
) VALUES (
    'admin@runner.com',
    'admin',
    '$2b$10$RtAyaa4hJU0lUxC6VXIf9.xaC.9fSM9Kz43CzjRTrJYJOLD591E7C', -- bcrypt de "Admin123"
    'Admin',
    'Runner',
    35,
    NOW()
)
ON DUPLICATE KEY UPDATE user_Email = user_Email;

DROP USER IF EXISTS 'admin_ghost'@'%';
CREATE USER 'admin_ghost'@'%' IDENTIFIED BY 'Admin123';

-- Admin con control total sobre la BD
GRANT ALL PRIVILEGES ON Ghost_Running.* TO 'admin_ghost'@'%';

-- (Opcional, solo documenta la intención; ALL PRIVILEGES ya lo cubre)
GRANT SELECT ON Ghost_Running.vw_admin_user_summary                  TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_performance          TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_publications_activity         TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_monthly_challenge_participation TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_user_physical_state           TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_activity_by_sport_and_age     TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_most_used_routes              TO 'admin_ghost'@'%';
GRANT SELECT ON Ghost_Running.vw_admin_training_activity_by_month    TO 'admin_ghost'@'%';


-- =====================================================
-- 2. USUARIO SOLO-LECTURA SOBRE VISTAS PÚBLICAS
--    (puede hacer SELECT solo a ciertas vistas)
-- =====================================================

-- Este usuario representa un perfil muy limitado: solo consulta
-- información pública / agregada, sin tocar tablas base.
DROP USER IF EXISTS 'ghost_public'@'%';
CREATE USER 'ghost_public'@'%' IDENTIFIED BY 'Public123';

-- Vistas consideradas "públicas":
--   - vw_top_routes        : Top 10 rutas más populares
--   - vw_active_challenges : Retos activos con fechas
--   - vw_global_stats      : Estadísticas globales de la plataforma
GRANT SELECT ON Ghost_Running.vw_top_routes        TO 'ghost_public'@'%';
GRANT SELECT ON Ghost_Running.vw_active_challenges TO 'ghost_public'@'%';
GRANT SELECT ON Ghost_Running.vw_global_stats      TO 'ghost_public'@'%';


-- =====================================================
-- 3. PROCEDIMIENTO PARA CREAR USUARIOS A PARTIR DE UserGR
--    (USUARIOS "NORMALES" -> SOLO PROCEDIMIENTOS)
-- =====================================================

DROP PROCEDURE IF EXISTS CreateUserAccounts;
CREATE PROCEDURE CreateUserAccounts()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE user_name VARCHAR(255);

    -- Cursor: recorre todos los usernames definidos en la tabla lógica UserGR
    DECLARE cur CURSOR FOR
        SELECT user_Username FROM UserGR;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO user_name;
        IF done THEN
            LEAVE read_loop;
        END IF;

       
        -- 3.1. Crear usuario físico en MySQL
       
        SET @drop_user = CONCAT(
            'DROP USER IF EXISTS ''', user_name, '''@''%'''
        );
        PREPARE stmt FROM @drop_user;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @create_user = CONCAT(
            'CREATE USER ''', user_name, '''@''%'' IDENTIFIED BY ''User123'''
        );
        PREPARE stmt FROM @create_user;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;


        
        --  PERMISOS POR PERFIL (USUARIO NORMAL)


        -- A) Consultas de información personal (historial, metas, retos, etc.)
        SET @grant_p1 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_my_trainings TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p1;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p2 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_weekly_goal_progress TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p2;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p3 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_my_challenges TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p3;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p4 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_my_publications TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p4;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p5 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_followers_and_following TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p5;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p6 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_progress_comparison TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p6;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;


        -- B) Permitir que el usuario MODIFIQUE solo su perfil
        SET @grant_p7 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_update_profile TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p7;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;


        -- C) Registrar entrenamientos completos (Training + Kilometer) con transacciones
        SET @grant_p8 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_register_training_with_kilometers TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p8;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;


        -- D) Publicar entrenamientos y comentarios
        SET @grant_p9 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_publish_training_with_comment TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p9;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;


        -- E) Gestionar retos mensuales (inscribirse / retirarse)
        SET @grant_p10 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_join_monthly_challenge TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p10;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        SET @grant_p11 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_user_leave_monthly_challenge TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p11;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;

        
        SET @grant_p12 = CONCAT(
            'GRANT EXECUTE ON PROCEDURE Ghost_Running.sp_q07_avg_km_per_training TO ''',
            user_name, '''@''%'''
        );
        PREPARE stmt FROM @grant_p12;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        



    END LOOP;

    CLOSE cur;
END;




CALL CreateUserAccounts();

DROP PROCEDURE IF EXISTS CreateUserAccounts;

FLUSH PRIVILEGES;

SELECT 'Usuarios creados exitosamente' AS Estado;

SELECT user, host
FROM mysql.user
WHERE user = 'admin_ghost'
    OR user = 'ghost_public'
    OR user IN (SELECT user_Username FROM UserGR);
