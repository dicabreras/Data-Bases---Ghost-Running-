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

		// Ejecutar otros scripts auxiliares en orden: Procedimientos, Usuarios, Triggers, Transacciones, Vistas, Indices
		const extraFiles = [
			'vistas.sql',
			'Indices.sql',
			'Triggers.sql',
			'Procedimientos.sql',
			'Usuarios.sql',
			'Transacciones.sql'
		];

		for (const f of extraFiles) {
			const p = path.join(__dirname, 'db_schema', f);
			try {
				const content = readFileSync(p, 'utf8');
				if (content && content.trim().length > 0) {
					console.log(`Ejecutando script: ${f}`);
					await adminConn.query(content);
					console.log(`Script ejecutado: ${f}`);
				} else {
					console.log(`Script vacío o no encontrado: ${f}`);
				}
			} catch (err) {
				if (err instanceof Error) {
					console.warn(`No se pudo ejecutar ${f}:`, err.message);
				} else {
					console.warn(`No se pudo ejecutar ${f}:`, String(err));
				}
			}
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error al crear la base de datos o las tablas:', error.message);
		} else {
			console.error('Error al crear la base de datos o las tablas:', String(error));
		}
	} finally {
		await adminConn.end();
	}
};

createDatabase();