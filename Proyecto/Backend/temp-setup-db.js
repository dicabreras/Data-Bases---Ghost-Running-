const mysql = require("mysql2/promise");
(async () => {
  const c = await mysql.createConnection({ host: "localhost", user: "root", password: "Werkzeuge_2357", database: "Ghost_Running" });
  
  try {
    // Add follower and following count columns if they don't exist
    console.log("Checking and adding follower/following count columns...");
    await c.query("ALTER TABLE UserGR ADD COLUMN user_FollowersCount INT DEFAULT 0");
    console.log(" Added user_FollowersCount column");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log(" user_FollowersCount column already exists");
    } else {
      throw err;
    }
  }
  
  try {
    await c.query("ALTER TABLE UserGR ADD COLUMN user_FollowingCount INT DEFAULT 0");
    console.log(" Added user_FollowingCount column");
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log(" user_FollowingCount column already exists");
    } else {
      throw err;
    }
  }
  
  // Now load and execute the Transacciones.sql file
  const fs = require("fs");
  const path = require("path");
  const transPath = path.join(__dirname, "../../Database/db_schema/Transacciones.sql");
  const transSQL = fs.readFileSync(transPath, "utf8");
  
  const queries = transSQL.split(";\n").filter(q => q.trim());
  console.log("\nLoading stored procedures from Transacciones.sql...");
  for (const query of queries) {
    if (query.trim()) {
      try {
        await c.query(query);
      } catch (err) {
        if (!err.message.includes("already exists")) {
          console.error("Error executing query:", err.message.substring(0, 100));
        }
      }
    }
  }
  
  console.log("\n Database setup complete!");
  await c.end();
})();
