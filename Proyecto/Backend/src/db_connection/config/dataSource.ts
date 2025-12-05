import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import path from 'path';

import { User } from "../entity/User";
import { PhysicalState } from "../entity/PhysicalState";
import { WeeklyGoal } from "../entity/WeeklyGoal";
import { Route } from "../entity/Route";
import { Coordinate } from "../entity/Coordinate";
import { MonthlyChallenge } from "../entity/MonthlyChallenge";
import { Training } from "../entity/Training";
import { Kilometer } from "../entity/Kilometer";
import { Publication } from "../entity/Publication";
import { Comment } from "../entity/Comment";

// Cargar .env desde raíz del proyecto (cuatro niveles arriba de src/db_connection/config/)
dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

export const appDataSource = new DataSource({
	type: "postgres",
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	username: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	// Registrar todas las entidades para que TypeORM las conozca
	entities: [
		User,
		PhysicalState,
		WeeklyGoal,
		Route,
		Coordinate,
		MonthlyChallenge,
		Training,
		Kilometer,
		Publication,
		Comment
	],
	// No sincronizar automáticamente el esquema
	synchronize: false,
	// Registro de consultas
	logging: false
});