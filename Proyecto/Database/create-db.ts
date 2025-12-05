import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

// Cargar .env desde raíz del proyecto (dos niveles arriba: Proyecto/Database -> ingesoft-i)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const createDatabase = async () => {
	const dbName = process.env.DB_NAME as string;

	const adminClient = new Client({
		user: process.env.DB_USER,
		host: process.env.DB_HOST,
		password: process.env.DB_PASSWORD,
		port: Number(process.env.DB_PORT)
	});

	try {
		await adminClient.connect();

		// Verificar si la base de datos existe
		const checkResult = await adminClient.query(
			`SELECT 1 FROM pg_database WHERE datname = $1`,
			[dbName]
		);

		if (checkResult.rows.length === 0) {
			// Crear base de datos si no existe
			await adminClient.query(`CREATE DATABASE "${dbName}"`);
			console.log(`Base de datos ${dbName} creada exitosamente`);
		} else {
			console.log(`Base de datos ${dbName} ya existe`);
		}

		await adminClient.end();


		const dbClient = new Client({
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			password: process.env.DB_PASSWORD,
			port: Number(process.env.DB_PORT),
			database: dbName
		});
		await dbClient.connect();

		// init.sql está en db_schema/ dentro de Database/
		const sqlScriptPath = path.join(__dirname, './db_schema/init.sql');
		const sqlScriptContent = readFileSync(sqlScriptPath, 'utf8');

		await dbClient.query(sqlScriptContent);
		console.log('Tablas creadas/existentes aplicadas correctamente');

		await dbClient.end();
	} catch (error) {
		console.error('Error al crear la base de datos o las tablas:', error);

	}
};

createDatabase();