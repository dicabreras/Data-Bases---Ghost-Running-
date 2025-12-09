const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function repairFollowCounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Ghost_Running'
  });

  try {
    console.log('🔧 Repairing follow counts...');

    // Update follower counts
    await connection.execute(`
      UPDATE UserGR u
      SET user_FollowersCount = (
        SELECT COUNT(*) FROM Followed f
        WHERE f.user_EmailFollowed = u.user_Email
      )
    `);
    console.log('✅ Follower counts updated');

    // Update following counts
    await connection.execute(`
      UPDATE UserGR u
      SET user_FollowingCount = (
        SELECT COUNT(*) FROM Followed f
        WHERE f.user_EmailFollower = u.user_Email
      )
    `);
    console.log('✅ Following counts updated');

    // Show results
    const [results] = await connection.execute(`
      SELECT user_Email, user_Names, user_FollowersCount, user_FollowingCount
      FROM UserGR
      WHERE user_FollowersCount > 0 OR user_FollowingCount > 0
      ORDER BY user_FollowersCount DESC
      LIMIT 10
    `);

    console.log('\n📊 Top users by followers:');
    results.forEach(row => {
      console.log(`  ${row.user_Names} (${row.user_Email}): ${row.user_FollowersCount} followers, ${row.user_FollowingCount} following`);
    });

    console.log('\n✅ Repair complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

repairFollowCounts();
