const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running'
  });

  console.log('=== Testing Training Data ===');
  
  const [rows] = await conn.query(
    `SELECT t.tra_Counter, t.user_Email, t.tra_Duration, t.tra_AvgSpeed, r.rou_Distance
     FROM Training t
     JOIN Route r ON t.rou_Id = r.rou_Id
     WHERE t.user_Email = ?`,
    ['angel@runner.com']
  );
  console.log('Direct SQL for angel:', rows);

  const [coords] = await conn.query(
    `SELECT rc.rou_Id, COUNT(*) as coord_count
     FROM Route_has_Coordinate rc
     JOIN Training t ON rc.rou_Id = t.rou_Id
     WHERE t.user_Email = ?
     GROUP BY rc.rou_Id`,
    ['angel@runner.com']
  );
  console.log('Coordinates per route:', coords);

  const [adminView] = await conn.query('SELECT * FROM vw_admin_user_summary WHERE user_email = ?', ['angel@runner.com']);
  console.log('Admin view for Angel:', adminView);

  const [trainingPerf] = await conn.query('SELECT * FROM vw_admin_training_performance WHERE user_email = ?', ['angel@runner.com']);
  console.log('Training performance:', trainingPerf);

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
