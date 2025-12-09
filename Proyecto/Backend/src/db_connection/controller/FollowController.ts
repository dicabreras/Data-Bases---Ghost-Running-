import { Request, Response } from 'express';
import { appDataSource } from '../config/dataSource';
import { User } from '../entity/User';
import { Like } from 'typeorm';

/**
 * Search users by username, names, or lastnames.
 * GET /api/users/search?q=searchTerm
 */
export async function searchUsers(req: Request, res: Response) {
	try {
		const { q } = req.query;
		if (!q || typeof q !== 'string') {
			return res.status(400).json({ error: 'Query parameter "q" is required' });
		}

		const userRepo = appDataSource.getRepository(User);

		// Search by username, names, or lastnames (case-insensitive)
		const users = await userRepo.find({
			where: [
				{ username: Like(`%${q}%`) },
				{ names: Like(`%${q}%`) },
				{ lastNames: Like(`%${q}%`) }
			],
			select: ['email', 'username', 'names', 'lastNames', 'profilePhoto'],
			take: 20
		});

		// Exclude admin user from search results
		const filteredUsers = users.filter(u => u.email !== 'admin@runner.com');

		// Map entity property names to frontend expected field names
		const mappedUsers = filteredUsers.map(u => ({
			user_Email: u.email,
			user_Username: u.username,
			user_Names: u.names,
			user_LastNames: u.lastNames,
			user_ProfilePhoto: u.profilePhoto
		}));

		return res.json({ users: mappedUsers });
	} catch (error) {
		console.error('Error searching users:', error);
		return res.status(500).json({ error: 'Failed to search users' });
	}
}

/**
 * Follow a user.
 * POST /api/users/follow
 * Body: { followerEmail: string, followedEmail: string }
 */
export async function followUser(req: Request, res: Response) {
	try {
		const { followerEmail, followedEmail } = req.body;
		if (!followerEmail || !followedEmail) {
			return res.status(400).json({ error: 'followerEmail and followedEmail are required' });
		}

		// Call stored procedure with transaction
		await appDataSource.query(
			'CALL sp_user_follow(?, ?)',
			[followerEmail, followedEmail]
		);

		return res.json({ success: true, message: 'User followed successfully' });
	} catch (error: any) {
		console.error('Error following user:', error);
		// Check for duplicate entry or trigger error
		if (error.code === 'ER_DUP_ENTRY') {
			return res.status(400).json({ error: 'Already following this user' });
		}
		if (error.sqlMessage && error.sqlMessage.includes('cannot follow yourself')) {
			return res.status(400).json({ error: 'Cannot follow yourself' });
		}
		if (error.sqlMessage && error.sqlMessage.includes('does not exist')) {
			return res.status(400).json({ error: 'User does not exist' });
		}
		return res.status(500).json({ error: 'Failed to follow user' });
	}
}

/**
 * Unfollow a user.
 * POST /api/users/unfollow
 * Body: { followerEmail: string, followedEmail: string }
 */
export async function unfollowUser(req: Request, res: Response) {
	try {
		const { followerEmail, followedEmail } = req.body;
		if (!followerEmail || !followedEmail) {
			return res.status(400).json({ error: 'followerEmail and followedEmail are required' });
		}

		// Call stored procedure with transaction
		await appDataSource.query(
			'CALL sp_user_unfollow(?, ?)',
			[followerEmail, followedEmail]
		);

		return res.json({ success: true, message: 'User unfollowed successfully' });
	} catch (error: any) {
		console.error('Error unfollowing user:', error);
		if (error.sqlMessage && error.sqlMessage.includes('does not exist')) {
			return res.status(400).json({ error: 'Follow relationship does not exist' });
		}
		return res.status(500).json({ error: 'Failed to unfollow user' });
	}
}

/**
 * Get followers and following for a user.
 * GET /api/users/:email/follow-stats
 */
export async function getFollowStats(req: Request, res: Response) {
	try {
		const { email } = req.params;

		// Get user with follower/following counts
		const userRepo = appDataSource.getRepository(User);
		const user = await userRepo.findOne({ 
			where: { email },
			select: ['email', 'username', 'names', 'lastNames', 'profilePhoto', 'followersCount', 'followingCount']
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Get followers (users who follow this user)
		const followers = await appDataSource.query(
			`SELECT u.user_Email, u.user_Username, u.user_Names, u.user_LastNames, u.user_ProfilePhoto
			 FROM Followed f
			 JOIN UserGR u ON f.user_EmailFollower = u.user_Email
			 WHERE f.user_EmailFollowed COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci`,
			[email]
		);

		// Get following (users this user follows)
		const following = await appDataSource.query(
			`SELECT u.user_Email, u.user_Username, u.user_Names, u.user_LastNames, u.user_ProfilePhoto
			 FROM Followed f
			 JOIN UserGR u ON f.user_EmailFollowed = u.user_Email
			 WHERE f.user_EmailFollower COLLATE utf8mb4_unicode_ci = ? COLLATE utf8mb4_unicode_ci`,
		[email]
	);

	// Calculate counts in real-time from database
	const actualFollowerCount = followers.length;
	const actualFollowingCount = following.length;

		return res.json({
			followers,
			following,
			followerCount: actualFollowerCount,
			followingCount: actualFollowingCount
		});
	} catch (error) {
		console.error('Error getting follow stats:', error);
		return res.status(500).json({ error: 'Failed to get follow stats' });
	}
}

/**
 * Check if user A follows user B.
 * GET /api/users/is-following?follower=A&followed=B
 */
export async function isFollowing(req: Request, res: Response) {
	try {
		const { follower, followed } = req.query;
		if (!follower || !followed) {
			return res.status(400).json({ error: 'follower and followed query params are required' });
		}

		const result = await appDataSource.query(
			'SELECT 1 FROM Followed WHERE user_EmailFollower = ? AND user_EmailFollowed = ? LIMIT 1',
			[follower, followed]
		);

		return res.json({ isFollowing: result.length > 0 });
	} catch (error) {
		console.error('Error checking follow status:', error);
		return res.status(500).json({ error: 'Failed to check follow status' });
	}
}

/**
 * Remove a follower (current user removes someone who follows them).
 * POST /api/users/remove-follower
 * Body: { currentUserEmail: string, followerEmailToRemove: string }
 */
export async function removeFollower(req: Request, res: Response) {
	try {
		const { currentUserEmail, followerEmailToRemove } = req.body;
		if (!currentUserEmail || !followerEmailToRemove) {
			return res.status(400).json({ error: 'currentUserEmail and followerEmailToRemove are required' });
		}

		// Call unfollow stored procedure (follower is the one being removed, currentUser is the followed)
		await appDataSource.query(
			'CALL sp_user_unfollow(?, ?)',
			[followerEmailToRemove, currentUserEmail]
		);

		return res.json({ success: true, message: 'Follower removed successfully' });
	} catch (error: any) {
		console.error('Error removing follower:', error);
		if (error.sqlMessage && error.sqlMessage.includes('does not exist')) {
			return res.status(400).json({ error: 'Follower relationship does not exist' });
		}
		return res.status(500).json({ error: 'Failed to remove follower' });
	}
}

/**
 * Repair/sync follower and following counts based on Followed table.
 * POST /api/users/repair-follow-counts
 */
export async function repairFollowCounts(req: Request, res: Response) {
	try {
		// Update follower counts for all users
		await appDataSource.query(`
			UPDATE UserGR u
			SET user_FollowersCount = (
				SELECT COUNT(*) FROM Followed f
				WHERE f.user_EmailFollowed = u.user_Email
			)
		`);

		// Update following counts for all users
		await appDataSource.query(`
			UPDATE UserGR u
			SET user_FollowingCount = (
				SELECT COUNT(*) FROM Followed f
				WHERE f.user_EmailFollower = u.user_Email
			)
		`);

		return res.json({ success: true, message: 'Follow counts repaired successfully' });
	} catch (error) {
		console.error('Error repairing follow counts:', error);
		return res.status(500).json({ error: 'Failed to repair follow counts' });
	}
}
