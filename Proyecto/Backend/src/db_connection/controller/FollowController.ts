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

		// Map entity property names to frontend expected field names
		const mappedUsers = users.map(u => ({
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

		// Insert into Followed table (trigger will prevent self-follow)
		await appDataSource.query(
			'INSERT INTO Followed (user_EmailFollower, user_EmailFollowed) VALUES (?, ?)',
			[followerEmail, followedEmail]
		);

		return res.json({ success: true, message: 'User followed successfully' });
	} catch (error: any) {
		console.error('Error following user:', error);
		// Check for duplicate entry or trigger error
		if (error.code === 'ER_DUP_ENTRY') {
			return res.status(400).json({ error: 'Already following this user' });
		}
		if (error.sqlMessage && error.sqlMessage.includes('no puede seguirse')) {
			return res.status(400).json({ error: 'Cannot follow yourself' });
		}
		return res.status(500).json({ error: 'Failed to follow user' });
	}
}

/**
 * Unfollow a user.
 * DELETE /api/users/follow
 * Body: { followerEmail: string, followedEmail: string }
 */
export async function unfollowUser(req: Request, res: Response) {
	try {
		const { followerEmail, followedEmail } = req.body;
		if (!followerEmail || !followedEmail) {
			return res.status(400).json({ error: 'followerEmail and followedEmail are required' });
		}

		await appDataSource.query(
			'DELETE FROM Followed WHERE user_EmailFollower = ? AND user_EmailFollowed = ?',
			[followerEmail, followedEmail]
		);

		return res.json({ success: true, message: 'User unfollowed successfully' });
	} catch (error) {
		console.error('Error unfollowing user:', error);
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

		// Get followers (users who follow this user)
		const followers = await appDataSource.query(
			`SELECT u.user_Email, u.user_Username, u.user_Names, u.user_LastNames, u.user_ProfilePhoto
			 FROM Followed f
			 JOIN UserGR u ON f.user_EmailFollower = u.user_Email
			 WHERE f.user_EmailFollowed = ?`,
			[email]
		);

		// Get following (users this user follows)
		const following = await appDataSource.query(
			`SELECT u.user_Email, u.user_Username, u.user_Names, u.user_LastNames, u.user_ProfilePhoto
			 FROM Followed f
			 JOIN UserGR u ON f.user_EmailFollowed = u.user_Email
			 WHERE f.user_EmailFollower = ?`,
			[email]
		);

		return res.json({
			followers,
			following,
			followerCount: followers.length,
			followingCount: following.length
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
