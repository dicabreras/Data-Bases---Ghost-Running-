USE Ghost_Running;

--  UserGR

CREATE UNIQUE INDEX idx_usergr_username
ON UserGR (User_Username);



--  MonthlyChallenge

-- Índice por fechas, permite buscar retos activos por rango de fechas
CREATE INDEX idx_monthlychallenge_dates
ON MonthlyChallenge (mon_StartDate, mon_EndDate);



--  User_has_MonthlyChallenge

CREATE INDEX idx_uhmc_user_email
ON User_has_MonthlyChallenge (user_Email);



-- Training

CREATE INDEX idx_training_user_date
ON Training (user_Email, tra_Datetime);

-- Consultas por ruta (top rutas, actividad por ruta, etc.)
CREATE INDEX idx_training_route
ON Training (rou_Id);



--  Kilometer

CREATE INDEX idx_kilometer_training
ON Kilometer (tra_Counter);



--  Publication

-- Publicaciones de un usuario: feed, perfil, etc.
CREATE INDEX idx_publication_user_date
ON Publication (user_Email, pub_Datetime);

-- Publicaciones ligadas a un entrenamiento específico
CREATE INDEX idx_publication_training
ON Publication (tra_Counter);



--  Followed

CREATE INDEX idx_followed_followed
ON Followed (user_EmailFollowed);



-- Comments

--   - Comentarios de una publicación ordenados por fecha
CREATE INDEX idx_comments_publication_date
ON Comments (pub_Counter, com_Datetime);

CREATE INDEX idx_comments_user
ON Comments (user_Email);


