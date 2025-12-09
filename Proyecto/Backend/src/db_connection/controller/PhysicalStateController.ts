import { Request, Response } from "express";
import { appDataSource } from "../config/dataSource";
import { PhysicalState } from "../entity/PhysicalState";

const physicalStateRepository = appDataSource.getRepository(PhysicalState);

/**
 * Obtiene el estado físico actual del usuario (el más reciente)
 */
export const getCurrentPhysicalState = async (req: Request, res: Response) => {
	try {
		const { userEmail } = req.params;

		if (!userEmail) {
			return res.status(400).json({ error: "userEmail is required" });
		}

		// Obtener el estado físico más reciente
		const physicalState = await appDataSource.query(
			`SELECT user_Email, phy_Date, phy_Height, phy_Weight
			 FROM PhysicalState
			 WHERE user_Email = ?
			 ORDER BY phy_Date DESC
			 LIMIT 1`,
			[userEmail]
		);

		if (!physicalState || physicalState.length === 0) {
			return res.status(200).json({ 
				hasPhysicalState: false,
				physicalState: null 
			});
		}

		const ps = physicalState[0];
		return res.status(200).json({
			hasPhysicalState: true,
			physicalState: {
				userEmail: ps.user_Email,
				date: ps.phy_Date,
				height: parseFloat(ps.phy_Height),
				weight: parseFloat(ps.phy_Weight)
			}
		});
	} catch (error) {
		console.error("Error getting current physical state:", error);
		return res.status(500).json({ error: "Error getting physical state" });
	}
};

/**
 * Obtiene el historial de estados físicos del usuario
 */
export const getPhysicalStateHistory = async (req: Request, res: Response) => {
	try {
		const { userEmail } = req.params;

		if (!userEmail) {
			return res.status(400).json({ error: "userEmail is required" });
		}

		const physicalStates = await appDataSource.query(
			`SELECT user_Email, phy_Date, phy_Height, phy_Weight
			 FROM PhysicalState
			 WHERE user_Email = ?
			 ORDER BY phy_Date DESC`,
			[userEmail]
		);

		return res.status(200).json({
			history: physicalStates.map((ps: any) => ({
				userEmail: ps.user_Email,
				date: ps.phy_Date,
				height: parseFloat(ps.phy_Height),
				weight: parseFloat(ps.phy_Weight)
			}))
		});
	} catch (error) {
		console.error("Error getting physical state history:", error);
		return res.status(500).json({ error: "Error getting physical state history" });
	}
};

/**
 * Crea o actualiza el estado físico del usuario utilizando transacción
 * Si ya existe un registro para la misma fecha, lo actualiza
 * Si no existe, lo crea
 */
export const createOrUpdatePhysicalState = async (req: Request, res: Response) => {
	const queryRunner = appDataSource.createQueryRunner();

	try {
		const { userEmail, date, height, weight } = req.body;

		if (!userEmail || !date || height === undefined || weight === undefined) {
			return res.status(400).json({ 
				error: "userEmail, date, height, and weight are required" 
			});
		}

		// Validar que height y weight sean números válidos
		const heightNum = parseFloat(height);
		const weightNum = parseFloat(weight);

		if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
			return res.status(400).json({ 
				error: "height and weight must be positive numbers" 
			});
		}

		// Conectar al query runner para la transacción
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			// Verificar si existe un registro para esta fecha
			const existing = await queryRunner.query(
				`SELECT user_Email FROM PhysicalState 
				 WHERE user_Email = ? AND DATE(phy_Date) = DATE(?)`,
				[userEmail, new Date(date)]
			);

			let result;

			if (existing && existing.length > 0) {
				// Actualizar el registro existente
				await queryRunner.query(
					`UPDATE PhysicalState 
					 SET phy_Height = ?, phy_Weight = ?
					 WHERE user_Email = ? AND DATE(phy_Date) = DATE(?)`,
					[heightNum, weightNum, userEmail, new Date(date)]
				);

				result = "updated";
			} else {
				// Crear un nuevo registro
				await queryRunner.query(
					`INSERT INTO PhysicalState (user_Email, phy_Date, phy_Height, phy_Weight)
					 VALUES (?, ?, ?, ?)`,
					[userEmail, new Date(date), heightNum, weightNum]
				);

				result = "created";
			}

			// Confirmar la transacción
			await queryRunner.commitTransaction();

			return res.status(result === "created" ? 201 : 200).json({
				message: result === "created" 
					? "Physical state created successfully" 
					: "Physical state updated successfully",
				action: result,
				physicalState: {
					userEmail,
					date: new Date(date),
					height: heightNum,
					weight: weightNum
				}
			});

		} catch (transactionError) {
			// Revertir la transacción en caso de error
			await queryRunner.rollbackTransaction();
			throw transactionError;
		}

	} catch (error) {
		console.error("Error creating/updating physical state:", error);
		return res.status(500).json({ 
			error: "Error creating or updating physical state",
			details: (error as any).message 
		});
	} finally {
		// Liberar el query runner
		await queryRunner.release();
	}
};

/**
 * Elimina un registro de estado físico
 */
export const deletePhysicalState = async (req: Request, res: Response) => {
	try {
		const { userEmail, date } = req.body;

		if (!userEmail || !date) {
			return res.status(400).json({ 
				error: "userEmail and date are required" 
			});
		}

		const result = await appDataSource.query(
			`DELETE FROM PhysicalState 
			 WHERE user_Email = ? AND DATE(phy_Date) = DATE(?)`,
			[userEmail, new Date(date)]
		);

		if ((result as any).affectedRows === 0) {
			return res.status(404).json({ error: "Physical state not found" });
		}

		return res.status(200).json({ 
			message: "Physical state deleted successfully" 
		});
	} catch (error) {
		console.error("Error deleting physical state:", error);
		return res.status(500).json({ error: "Error deleting physical state" });
	}
};
