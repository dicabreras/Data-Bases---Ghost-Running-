const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357" });
  const [rows] = await c.query("SELECT User, Host FROM mysql.user WHERE User NOT IN ('root','mysql.infoschema','mysql.session','mysql.sys') ORDER BY User, Host");
  console.table(rows);
  await c.end();
})();
