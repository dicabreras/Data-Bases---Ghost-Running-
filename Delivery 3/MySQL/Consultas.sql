-- 1. Usuarios que han participado en al menos un reto
SELECT DISTINCT u.User_Email
FROM UserGR AS u
INNER JOIN User_has_MonthlyChallenge AS umc 
    ON u.User_Email = umc.user_Email;

-- 2. Top usuarios por número de entrenamientos
SELECT 
    t.user_Email,
    COUNT(t.tra_Counter) AS total_trainings
FROM Training AS t
GROUP BY t.user_Email
ORDER BY total_trainings DESC;

-- 3. Velocidad promedio por ruta
SELECT 
    r.rou_Id,
    AVG(t.tra_AvgSpeed) AS avg_speed_kmh
FROM Training AS t
INNER JOIN Route AS r 
    ON t.rou_Id = r.rou_Id
GROUP BY r.rou_Id
ORDER BY avg_speed_kmh DESC;

-- 4. Usuarios sin entrenamientos
SELECT u.User_Email
FROM UserGR AS u
WHERE u.User_Email NOT IN (
    SELECT DISTINCT t.user_Email
    FROM Training AS t
);


-- 5. Publicaciones con sus likes (agregado)

SELECT 
    p.pub_Counter,
    p.user_Email,
    SUM(p.pub_Likes) AS likes_total
FROM Publication AS p
GROUP BY p.pub_Counter, p.user_Email
ORDER BY likes_total DESC;


-- 6. Usuarios mutuos (A sigue a B y B sigue a A)
SELECT 
    f1.user_EmailFollower AS follower,
    f1.user_EmailFollowed AS followed
FROM Followed AS f1
INNER JOIN Followed AS f2 
    ON f1.user_EmailFollower = f2.user_EmailFollowed 
   AND f1.user_EmailFollowed = f2.user_EmailFollower;


-- 7. Número promedio de kilómetros por entrenamiento
SELECT 
    AVG(km_count) AS avg_km_per_training
FROM (
    SELECT 
        tra_Counter,
        COUNT(km_Counter) AS km_count
    FROM Kilometer
    GROUP BY tra_Counter
) AS training_km_counts;



