const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357", database: "Ghost_Running" });
  const [rows] = await c.query("SELECT user_Email, user_Username, user_Names, user_LastNames, user_Age FROM UserGR ORDER BY user_Email");
  console.log(`Total usuarios: ${rows.length}`);
  console.table(rows);
  await c.end();
})();
