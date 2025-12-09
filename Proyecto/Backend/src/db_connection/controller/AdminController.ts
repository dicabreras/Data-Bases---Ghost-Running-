import { Request, Response } from 'express';
import { appDataSource } from '../config/dataSource';

// Simple helper to run a view and catch errors
async function fetchView(viewSql: string) {
  return appDataSource.query(viewSql);
}

export async function getAdminStats(req: Request, res: Response) {
  try {
    const [
      topRoutes,
      activeChallenges,
      globalStats,
      userSummary,
      trainingPerformance,
      publicationsActivity,
      monthlyChallengeParticipation,
      userPhysicalState,
      activityBySportAndAge,
      mostUsedRoutes,
      trainingActivityByMonth
    ] = await Promise.all([
      fetchView('SELECT * FROM vw_top_routes'),
      fetchView('SELECT * FROM vw_active_challenges'),
      fetchView('SELECT * FROM vw_global_stats'),
      fetchView('SELECT * FROM vw_admin_user_summary'),
      fetchView('SELECT * FROM vw_admin_training_performance'),
      fetchView('SELECT * FROM vw_admin_publications_activity'),
      fetchView('SELECT * FROM vw_admin_monthly_challenge_participation'),
      fetchView('SELECT * FROM vw_admin_user_physical_state'),
      fetchView('SELECT * FROM vw_admin_activity_by_sport_and_age'),
      fetchView('SELECT * FROM vw_admin_most_used_routes'),
      fetchView('SELECT * FROM vw_admin_training_activity_by_month')
    ]);

    return res.json({
      topRoutes,
      activeChallenges,
      globalStats: globalStats?.[0] ?? null,
      userSummary,
      trainingPerformance,
      publicationsActivity,
      monthlyChallengeParticipation,
      userPhysicalState,
      activityBySportAndAge,
      mostUsedRoutes,
      trainingActivityByMonth
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
}
