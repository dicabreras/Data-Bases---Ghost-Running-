import { Request, Response } from "express";
import { appDataSource } from "../config/dataSource";

/**
 * Devuelve el feed del usuario: publicaciones propias y de seguidos.
 * Incluye datos del usuario, entrenamiento y ruta asociados.
 */
export const getUserFeed = async (req: Request, res: Response) => {
  try {
    const { userEmail } = req.params;
    if (!userEmail) {
      return res.status(400).json({ error: "userEmail is required" });
    }

    const sql = `
      SELECT 
        p.pub_Counter       AS publicationId,
        p.user_Email        AS authorEmail,
        u.user_Username     AS authorUsername,
        CONCAT(u.user_Names, ' ', u.user_LastNames) AS authorName,
        u.user_ProfilePhoto AS authorPhoto,
        p.pub_RouteImage    AS routeImage,
        p.pub_Privacity     AS privacy,
        p.pub_Datetime      AS datetime,
        p.tra_Counter       AS trainingCounter,
        p.rou_Id            AS routeId,
        r.rou_Distance      AS routeDistance,
        t.tra_Duration      AS duration,
        t.tra_AvgSpeed      AS avgSpeed,
        t.tra_MaxSpeed      AS maxSpeed,
        t.tra_Rithm         AS rithm,
        t.tra_Calories      AS calories,
        t.tra_ElevationGain AS elevationGain,
        t.tra_TrainingType  AS trainingType,
        t.tra_IsGhost       AS isGhost
      FROM Publication p
      JOIN UserGR   u ON u.user_Email = p.user_Email
      JOIN Training t ON t.tra_Counter = p.tra_Counter AND t.user_Email = p.user_Email
      JOIN Route    r ON r.rou_Id = p.rou_Id
      WHERE p.user_Email = ?
         OR p.user_Email IN (
            SELECT f.user_EmailFollowed
            FROM Followed f
            WHERE f.user_EmailFollower = ?
         )
      ORDER BY p.pub_Datetime DESC
      LIMIT 100;
    `;

    const feed = await appDataSource.query(sql, [userEmail, userEmail]);

    return res.status(200).json({ feed });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ error: "Error fetching feed" });
  }
};
