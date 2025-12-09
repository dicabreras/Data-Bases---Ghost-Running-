const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function testUnfollow() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Ghost_Running'
  });

  try {
    console.log('🧪 Testing unfollow procedure...\n');

    const follower = 'diegoGo@runner.com';
    const followed = 'angel@runner.com';

    console.log(`Testing: ${follower} unfollows ${followed}\n`);

    // Check before
    const [before] = await connection.execute(
      'SELECT * FROM Followed WHERE user_EmailFollower = ? AND user_EmailFollowed = ?',
      [follower, followed]
    );
    console.log('Before unfollow:', before.length > 0 ? 'Relationship EXISTS' : 'Relationship DOES NOT EXIST');

    if (before.length > 0) {
      // Try to unfollow
      console.log('\nCalling sp_user_unfollow...');
      try {
        await connection.query('CALL sp_user_unfollow(?, ?)', [follower, followed]);
        console.log('✅ Unfollow successful');
      } catch (err) {
        console.error('❌ Unfollow failed:', err.message);
      }

      // Check after
      const [after] = await connection.execute(
        'SELECT * FROM Followed WHERE user_EmailFollower = ? AND user_EmailFollowed = ?',
        [follower, followed]
      );
      console.log('\nAfter unfollow:', after.length > 0 ? 'Relationship STILL EXISTS' : 'Relationship REMOVED');

      // Re-add for testing
      console.log('\nRe-adding relationship for future tests...');
      await connection.query('CALL sp_user_follow(?, ?)', [follower, followed]);
      console.log('✅ Relationship re-added');
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

testUnfollow();
