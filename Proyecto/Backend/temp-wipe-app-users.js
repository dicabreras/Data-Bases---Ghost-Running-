const mysql = require("mysql2/promise");

const tables = [
  "Comment",
  "Coordinate",
  "Kilometer",
  "MonthlyChallenge",
  "PhysicalState",
  "Publication",
  "Route",
  "Training",
  "WeeklyGoal",
  "UserGR"
];

(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357", database: "Ghost_Running" });
  await c.query("SET FOREIGN_KEY_CHECKS=0");
  for (const t of tables) {
    try {
      console.log(`Truncating ${t}...`);
      await c.query(`TRUNCATE TABLE \`${t}\``);
    } catch (err) {
      console.error(`Error truncating ${t}:`, err.message);
    }
  }
  await c.query("SET FOREIGN_KEY_CHECKS=1");
  await c.end();
  console.log("Listo. Datos de aplicación borrados.");
})();
