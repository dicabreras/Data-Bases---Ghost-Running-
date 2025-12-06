USE Ghost_Running;

--  Actualizar información básica de usuario
UPDATE UserGR 
SET 
    user_Names = 'NuevoNombre',
    user_LastNames = 'NuevoApellido',
    user_Description = 'Nueva descripción del perfil',
    user_ProfilePhoto = 'nueva_foto.jpg',
    user_Age = 25
WHERE User_Email = 'user1@ghost.com';

--  Actualizar estado físico del usuario
UPDATE PhysicalState 
SET 
    phy_Height = 1.75,
    phy_Weight = 70.5
WHERE user_Email = 'user1@ghost.com' 
AND phy_Date = '2025-09-01 08:00:00';


-- Actualizar meta semanal (marcar como completada)
UPDATE WeeklyGoal 
SET 
    wee_Completed = 1,
    wee_TrainingQuantity = 5,
    wee_Distance = 30.0
WHERE user_Email = 'user1@ghost.com' 
AND wee_StartDate = '2025-10-20 00:00:00';

--  Actualizar entrenamiento (corregir datos)
UPDATE Training 
SET 
    tra_Duration = '01:15:00',
    tra_AvgSpeed = 12.5,
    tra_Calories = 450.0,
    tra_TrainingType = 'Running'
WHERE tra_Counter = 1 
AND user_Email = 'user1@ghost.com';

--  Actualizar publicación 
UPDATE Publication 
SET 
    pub_Privacity = 1,  
    pub_Likes = pub_Likes + 1 
WHERE pub_Counter = 1 
AND user_Email = 'user1@ghost.com';

--  Actualizar comentario
UPDATE Comments 
SET 
    com_Text = 'Texto corregido del comentario',
    com_Likes = com_Likes + 1
WHERE com_Counter = 1 
AND user_Email = 'user1@ghost.com';

--  Actualizar ruta
UPDATE Route 
SET rou_Distance = 8.5 
WHERE rou_Id = 1;

-- Actualizar coordenada
UPDATE Coordinate 
SET 
    coo_Latitude = 4.710989,
    coo_Longitude = -74.072092,
    coo_Altitude = 2550.0
WHERE coo_Id = 1;

-- Actualizar reto mensual 
UPDATE MonthlyChallenge 
SET 
    mon_EndDate = DATE_ADD(mon_EndDate, INTERVAL 7 DAY),
    mon_Distance = 100.0
WHERE mon_id = 1;


-- BORRADOS

-- Eliminar comentario específico
DELETE FROM Comments 
WHERE com_Counter = 1 
AND user_Email = 'user1@ghost.com'
AND pub_Counter = 1;

--  Eliminar publicación específica
DELETE FROM Publication 
WHERE pub_Counter = 1 
AND user_Email = 'user1@ghost.com';

--  Eliminar entrenamiento específico (se eliminarán en cascada sus publicaciones y kilómetros)
DELETE FROM Training 
WHERE tra_Counter = 1 
AND user_Email = 'user1@ghost.com';

-- Eliminar seguimiento
DELETE FROM Followed 
WHERE user_EmailFollower = 'user2@ghost.com' 
AND user_EmailFollowed = 'user1@ghost.com';
select * from followed  ;
--  Eliminar participación en reto mensual
DELETE FROM User_has_MonthlyChallenge 
WHERE user_Email = 'user1@ghost.com' 
AND mon_Id = 1;

-- Eliminar meta semanal específica
DELETE FROM WeeklyGoal 
WHERE user_Email = 'user1@ghost.com' 
AND wee_StartDate = '2024-01-01 00:00:00';

-- Eliminar registro de estado físico específico
DELETE FROM PhysicalState 
WHERE user_Email = 'user1@ghost.com' 
AND phy_Date = '2024-01-15 10:00:00';

-- Eliminar datos de kilómetros de un entrenamiento
DELETE FROM Kilometer 
WHERE user_Email = 'user1@ghost.com' 
AND tra_Counter = 1;

--  Eliminar coordenada de una ruta
DELETE FROM Route_has_Coordinate 
WHERE rou_Id = 1 
AND coo_Id = 1;

--  Eliminar coordenada 
DELETE FROM Coordinate 
WHERE coo_Id = 1;

-- Eliminar ruta si no tiene entrenamientos asociados
DELETE FROM Route 
WHERE rou_Id = 1;

-- 12. Eliminar reto mensual si no tiene participantes
DELETE FROM MonthlyChallenge 
WHERE mon_id = 1;


--  LIMPIEZA MASIVA


-- Eliminar todos los comentarios de un usuario
DELETE FROM Comments 
WHERE com_Counter IN (
    SELECT com_Counter FROM (
        SELECT com_Counter FROM Comments 
        WHERE user_Email = 'user1@ghost.com'
    ) AS temp
);

-- Eliminar publicaciones usando clave primaria
DELETE FROM Publication 
WHERE pub_Counter IN (
    SELECT pub_Counter FROM (
        SELECT pub_Counter FROM Publication 
        WHERE user_Email = 'user1@ghost.com'
    ) AS temp
);

-- Eliminar entrenamientos 
DELETE FROM Training 
WHERE tra_Counter IN (
    SELECT tra_Counter FROM (
        SELECT tra_Counter FROM Training 
        WHERE user_Email = 'user1@ghost.com'
    ) AS temp
);

-- Eliminar usuario
DELETE FROM UserGR 
WHERE User_Email = 'user1@ghost.com';  -- KEY column

-- Eliminar retos vencidos sin participantes
DELETE FROM MonthlyChallenge 
WHERE mon_id IN (
    SELECT mon_id FROM (
        SELECT mon_id FROM MonthlyChallenge 
        WHERE mon_EndDate < CURDATE() 
        AND mon_id NOT IN (SELECT DISTINCT mon_Id FROM User_has_MonthlyChallenge)
    ) AS temp
);

--  ACTUALIZACIONES MASIVAS


--  Resetear likes de todas las publicaciones de un usuario
UPDATE Publication 
SET pub_Likes = 0 
WHERE user_Email = 'user2@ghost.com';

-- Actualizar tipo de entrenamiento masivamente
UPDATE Training 
SET tra_TrainingType = 'Cycling' 
WHERE tra_TrainingType = 'Running' 
AND user_Email = 'user1@ghost.com';

-- Marcar todas las metas semanales vencidas como no completadas
UPDATE WeeklyGoal 
SET wee_Completed = 0 
WHERE wee_StartDate < DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
AND wee_Completed = 1;

--  Actualizar privacidad de publicaciones masivamente
UPDATE Publication 
SET pub_Privacity = 0  -- Hacer todas públicas
WHERE user_Email = 'user1@ghost.com' 
AND pub_Privacity != 0;

-- Incrementar distancia de todos los retos activos
UPDATE MonthlyChallenge 
SET mon_Distance = mon_Distance * 1.1  -- Incrementar 10%
WHERE CURDATE() BETWEEN mon_StartDate AND mon_EndDate;
