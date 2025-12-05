-- PostgreSQL-compatible DDL converted from MySQL
-- NOTE: This file assumes you are already connected to the target database.
-- Modified to preserve existing data: CREATE TABLE IF NOT EXISTS instead of DROP TABLE

-- Tabla UserGR
CREATE TABLE IF NOT EXISTS "UserGR" (
  "email" VARCHAR(100) NOT NULL,
  "username" VARCHAR(45) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "names" VARCHAR(45) NOT NULL,
  "lastNames" VARCHAR(45) NOT NULL,
  "age" INT NOT NULL,
  "profilePhoto" VARCHAR(255),
  "description" TEXT,
  "registrationDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "gender" VARCHAR(45),
  PRIMARY KEY ("email")
);

-- Tabla PhysicalState
CREATE TABLE IF NOT EXISTS "PhysicalState" (
  "userEmail" VARCHAR(100) NOT NULL,
  "date" TIMESTAMP NOT NULL,
  "height" DECIMAL(3,2) NOT NULL,
  "weight" DECIMAL(5,2) NOT NULL,
  PRIMARY KEY ("userEmail", "date")
);

ALTER TABLE "PhysicalState" DROP CONSTRAINT IF EXISTS fk_physicalstate_usergr;
ALTER TABLE "PhysicalState" ADD CONSTRAINT fk_physicalstate_usergr FOREIGN KEY ("userEmail") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla WeeklyGoal
CREATE TABLE IF NOT EXISTS "WeeklyGoal" (
  "userEmail" VARCHAR(100) NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "trainingQuantity" INT NOT NULL,
  "distance" DECIMAL(5,2) NOT NULL,
  "completed" SMALLINT NOT NULL,
  PRIMARY KEY ("userEmail", "startDate")
);

ALTER TABLE "WeeklyGoal" DROP CONSTRAINT IF EXISTS fk_weeklygoal_usergr;
ALTER TABLE "WeeklyGoal" ADD CONSTRAINT fk_weeklygoal_usergr FOREIGN KEY ("userEmail") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Route
CREATE TABLE IF NOT EXISTS "Route" (
  "id" SERIAL PRIMARY KEY,
  "distance" DECIMAL(5,2) NOT NULL
);

-- Tabla Coordinate
CREATE TABLE IF NOT EXISTS "Coordinate" (
  "id" SERIAL PRIMARY KEY,
  "latitude" REAL NOT NULL,
  "longitude" REAL NOT NULL,
  "altitude" REAL NOT NULL
);

-- Tabla MonthlyChallenge
CREATE TABLE IF NOT EXISTS "MonthlyChallenge" (
  "id" SERIAL PRIMARY KEY,
  "distance" DECIMAL(5,2) NOT NULL,
  "startDate" DATE NOT NULL,
  "endDate" DATE NOT NULL
);

-- Tabla User_has_MonthlyChallenge
CREATE TABLE IF NOT EXISTS "User_has_MonthlyChallenge" (
  "monId" INT NOT NULL,
  "userEmail" VARCHAR(100) NOT NULL,
  PRIMARY KEY ("monId", "userEmail")
);

ALTER TABLE "User_has_MonthlyChallenge" DROP CONSTRAINT IF EXISTS fk_user_monthlychallenge_monthly;
ALTER TABLE "User_has_MonthlyChallenge" DROP CONSTRAINT IF EXISTS fk_user_monthlychallenge_usergr;
ALTER TABLE "User_has_MonthlyChallenge" ADD CONSTRAINT fk_user_monthlychallenge_monthly FOREIGN KEY ("monId") REFERENCES "MonthlyChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User_has_MonthlyChallenge" ADD CONSTRAINT fk_user_monthlychallenge_usergr FOREIGN KEY ("userEmail") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Route_has_Coordinate
CREATE TABLE IF NOT EXISTS "Route_has_Coordinate" (
  "routeId" INT NOT NULL,
  "coordinateId" INT NOT NULL,
  PRIMARY KEY ("routeId", "coordinateId")
);

ALTER TABLE "Route_has_Coordinate" DROP CONSTRAINT IF EXISTS fk_route_has_coordinate_route;
ALTER TABLE "Route_has_Coordinate" DROP CONSTRAINT IF EXISTS fk_route_has_coordinate_coordinate;
ALTER TABLE "Route_has_Coordinate" ADD CONSTRAINT fk_route_has_coordinate_route FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Route_has_Coordinate" ADD CONSTRAINT fk_route_has_coordinate_coordinate FOREIGN KEY ("coordinateId") REFERENCES "Coordinate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Training
CREATE TABLE IF NOT EXISTS "Training" (
  "counter" SERIAL PRIMARY KEY,
  "userEmail" VARCHAR(100) NOT NULL,
  "routeId" INT NOT NULL,
  "datetime" TIMESTAMP NOT NULL,
  "duration" TIME NOT NULL,
  "name" VARCHAR(100),
  "rithm" DECIMAL(4,2) NOT NULL,
  "maxSpeed" DECIMAL(5,2) NOT NULL,
  "avgSpeed" DECIMAL(5,2) NOT NULL,
  "calories" DECIMAL(6,2) NOT NULL,
  "elevationGain" DECIMAL(5,2) NOT NULL,
  "image" TEXT,
  "trainingType" VARCHAR(10) NOT NULL CHECK ("trainingType" IN ('Running','Cycling')),
  "isGhost" SMALLINT NOT NULL,
  "avgStride" DECIMAL(5,2),
  UNIQUE ("userEmail", "routeId", "counter")
);

ALTER TABLE "Training" DROP CONSTRAINT IF EXISTS fk_training_usergr;
ALTER TABLE "Training" DROP CONSTRAINT IF EXISTS fk_training_route;
ALTER TABLE "Training" ADD CONSTRAINT fk_training_usergr FOREIGN KEY ("userEmail") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Training" ADD CONSTRAINT fk_training_route FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Kilometer
CREATE TABLE IF NOT EXISTS "Kilometer" (
  "counter" SERIAL,
  "time" TIME NOT NULL,
  "routeId" INT NOT NULL,
  "trainingCounter" INT NOT NULL,
  "userEmail" VARCHAR(100) NOT NULL,
  PRIMARY KEY ("counter", "routeId", "trainingCounter", "userEmail")
);

ALTER TABLE "Kilometer" DROP CONSTRAINT IF EXISTS fk_kilometer_route;
ALTER TABLE "Kilometer" DROP CONSTRAINT IF EXISTS fk_kilometer_training;
ALTER TABLE "Kilometer" ADD CONSTRAINT fk_kilometer_route FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Kilometer" ADD CONSTRAINT fk_kilometer_training FOREIGN KEY ("userEmail", "routeId", "trainingCounter") REFERENCES "Training"("userEmail", "routeId", "counter") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Publication
CREATE TABLE IF NOT EXISTS "Publication" (
  "counter" SERIAL,
  "likes" INT NOT NULL,
  "routeImage" VARCHAR(255),
  "privacy" INT NOT NULL,
  "datetime" TIMESTAMP NOT NULL,
  "userEmail" VARCHAR(100) NOT NULL,
  "trainingCounter" INT NOT NULL,
  "routeId" INT NOT NULL,
  PRIMARY KEY ("counter", "userEmail", "trainingCounter", "routeId")
);

ALTER TABLE "Publication" DROP CONSTRAINT IF EXISTS fk_publication_training;
ALTER TABLE "Publication" ADD CONSTRAINT fk_publication_training FOREIGN KEY ("userEmail", "routeId", "trainingCounter") REFERENCES "Training"("userEmail", "routeId", "counter") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Followed
CREATE TABLE IF NOT EXISTS "Followed" (
  "emailFollower" VARCHAR(100) NOT NULL,
  "emailFollowed" VARCHAR(100) NOT NULL,
  PRIMARY KEY ("emailFollower", "emailFollowed")
);

ALTER TABLE "Followed" DROP CONSTRAINT IF EXISTS fk_followed_follower;
ALTER TABLE "Followed" DROP CONSTRAINT IF EXISTS fk_followed_followed;
ALTER TABLE "Followed" ADD CONSTRAINT fk_followed_follower FOREIGN KEY ("emailFollower") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Followed" ADD CONSTRAINT fk_followed_followed FOREIGN KEY ("emailFollowed") REFERENCES "UserGR"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tabla Comments (Comentarios de publicaciones)
CREATE TABLE IF NOT EXISTS "Comments" (
  "publicationCounter" INT NOT NULL,
  "userEmail" VARCHAR(100) NOT NULL,
  "trainingCounter" INT NOT NULL,
  "routeId" INT NOT NULL,
  "counter" SERIAL,
  "text" TEXT NOT NULL,
  "likes" INT NOT NULL DEFAULT 0,
  "datetime" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("counter", "publicationCounter", "userEmail", "trainingCounter", "routeId")
);

ALTER TABLE "Comments" DROP CONSTRAINT IF EXISTS fk_comments_publication;
ALTER TABLE "Comments" ADD CONSTRAINT fk_comments_publication FOREIGN KEY ("publicationCounter", "userEmail", "trainingCounter", "routeId") 
  REFERENCES "Publication"("counter", "userEmail", "trainingCounter", "routeId") 
  ON DELETE CASCADE ON UPDATE CASCADE;


