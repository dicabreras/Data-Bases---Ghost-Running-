import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

// Cargar .env desde raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const createDatabase = async () => {
	const dbName = process.env.DB_NAME as string;
	const host = process.env.DB_HOST;
	const port = Number(process.env.DB_PORT) || 3306;
	const user = process.env.DB_USER;
	const password = process.env.DB_PASSWORD;

	// Conexión administrativa (sin base de datos especificada)
	const adminConn = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
	try {
		// Primero verificar si la base de datos ya existe. Si existe, no ejecutar init.sql.
		const [schemaRows] = await adminConn.query<RowDataPacket[]>(
			'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
			[dbName]
		);
		const dbExists = Array.isArray(schemaRows) && schemaRows.length > 0;
		if (dbExists) {
			console.log(`La base de datos ${dbName} ya existe — no se ejecutará init.sql.`);
			await adminConn.end();
			return;
		}

		// Si no existe, crear la base y ejecutar init.sql
		await adminConn.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
		console.log(`(SCHEMA) Base de datos ${dbName} creada`);

		// Cargar `init.sql`
		const initPath = path.join(__dirname, './db_schema/init.sql');
		let sqlScriptContent: string;
		try {
			sqlScriptContent = readFileSync(initPath, 'utf8');
		} catch {
			throw new Error('No se encontró el script SQL `db_schema/init.sql`. Por favor crea o restaura ese archivo.');
		}

		// Ejecutar el script en la base creada
		await adminConn.changeUser({ database: dbName });
		await adminConn.query(sqlScriptContent);
		console.log('Tablas creadas correctamente');
	} catch (error) {
		console.error('Error al crear la base de datos o las tablas:', error);
	} finally {
		await adminConn.end();
	}
};

createDatabase();