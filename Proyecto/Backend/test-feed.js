const mysql = require('mysql2/promise');

async function testFeed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running'
  });

  try {
    console.log('🔍 Probando feed para Diego...\n');
    
    const userEmail = 'diegoGo@runner.com';
    const sql = `
      SELECT 
        p.pub_Counter       AS publicationId,
        p.user_Email        AS authorEmail,
        u.user_Username     AS authorUsername,
        CONCAT(u.user_Names, ' ', u.user_LastNames) AS authorName,
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
      WHERE p.user_Email <> 'admin@runner.com'
        AND (
          p.user_Email = ?
          OR p.user_Email IN (
            SELECT f.user_EmailFollowed
            FROM Followed f
            WHERE f.user_EmailFollower = ?
          )
        )
      ORDER BY p.pub_Datetime DESC
      LIMIT 100;
    `;

    const [feed] = await connection.query(sql, [userEmail, userEmail]);

    console.log(`📊 Feed items encontrados: ${feed.length}`);
    console.log('\n📋 Detalles del feed:');
    feed.forEach(item => {
      console.log(`  - ${item.authorUsername} (${item.authorEmail}): Entrenamiento #${item.trainingCounter}, ${item.routeDistance}km`);
    });

    console.log('\n✅ Feed completo:');
    console.log(JSON.stringify(feed, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await connection.end();
  }
}

testFeed();
