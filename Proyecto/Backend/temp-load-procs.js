const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357", database: "Ghost_Running" });
  
  try {
    console.log("Loading Transacciones.sql...");
    const transPath = path.join(__dirname, "../Database/db_schema/Transacciones.sql");
    const transSQL = fs.readFileSync(transPath, "utf8");
    
    const queries = transSQL.split(";\n").filter(q => q.trim());
    for (const query of queries) {
      if (query.trim()) {
        try {
          await c.query(query);
        } catch (err) {
          console.error(" Query error:", err.message.substring(0, 150));
        }
      }
    }
    
    console.log("\n Stored procedures loaded successfully!");
  } finally {
    await c.end();
  }
})();
