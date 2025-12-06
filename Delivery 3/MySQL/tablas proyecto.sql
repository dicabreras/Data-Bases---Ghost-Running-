CREATE DATABASE IF NOT EXISTS `Ghost_Running` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `Ghost_Running`;

DROP TABLE IF EXISTS `Comments`;
DROP TABLE IF EXISTS `Route_has_Coordinate`;
DROP TABLE IF EXISTS `Kilometer`;
DROP TABLE IF EXISTS `Publication`;
DROP TABLE IF EXISTS `Training`;
DROP TABLE IF EXISTS `Followed`;
DROP TABLE IF EXISTS `User_has_MonthlyChallenge`;
DROP TABLE IF EXISTS `MonthlyChallenge`;
DROP TABLE IF EXISTS `Reto`;
DROP TABLE IF EXISTS `Coordinate`;
DROP TABLE IF EXISTS `Route`;
DROP TABLE IF EXISTS `WeeklyGoal`;
DROP TABLE IF EXISTS `PhysicalState`;
DROP TABLE IF EXISTS `UserGR`;

-- Tabla UserGR
CREATE TABLE UserGR (
  User_Email VARCHAR(100) NOT NULL COMMENT 'Email electrónico único de cada userGR',
  User_Username VARCHAR(45) NOT NULL COMMENT 'Nombre de userGR único',
  user_Password VARCHAR(45) NOT NULL COMMENT 'Contraseña encriptada',
  user_Names VARCHAR(45) NOT NULL COMMENT 'Nombre(s) del userGR',
  user_LastNames VARCHAR(45) NOT NULL COMMENT 'Apellido(s) del userGR',
  user_Age INT NOT NULL COMMENT 'Age del userGR',
  user_ProfilePhoto VARCHAR(255) NULL COMMENT 'Imagen de perfil',
  user_Description MEDIUMTEXT NULL COMMENT 'Descripción breve sobre el userGR.',
  user_RegistrationDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de registro',
  user_gender VARCHAR(45) NULL COMMENT 'Género del userGR',
  PRIMARY KEY (User_Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla PhysicalState
CREATE TABLE PhysicalState (
  user_Email VARCHAR(100) NOT NULL COMMENT 'Llave foránea a userGR',
  phy_Date DATETIME NOT NULL COMMENT 'Fecha de ajuste del estado fisico.',
  phy_Height DECIMAL(3,2) NOT NULL COMMENT 'Altura del userGR en mts.',
  phy_Weight DECIMAL(5,2) NOT NULL COMMENT 'Peso del userGR en kgs.',
  PRIMARY KEY (user_Email, phy_Date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE PhysicalState ADD FOREIGN KEY (user_Email) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla WeeklyGoal
CREATE TABLE WeeklyGoal (
  user_Email VARCHAR(100) NOT NULL COMMENT 'Llave foránea a userGR',
  wee_StartDate DATETIME NOT NULL COMMENT 'Fecha de configuracion del objetivo semanal',
  wee_TrainingQuantity INT NOT NULL COMMENT 'Número de sesiones',
  wee_Distance DECIMAL(5,2) NOT NULL COMMENT 'Distancia objetivo en km',
  wee_Completed TINYINT NOT NULL COMMENT 'Indica si fue o no completado el objetivo semanal',
  PRIMARY KEY (user_Email, wee_StartDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE WeeklyGoal ADD FOREIGN KEY (user_Email) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Route
CREATE TABLE Route (
  rou_Id INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único',
  rou_Distance DECIMAL(5,2) NOT NULL COMMENT 'Distancia total de la ruta.',
  PRIMARY KEY (rou_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla Coordinate
CREATE TABLE Coordinate (
  coo_Id INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único',
  coo_Latitude FLOAT NOT NULL COMMENT 'Latitud',
  coo_Longitude FLOAT NOT NULL COMMENT 'Longitud',
  coo_Altitude FLOAT NOT NULL COMMENT 'Altitud',
  PRIMARY KEY (coo_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla MonthlyChallenge
CREATE TABLE MonthlyChallenge (
  mon_id INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único',
  mon_Distance DECIMAL(5,2) NOT NULL COMMENT 'Distancia objetivo',
  mon_StartDate DATE NOT NULL COMMENT 'Fecha inicio',
  mon_EndDate DATE NOT NULL COMMENT 'Fecha fin',
  PRIMARY KEY (mon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Representa algunos retos mensuales que se manejaran en la aplicación';

-- Tabla User_has_MonthlyChallenge
CREATE TABLE User_has_MonthlyChallenge (
  mon_Id INT NOT NULL COMMENT 'Reto al que el userGR se inscribio.',
  user_Email VARCHAR(100) NOT NULL COMMENT 'userGR.',  -- Cambiado de 45 a 100
  PRIMARY KEY (mon_Id, user_Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE User_has_MonthlyChallenge ADD FOREIGN KEY (mon_Id) REFERENCES MonthlyChallenge(mon_Id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE User_has_MonthlyChallenge ADD FOREIGN KEY (user_Email) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Route_has_Coordinate
CREATE TABLE Route_has_Coordinate (
  rou_Id INT NOT NULL COMMENT 'Ruta a la que pertenecen las coordenadas',
  coo_Id INT NOT NULL COMMENT 'Coordenadas',
  PRIMARY KEY (rou_Id, coo_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Route_has_Coordinate ADD FOREIGN KEY (rou_Id) REFERENCES Route(rou_Id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Route_has_Coordinate ADD FOREIGN KEY (coo_Id) REFERENCES Coordinate(coo_Id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Training
CREATE TABLE Training (
  tra_Counter INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del entrenamiento',
  user_Email VARCHAR(100) NOT NULL COMMENT 'Llave foranea al userGR.',
  rou_Id INT NOT NULL COMMENT 'Llave foranea a la ruta realizada por el userGR.',
  tra_Datetime DATETIME NOT NULL COMMENT 'Fecha y hora de inicio del entrenamiento',
  tra_Duration TIME NOT NULL COMMENT 'Duracion del entrenamiento.',
  tra_Rithm DECIMAL(4,2) NOT NULL COMMENT 'Ritmo del entrenamiento.',
  tra_MaxSpeed DECIMAL(5,2) NOT NULL COMMENT 'Velocidad maxima conseguida en el entrenamiento.',
  tra_AvgSpeed DECIMAL(5,2) NOT NULL COMMENT 'Velocidad promedio conseguida en el entrenamiento.',
  tra_Calories DECIMAL(6,2) NOT NULL COMMENT 'Calorías aproximadas consumidas.',
  tra_ElevationGain DECIMAL(5,2) NOT NULL COMMENT 'Cambio maximo de nivel (Punto mas alto - punto mas bajo)',
  tra_TrainingType ENUM('Running','Cycling') NOT NULL COMMENT 'Nos especifica de que tipo de entrenamiento estamos haciendo registro.',
  tra_IsGhost TINYINT NOT NULL COMMENT 'Indica si el entrenamiento esta habilitado para ser un ghost.',
  tra_AvgStride DECIMAL(5,2) NULL COMMENT 'Si el entrenamiento es de running, nos muestra la cadencia promedio.',
  PRIMARY KEY (tra_Counter),
  UNIQUE KEY (user_Email, rou_Id, tra_Counter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Training ADD FOREIGN KEY (user_Email) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Training ADD FOREIGN KEY (rou_Id) REFERENCES Route(rou_Id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Kilometer
CREATE TABLE Kilometer (
  km_Counter INT NOT NULL AUTO_INCREMENT COMMENT 'Auxiliar para identificar el numero de kilometro del entrenamiento hecho',
  Km_Time TIME NOT NULL COMMENT 'Tiempo empleado en el km',
  rou_Id INT NOT NULL COMMENT 'Llave foranea del entrenamiento a la ruta asociada',  -- Cambiado de rou_id a rou_Id
  tra_Counter INT NOT NULL COMMENT 'Llave foranea del entrenamiento asociado.',
  user_Email VARCHAR(100) NOT NULL COMMENT 'Llave foranea al usuario.',
  PRIMARY KEY (km_Counter, rou_Id, tra_Counter, user_Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Kilometer ADD FOREIGN KEY (rou_Id) REFERENCES Route(rou_Id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Kilometer ADD FOREIGN KEY (user_Email, rou_Id, tra_Counter) REFERENCES Training(user_Email, rou_Id, tra_Counter) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Publication
CREATE TABLE Publication (
  pub_Counter INT NOT NULL AUTO_INCREMENT COMMENT 'Auxiliar para diferenciar las publicaciones de un mismo usuario',
  pub_Likes INT NOT NULL COMMENT 'Número de me gusta',
  pub_RouteImage VARCHAR(255) NULL COMMENT 'Imagen de la ruta',
  pub_Privacity INT NOT NULL COMMENT 'Privacidad (0 := Publico, 1:= Privado, 2:= Solo seguidores)',
  pub_Datetime DATETIME NOT NULL COMMENT 'Hora de publicacion.',
  user_Email VARCHAR(100) NOT NULL COMMENT 'usuario asociado',
  tra_Counter INT NOT NULL COMMENT 'Auxiliar de identificacion del entrenamiento a publicar',
  rou_Id INT NOT NULL COMMENT 'Ruta asociada',  -- Agregado para referencia completa
  PRIMARY KEY (pub_Counter, user_Email, tra_Counter, rou_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Publication ADD FOREIGN KEY (user_Email, rou_Id, tra_Counter) REFERENCES Training(user_Email, rou_Id, tra_Counter) ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Followed
CREATE TABLE Followed (
  user_EmailFollower VARCHAR(100) NOT NULL COMMENT 'usuario que sigue.',  -- Cambiado de 45 a 100
  user_EmailFollowed VARCHAR(100) NOT NULL COMMENT 'usuario que es seguido.',  -- Cambiado de 45 a 100
  PRIMARY KEY (user_EmailFollower, user_EmailFollowed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE Followed ADD FOREIGN KEY (user_EmailFollower) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE Followed ADD FOREIGN KEY (user_EmailFollowed) REFERENCES UserGR(User_Email) ON DELETE CASCADE ON UPDATE CASCADE;


-- Tabla Comments (Comentarios de publicaciones)
CREATE TABLE Comments (
  pub_Counter INT NOT NULL COMMENT 'Auxiliar de diferenciación de publicación (Llave de publication)',
  user_Email VARCHAR(100) NOT NULL COMMENT 'Llave Foranea al usuario (Llave de publication)',
  tra_Counter INT NOT NULL COMMENT 'Auxiliar de diferenciación del entrenamiento (Llave de Publication)',
  rou_Id INT NOT NULL COMMENT 'Ruta asociada (Llave de Publication)',
  com_Counter INT NOT NULL AUTO_INCREMENT COMMENT 'Auxiliar de diferenciación de comentarios',
  com_Text MEDIUMTEXT NOT NULL COMMENT 'Texto del comentario',
  com_Likes INT NOT NULL DEFAULT 0 COMMENT 'Cantidad de likes del comentario',
  com_Datetime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora del comentario',
  PRIMARY KEY (com_Counter, pub_Counter, user_Email, tra_Counter, rou_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Guarda los comentarios de las publicaciones';

-- Foreign Keys hacia la tabla Publication
ALTER TABLE Comments ADD FOREIGN KEY (pub_Counter, user_Email, tra_Counter, rou_Id) 
REFERENCES Publication(pub_Counter, user_Email, tra_Counter, rou_Id) 
ON DELETE CASCADE ON UPDATE CASCADE;


