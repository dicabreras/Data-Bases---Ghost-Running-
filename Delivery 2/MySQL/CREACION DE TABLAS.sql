

CREATE DATABASE IF NOT EXISTS 'GhostRunning' DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 
USE 'GhostRunning'; 


DROP TABLE IF EXISTS 'Seguidos'; 
DROP TABLE IF EXISTS 'Entrenamientos_Usuario'; 
DROP TABLE IF EXISTS 'Running';
DROP TABLE IF EXISTS 'Cycling'; 
DROP TABLE IF EXISTS 'Publicacion';
DROP TABLE IF EXISTS 'Inscripcion_Reto';
DROP TABLE IF EXISTS 'Km';
DROP TABLE IF EXISTS 'Entrenamiento'; 
DROP TABLE IF EXISTS 'Objetivos_Semanal';
DROP TABLE IF EXISTS 'Estado_Fisico'; 
DROP TABLE IF EXISTS 'Coordenada'; 
DROP TABLE IF EXISTS 'Ruta';
DROP TABLE IF EXISTS 'Reto'; 
DROP TABLE IF EXISTS 'Usuario';





-- Tabla Usuario: información básica del usuario.
CREATE TABLE Usuario (
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Correo electrónico único del usuario',
  Usu_Username VARCHAR(100) NOT NULL UNIQUE COMMENT 'Nombre de usuario único',
  Usu_Contrasena VARCHAR(255) NOT NULL COMMENT 'Contraseña encriptada',
  Usu_Nombres VARCHAR(100) NOT NULL COMMENT 'Nombres del usuario',
  Usu_Apellidos VARCHAR(100) NOT NULL COMMENT 'Apellidos del usuario',
  Usu_Edad INT COMMENT 'Edad del usuario',
  Usu_FotoPerfil VARCHAR(255) NULL COMMENT 'Ruta o URL de la foto de perfil',
  Usu_Descripcion TEXT NULL COMMENT 'Descripción del perfil',
  Usu_FechaRegistro DATE NOT NULL COMMENT 'Fecha de registro del usuario',
  Usu_Genero VARCHAR(50) COMMENT 'Género del usuario',
  PRIMARY KEY (Usu_Correo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Usuarios registrados en la aplicación';



-- Tabla Estado_Fisico: almacena peso y altura de cada usuario.
CREATE TABLE Estado_Fisico (
  Est_Fis_ID INT AUTO_INCREMENT PRIMARY KEY,
  Est_Fis_Peso DECIMAL(5,2) NOT NULL COMMENT 'Peso del usuario en kg',
  Est_Fis_Altura DECIMAL(4,2) NOT NULL COMMENT 'Altura del usuario en metros',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario al que pertenece el registro físico',
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Registro físico de cada usuario';


-- Tabla Objetivos_Semanal: metas de entrenamiento semanal.
CREATE TABLE Objetivos_Semanal (
  Obj_Ent_Sem_ID INT AUTO_INCREMENT PRIMARY KEY,
  Obj_Ent_Sem_NumeroEntrenamientos INT NOT NULL COMMENT 'Número de entrenamientos semanales',
  Obj_Ent_Sem_Distancia DOUBLE NOT NULL COMMENT 'Distancia total semanal en km',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario asociado al objetivo',
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Objetivos semanales definidos por cada usuario';


-- Tabla Ruta: define trayectos registrados.
CREATE TABLE Ruta (
  Rut_ID INT AUTO_INCREMENT PRIMARY KEY,
  Rut_Distancia DOUBLE NOT NULL COMMENT 'Distancia total de la ruta en km'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Rutas recorridas por los usuarios';


-- Tabla Coordenada: puntos geográficos de una ruta.
CREATE TABLE Coordenada (
  Coor_ID INT AUTO_INCREMENT PRIMARY KEY,
  Coor_Latitud DECIMAL(9,6) NOT NULL COMMENT 'Latitud geográfica',
  Coor_Longitud DECIMAL(9,6) NOT NULL COMMENT 'Longitud geográfica',
  Coor_Altitud DOUBLE COMMENT 'Altitud sobre el nivel del mar',
  Rut_ID INT NOT NULL COMMENT 'Ruta a la que pertenece la coordenada',
  FOREIGN KEY (Rut_ID) REFERENCES Ruta(Rut_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Coordenadas que conforman las rutas';



-- Tabla Entrenamiento: sesiones registradas.
CREATE TABLE Entrenamiento (
  Ent_ID INT AUTO_INCREMENT PRIMARY KEY,
  Ent_Fecha DATE NOT NULL COMMENT 'Fecha del entrenamiento',
  Ent_Hora_Inicio TIME COMMENT 'Hora de inicio',
  Ent_Duracion VARCHAR(50) COMMENT 'Duración de la sesión',
  Ent_Distancia DOUBLE COMMENT 'Distancia total recorrida en km',
  Ent_Ritmo DOUBLE COMMENT 'Ritmo promedio min/km',
  Ent_Max_Speed DOUBLE COMMENT 'Velocidad máxima',
  Ent_Avg_Speed DOUBLE COMMENT 'Velocidad promedio',
  Ent_Calorias INT COMMENT 'Calorías quemadas',
  Ent_CambioNivel DOUBLE COMMENT 'Cambio de nivel de altitud',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario que realizó el entrenamiento',
  Rut_ID INT COMMENT 'Ruta asociada al entrenamiento',
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Rut_ID) REFERENCES Ruta(Rut_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Entrenamientos realizados por los usuarios';



-- Tabla Km: registro de tiempos por kilómetro.
CREATE TABLE Km (
  Km_ID INT AUTO_INCREMENT PRIMARY KEY,
  Km_Tiempo VARCHAR(50) NOT NULL COMMENT 'Tiempo por kilómetro',
  Km_Distancia DOUBLE NOT NULL COMMENT 'Distancia parcial',
  Ent_ID INT NOT NULL COMMENT 'Entrenamiento asociado',
  FOREIGN KEY (Ent_ID) REFERENCES Entrenamiento(Ent_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Segmentos de entrenamiento por kilómetro';


-- Tabla Reto: desafíos mensuales entre usuarios.
CREATE TABLE Reto (
  Ret_Men_ID INT AUTO_INCREMENT PRIMARY KEY,
  Ret_Men_Distancia DOUBLE NOT NULL COMMENT 'Distancia objetivo del reto',
  Ret_Men_Fecha_Inicio DATE NOT NULL COMMENT 'Fecha de inicio',
  Ret_Men_Fecha_Finalizacion DATE NOT NULL COMMENT 'Fecha de finalización'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Retos mensuales de distancia';



-- Tabla Inscripcion_Reto: relación usuario-reto.
CREATE TABLE Inscripcion_Reto (
  Ret_ID INT NOT NULL COMMENT 'Reto al que se inscribe el usuario',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario participante',
  PRIMARY KEY (Ret_ID, Usu_Correo),
  FOREIGN KEY (Ret_ID) REFERENCES Reto(Ret_Men_ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Inscripciones de usuarios a retos';

-- Tabla Publicacion: publicaciones de los usuarios.
CREATE TABLE Publicacion (
  Pub_ID INT AUTO_INCREMENT PRIMARY KEY,
  Pub_Likes INT DEFAULT 0 COMMENT 'Número de me gusta',
  Pub_ImagenRuta VARCHAR(255) COMMENT 'Imagen asociada a la publicación',
  Pub_Privacidad VARCHAR(50) COMMENT 'Nivel de privacidad',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario que publica',
  Rut_ID INT COMMENT 'Ruta asociada',
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Rut_ID) REFERENCES Ruta(Rut_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Publicaciones de los usuarios';



-- Tabla Cycling: entrenamientos de tipo ciclismo.
CREATE TABLE Cycling (
  Cyc_LongitudPedaleo DOUBLE COMMENT 'Longitud de pedaleo promedio',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario asociado',
  Ent_ID INT PRIMARY KEY COMMENT 'Identificador del entrenamiento',
  Tipo VARCHAR(50) COMMENT 'Tipo de entrenamiento (PR o Normal)',
  FOREIGN KEY (Ent_ID) REFERENCES Entrenamiento(Ent_ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Entrenamientos de ciclismo';



-- Tabla Running: entrenamientos de tipo running.
CREATE TABLE Running (
  Run_LongitudPaso DOUBLE COMMENT 'Longitud de paso promedio',
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario asociado',
  Ent_ID INT PRIMARY KEY COMMENT 'Identificador del entrenamiento',
  Tipo VARCHAR(50) COMMENT 'Tipo de entrenamiento (PR o Normal)',
  FOREIGN KEY (Ent_ID) REFERENCES Entrenamiento(Ent_ID)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Entrenamientos de running';



-- Tabla Entrenamientos_Usuario: relación entre usuarios y entrenamientos.
CREATE TABLE Entrenamientos_Usuario (
  Usu_Correo VARCHAR(255) NOT NULL COMMENT 'Usuario',
  Ent_ID INT NOT NULL COMMENT 'Entrenamiento',
  PRIMARY KEY (Usu_Correo, Ent_ID),
  FOREIGN KEY (Usu_Correo) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Ent_ID) REFERENCES Entrenamiento(Ent_ID)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Relación usuario-entrenamiento';


-- Tabla Seguidos: relaciones de seguimiento entre usuarios.
CREATE TABLE Seguidos (
  Usu_Correo1 VARCHAR(255) NOT NULL COMMENT 'Usuario que sigue',
  Usu_Correo2 VARCHAR(255) NOT NULL COMMENT 'Usuario seguido',
  PRIMARY KEY (Usu_Correo1, Usu_Correo2),
  FOREIGN KEY (Usu_Correo1) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (Usu_Correo2) REFERENCES Usuario(Usu_Correo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Usuarios que se siguen entre sí';


