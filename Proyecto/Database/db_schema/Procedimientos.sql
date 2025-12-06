USE Ghost_Running;

-- Procedimiento para crear un usuario de base de datos MySQL con el username EXACTO provisto por la app
DROP PROCEDURE IF EXISTS sp_create_db_user_app;
DELIMITER //
CREATE PROCEDURE sp_create_db_user_app(
    IN p_app_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    -- Usamos directamente el username provisto por la app. El nombre se pasará como literal SQL mediante QUOTE()
    SET @create_sql = CONCAT('CREATE USER IF NOT EXISTS ', QUOTE(p_app_username), '@', QUOTE('%'), ' IDENTIFIED BY ?');
    PREPARE stmt_create FROM @create_sql;
    SET @pwd = p_password;
    EXECUTE stmt_create USING @pwd;
    DEALLOCATE PREPARE stmt_create;

    -- Permisos limitados para usuarios de app: tablas relevantes
    SET @grant_sql = CONCAT('GRANT SELECT, INSERT, UPDATE, DELETE ON ', QUOTE(DATABASE()), '.', QUOTE('Training'), ' TO ', QUOTE(p_app_username), '@', QUOTE('%'));
    PREPARE stmt_grant FROM @grant_sql;
    EXECUTE stmt_grant;
    DEALLOCATE PREPARE stmt_grant;

    SET @grant_sql = CONCAT('GRANT SELECT, INSERT, UPDATE, DELETE ON ', QUOTE(DATABASE()), '.', QUOTE('Publication'), ' TO ', QUOTE(p_app_username), '@', QUOTE('%'));
    PREPARE stmt_grant2 FROM @grant_sql;
    EXECUTE stmt_grant2;
    DEALLOCATE PREPARE stmt_grant2;

    SET @grant_sql = CONCAT('GRANT SELECT, INSERT, UPDATE, DELETE ON ', QUOTE(DATABASE()), '.', QUOTE('Comment'), ' TO ', QUOTE(p_app_username), '@', QUOTE('%'));
    PREPARE stmt_grant3 FROM @grant_sql;
    EXECUTE stmt_grant3;
    DEALLOCATE PREPARE stmt_grant3;

    SET @grant_sql = CONCAT('GRANT SELECT, INSERT, UPDATE, DELETE ON ', QUOTE(DATABASE()), '.', QUOTE('Route'), ' TO ', QUOTE(p_app_username), '@', QUOTE('%'));
    PREPARE stmt_grant4 FROM @grant_sql;
    EXECUTE stmt_grant4;
    DEALLOCATE PREPARE stmt_grant4;

    SET @grant_sql = CONCAT('GRANT SELECT, INSERT, UPDATE, DELETE ON ', QUOTE(DATABASE()), '.', QUOTE('Kilometer'), ' TO ', QUOTE(p_app_username), '@', QUOTE('%'));
    PREPARE stmt_grant5 FROM @grant_sql;
    EXECUTE stmt_grant5;
    DEALLOCATE PREPARE stmt_grant5;

    FLUSH PRIVILEGES;

    SELECT p_app_username AS created_db_username;
END//
DELIMITER ;

-- Procedimiento para crear un administrador de BD asociado a un username de app (admin_...)
DROP PROCEDURE IF EXISTS sp_create_db_admin_app;
DELIMITER //
CREATE PROCEDURE sp_create_db_admin_app(
    IN p_app_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_clean VARCHAR(100);
    DECLARE v_username VARCHAR(64);
    SET v_clean = LOWER(REGEXP_REPLACE(p_app_username, '[^a-zA-Z0-9]', '_'));
    SET v_username = CONCAT('admin_', LEFT(v_clean, 30));

    SET @create_sql = CONCAT('CREATE USER IF NOT EXISTS `', v_username, '`@"%" IDENTIFIED BY ?');
    PREPARE stmt_create FROM @create_sql;
    SET @pwd = p_password;
    EXECUTE stmt_create USING @pwd;
    DEALLOCATE PREPARE stmt_create;

    SET @grant_sql = CONCAT('GRANT ALL PRIVILEGES ON `', DATABASE(), '`.* TO `', v_username, '`@"%"');
    PREPARE stmt_grant FROM @grant_sql;
    EXECUTE stmt_grant;
    DEALLOCATE PREPARE stmt_grant;

    FLUSH PRIVILEGES;

    SELECT v_username AS created_db_username;
END//
DELIMITER ;
