const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357" });
  const [rows] = await c.query("SELECT COUNT(*) AS n FROM mysql.user WHERE User NOT IN ('root','mysql.infoschema','mysql.session','mysql.sys')");
  console.log(rows);
  const [all] = await c.query("SELECT User, Host FROM mysql.user");
  console.table(all);
  await c.end();
})();
