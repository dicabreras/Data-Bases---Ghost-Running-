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

// Cargar .env desde la raíz del repositorio
const envPath = path.resolve(__dirname, '../../../../.env');
console.log('🔍 Buscando .env en:', envPath);
const envConfig = dotenv.config({ path: envPath });
if (envConfig.error) {
	console.warn('⚠️ Error cargando .env:', envConfig.error.message);
} else {
	console.log('✅ .env cargado correctamente');
}
console.log('📋 DB_HOST:', process.env.DB_HOST);
console.log('📋 DB_USER:', process.env.DB_USER);
console.log('📋 DB_NAME:', process.env.DB_NAME);

export const appDataSource = new DataSource({
	// Cambiado a MySQL para la migración. Asegúrate de tener instalado `mysql2`.
	type: "mysql",
	host: process.env.DB_HOST || 'localhost',
	port: Number(process.env.DB_PORT) || 3306,
	username: process.env.DB_USER || 'root',
	password: process.env.DB_PASSWORD || '',
	database: process.env.DB_NAME || 'Ghost_Running',
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