const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running'
  });

  console.log('=== Verificando vistas admin ===\n');

  const [global] = await conn.query('SELECT * FROM vw_global_stats;');
  console.log('vw_global_stats:', JSON.stringify(global, null, 2));

  const [userSummary] = await conn.query('SELECT * FROM vw_admin_user_summary WHERE user_email IN (?, ?);', ['angel@runner.com', 'diegoGo@runner.com']);
  console.log('\nvw_admin_user_summary:', JSON.stringify(userSummary, null, 2));

  const [trainingPerf] = await conn.query('SELECT * FROM vw_admin_training_performance;');
  console.log('\nvw_admin_training_performance:', JSON.stringify(trainingPerf, null, 2));

  const [topRoutes] = await conn.query('SELECT * FROM vw_top_routes;');
  console.log('\nvw_top_routes:', JSON.stringify(topRoutes, null, 2));

  const [mostUsedRoutes] = await conn.query('SELECT * FROM vw_admin_most_used_routes;');
  console.log('\nvw_admin_most_used_routes:', JSON.stringify(mostUsedRoutes, null, 2));

  await conn.end();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
