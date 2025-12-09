const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Werkzeuge_2357',
    database: 'Ghost_Running',
    multipleStatements: true,
  });

  const queries = [
    `INSERT INTO UserGR (user_Email,user_Username,user_Password,user_Names,user_LastNames,user_Age,user_RegistrationDate)
     VALUES ('admin@runner.com','admin','$2b$10$RtAyaa4hJU0lUxC6VXIf9.xaC.9fSM9Kz43CzjRTrJYJOLD591E7C','Admin','Runner',35,NOW())
     ON DUPLICATE KEY UPDATE user_Email=user_Email;`,
    `DROP USER IF EXISTS 'admin_ghost'@'%'`,
    `CREATE USER 'admin_ghost'@'%' IDENTIFIED BY 'Admin123'`,
    `GRANT ALL PRIVILEGES ON Ghost_Running.* TO 'admin_ghost'@'%'`,
    `DROP USER IF EXISTS 'ghost_public'@'%'`,
    `CREATE USER 'ghost_public'@'%' IDENTIFIED BY 'Public123'`,
    `GRANT SELECT ON Ghost_Running.vw_top_routes TO 'ghost_public'@'%'`,
    `GRANT SELECT ON Ghost_Running.vw_active_challenges TO 'ghost_public'@'%'`,
    `GRANT SELECT ON Ghost_Running.vw_global_stats TO 'ghost_public'@'%'`,
    `FLUSH PRIVILEGES;`
  ];

  for (const q of queries) {
    await conn.query(q);
  }
  console.log('✅ Admin app user and DB users created');
  await conn.end();
}

main().catch((err) => {
  console.error('Error running admin user setup', err);
  process.exit(1);
});
