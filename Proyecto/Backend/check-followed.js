const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function checkFollowed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Ghost_Running'
  });

  try {
    console.log('📊 Checking Followed table...\n');

    // Show all relationships
    const [relationships] = await connection.execute(`
      SELECT 
        f.user_EmailFollower as follower,
        f.user_EmailFollowed as followed,
        u1.user_Names as follower_name,
        u2.user_Names as followed_name
      FROM Followed f
      LEFT JOIN UserGR u1 ON f.user_EmailFollower = u1.user_Email
      LEFT JOIN UserGR u2 ON f.user_EmailFollowed = u2.user_Email
    `);

    console.log('Existing relationships:');
    if (relationships.length === 0) {
      console.log('  ❌ No relationships found in Followed table!');
    } else {
      relationships.forEach(rel => {
        console.log(`  ${rel.follower_name} (${rel.follower}) → follows → ${rel.followed_name} (${rel.followed})`);
      });
    }

    // Show user counts
    console.log('\n📊 User counters:');
    const [users] = await connection.execute(`
      SELECT user_Email, user_Names, user_FollowersCount, user_FollowingCount
      FROM UserGR
      WHERE user_FollowersCount > 0 OR user_FollowingCount > 0
    `);

    if (users.length === 0) {
      console.log('  ❌ No users with followers/following!');
    } else {
      users.forEach(u => {
        console.log(`  ${u.user_Names} (${u.user_Email}): ${u.user_FollowersCount} followers, ${u.user_FollowingCount} following`);
      });
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

checkFollowed();
