import { Request, Response } from "express";
import { appDataSource } from "../config/dataSource";

/**
 * Publica un entrenamiento creando una entrada en la tabla Publication
 */
export const publishTraining = async (req: Request, res: Response) => {
  try {
    const { userEmail, trainingCounter } = req.body;

    if (!userEmail || !trainingCounter) {
      return res.status(400).json({ error: "userEmail and trainingCounter are required" });
    }

    // Verificar que el entrenamiento existe y pertenece al usuario
    const [training] = await appDataSource.query(
      `SELECT tra_Counter, user_Email, rou_Id, tra_Datetime 
       FROM Training 
       WHERE tra_Counter = ? AND user_Email = ?`,
      [trainingCounter, userEmail]
    );

    if (!training) {
      return res.status(404).json({ error: "Training not found" });
    }

    // Verificar si ya está publicado
    const [existingPublication] = await appDataSource.query(
      `SELECT pub_Counter 
       FROM Publication 
       WHERE tra_Counter = ? AND user_Email = ?`,
      [trainingCounter, userEmail]
    );

    if (existingPublication) {
      return res.status(400).json({ error: "Training already published" });
    }

    // Crear la publicación
    await appDataSource.query(
      `INSERT INTO Publication (user_Email, tra_Counter, rou_Id, pub_Privacity, pub_Datetime, pub_RouteImage, pub_Likes)
       VALUES (?, ?, ?, 0, ?, NULL, 0)`,
      [userEmail, trainingCounter, training.rou_Id, training.tra_Datetime]
    );

    return res.status(201).json({ 
      message: "Training published successfully",
      published: true 
    });
  } catch (error) {
    console.error("Error publishing training:", error);
    return res.status(500).json({ error: "Error publishing training" });
  }
};

/**
 * Verifica si un entrenamiento está publicado
 */
export const isTrainingPublished = async (req: Request, res: Response) => {
  try {
    const { userEmail, trainingCounter } = req.params;

    if (!userEmail || !trainingCounter) {
      return res.status(400).json({ error: "userEmail and trainingCounter are required" });
    }

    const [publication] = await appDataSource.query(
      `SELECT pub_Counter 
       FROM Publication 
       WHERE tra_Counter = ? AND user_Email = ?`,
      [trainingCounter, userEmail]
    );

    return res.status(200).json({ 
      isPublished: !!publication,
      publicationId: publication?.pub_Counter || null
    });
  } catch (error) {
    console.error("Error checking publication status:", error);
    return res.status(500).json({ error: "Error checking publication status" });
  }
};

/**
 * Despublica un entrenamiento (elimina la entrada de Publication)
 */
export const unpublishTraining = async (req: Request, res: Response) => {
  try {
    const { userEmail, trainingCounter } = req.body;

    if (!userEmail || !trainingCounter) {
      return res.status(400).json({ error: "userEmail and trainingCounter are required" });
    }

    // Eliminar la publicación
    const result = await appDataSource.query(
      `DELETE FROM Publication 
       WHERE tra_Counter = ? AND user_Email = ?`,
      [trainingCounter, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Publication not found" });
    }

    return res.status(200).json({ 
      message: "Training unpublished successfully",
      published: false 
    });
  } catch (error) {
    console.error("Error unpublishing training:", error);
    return res.status(500).json({ error: "Error unpublishing training" });
  }
};
