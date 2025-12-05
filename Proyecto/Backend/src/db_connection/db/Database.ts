import "reflect-metadata";
import { DataSource } from "typeorm";
import { appDataSource } from "../config/dataSource";

class Database {
	private static instance: DataSource | null = null;

	private constructor() {
		// Prevent direct instantiation; Database is a singleton
		void 0;
	}

	static getInstance(): DataSource {
		if (!Database.instance) {
			Database.instance = appDataSource;
		}
		return Database.instance;
	}

	static async initialize(): Promise<DataSource> {
		const ds = Database.getInstance();
		if (!ds.isInitialized) {
			await ds.initialize();
		}
		return ds;
	}
	static async close(): Promise<void> {
		const ds = Database.getInstance();

		if (ds && ds.isInitialized) {
			await ds.destroy();
			Database.instance = null;
		}
	}
}

export default Database;
