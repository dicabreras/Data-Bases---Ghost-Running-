import "reflect-metadata";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import * as path from "path";
import { getFirstUser, registerUser, loginUser, upload } from "./db_connection/controller/UserController";
import { verifyGoogleToken, exchangeCodeForToken } from './db_connection/controller/AuthController';
import { saveTraining, getUserTrainings, calculateTraining, replaceGhost, deleteTraining } from "./db_connection/controller/TrainingController";
import Database from "./db_connection/db/Database";

// Modulo para obtener la ip local
import getLocalIP from "./db_connection/config/getLocalIp";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const localIP = getLocalIP();

Database.initialize()
	.then(() => {
		console.log("✅ Conexión a la Base de Datos establecida con éxito (singleton).");

		// Middlewares
		app.use(cors());
		// Increase JSON and URL-encoded body size limits to allow image uploads (base64)
		// Default is ~100kb; snapshots/base64 images may exceed that.
		app.use(express.json({ limit: '10mb' }));
		app.use(express.urlencoded({ limit: '10mb', extended: true }));

		// Serve static images
		app.use('/images', express.static(path.join(__dirname, '../../Database/db_images')));

		// Aqui definimos los endpoints
		app.get("/api/hello-user", getFirstUser);

		app.post("/api/login", loginUser);
		app.post("/api/register", upload.single('profilePhoto'), registerUser);

		// Google freaking OAuth endpoints
		app.post('/api/auth/google', express.json(), verifyGoogleToken);
		app.post('/api/auth/google/code', express.json(), exchangeCodeForToken);
		app.get('/api/auth/google/callback', exchangeCodeForToken);

		// Endpoints de training
		app.post("/api/trainings/calculate", calculateTraining);
		app.post("/api/trainings", saveTraining);
		app.post("/api/trainings/replace-ghost", replaceGhost);
		app.get("/api/trainings/:userEmail", getUserTrainings);
		app.delete('/api/trainings/:counter', deleteTraining);

		app.listen(PORT, () => {
			console.log(`🚀 Servidor Express corriendo en el puerto ${PORT}`);
			console.log(`Endpoint de prueba: http://${localIP}:${PORT}/api/hello-user`);
			console.log(`Endpoint de registro: http://${localIP}:${PORT}/api/register`);
		});
	})
	.catch((error) => console.error("❌ Error al conectar la base de datos:", error));