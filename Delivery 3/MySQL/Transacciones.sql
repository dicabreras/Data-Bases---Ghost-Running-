--  Actualizar el perfil de un usuario
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
        user_Names       = p_names,
        user_LastNames   = p_lastnames,
        user_Description = p_description,
        user_ProfilePhoto= p_profile_photo,
        user_Age         = p_age
    WHERE User_Email = p_user_email;
END//
DELIMITER ;

-- crear publicacion
 DROP PROCEDURE IF EXISTS sp_user_publish_training_with_comment;
DELIMITER //
CREATE PROCEDURE sp_user_publish_training_with_comment(
    IN p_user_email     VARCHAR(100),
    IN p_tra_counter    INT,
    IN p_rou_id         INT,
    IN p_pub_routeimage VARCHAR(255),
    IN p_pub_privacity  INT,
    IN p_comment_text   MEDIUMTEXT
)
BEGIN
    DECLARE v_pub_counter INT;

    -- Handler para errores: rollback + re-lanzar
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1) Crear publicación
    INSERT INTO Publication (
        pub_Likes,
        pub_RouteImage,
        pub_Privacity,
        pub_Datetime,
        user_Email,
        tra_Counter,
        rou_Id
    )
    VALUES (
        0,
        p_pub_routeimage,
        p_pub_privacity,
        NOW(),
        p_user_email,
        p_tra_counter,
        p_rou_id
    );

    SET v_pub_counter = LAST_INSERT_ID();

    -- 2) Crear comentario asociado
    INSERT INTO Comments (
        pub_Counter,
        user_Email,
        tra_Counter,
        rou_Id,
        com_Text,
        com_Likes,
        com_Datetime
    )
    VALUES (
        v_pub_counter,
        p_user_email,
        p_tra_counter,
        p_rou_id,
        p_comment_text,
        0,
        NOW()
    );

    COMMIT;
END//
DELIMITER ;


-- 
-- 