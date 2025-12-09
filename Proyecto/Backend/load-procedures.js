const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function loadStoredProcedures() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Ghost_Running',
    multipleStatements: true
  });

  try {
    console.log('📦 Loading stored procedures...\n');

    // Read the Transacciones.sql file
    const sqlPath = path.join(__dirname, '../Database/db_schema/Transacciones.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by delimiter and execute each statement
    const statements = sqlContent.split('--').filter(s => s.trim().length > 0);

    console.log(`Found ${statements.length} sections in Transacciones.sql\n`);

    // Execute the entire file
    await connection.query(sqlContent);
    
    console.log('✅ Stored procedures loaded successfully\n');

    // Verify procedures exist
    const [procedures] = await connection.execute(`
      SHOW PROCEDURE STATUS WHERE Db = DATABASE()
    `);

    console.log('📋 Available procedures:');
    procedures.forEach(proc => {
      console.log(`  ✓ ${proc.Name}`);
    });

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('SQL Error:', error.sqlMessage);
    await connection.end();
    process.exit(1);
  }
}

loadStoredProcedures();
