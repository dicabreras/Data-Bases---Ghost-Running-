DROP TRIGGER IF EXISTS trg_followed_no_self_follow;
DELIMITER //
CREATE TRIGGER trg_followed_no_self_follow
BEFORE INSERT ON Followed
FOR EACH ROW
BEGIN
    IF NEW.user_EmailFollower = NEW.user_EmailFollowed THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Un usuario no puede seguirse a sí mismo.';
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_training_enforce_ghost_and_stride;
DELIMITER //
CREATE TRIGGER trg_training_enforce_ghost_and_stride
BEFORE INSERT ON Training
FOR EACH ROW
BEGIN
    -- Si no es Running: no permitimos cadencia
    IF NEW.tra_TrainingType <> 'Running' THEN
        SET NEW.tra_IsGhost  = 0;
        SET NEW.tra_AvgStride = NULL;
    END IF;


    IF NEW.tra_TrainingType = 'Running' 
       AND NEW.tra_AvgStride IS NULL THEN
        SET NEW.tra_AvgStride = 80.00;
    END IF;
END//
DELIMITER ;

DROP TRIGGER IF EXISTS trg_training_update_weekly_goal;
DELIMITER //
CREATE TRIGGER trg_training_update_weekly_goal
AFTER INSERT ON Training
FOR EACH ROW
BEGIN
    UPDATE WeeklyGoal w
    SET w.wee_Completed = 1
    WHERE w.user_Email = NEW.user_Email
      AND NEW.tra_Datetime >= w.wee_StartDate
      AND NEW.tra_Datetime <  DATE_ADD(w.wee_StartDate, INTERVAL 7 DAY)
      AND (
          SELECT IFNULL(SUM(r.rou_Distance), 0)
          FROM Training t2
          JOIN Route r ON t2.rou_Id = r.rou_Id
          WHERE t2.user_Email   = NEW.user_Email
            AND t2.tra_Datetime >= w.wee_StartDate
            AND t2.tra_Datetime <  DATE_ADD(w.wee_StartDate, INTERVAL 7 DAY)
      ) >= w.wee_Distance;
END//
DELIMITER ;
