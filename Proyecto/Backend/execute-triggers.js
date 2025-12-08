const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');

async function executeTriggers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_ADMIN_USER || process.env.DB_USER || 'root',
      password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Ghost_Running'
    });

    console.log(' Conectado a la BD');
    
    const trigPath = path.resolve(__dirname, '../Database/db_schema/Triggers.sql');
    
    if (!fs.existsSync(trigPath)) {
      console.error(' Archivo no encontrado:', trigPath);
      process.exit(1);
    }
    
    let trigSQL = fs.readFileSync(trigPath, 'utf8');
    const blocks = trigSQL.split('DELIMITER //');
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const endIdx = block.lastIndexOf('DELIMITER');
      const sqlCode = endIdx > -1 ? block.substring(0, endIdx) : block;
      const normalizedSQL = sqlCode.replace(/\/\/$/gm, ';').trim();
      
      if (normalizedSQL.length > 10) {
        try {
          console.log(' Ejecutando trigger', i, '...');
          await connection.query(normalizedSQL);
          console.log(' Trigger', i, 'ejecutado');
        } catch (e) {
          console.error(' Trigger', i, 'error:', e.message.substring(0, 100));
        }
      }
    }
    
    console.log(' Triggers procesados');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

executeTriggers();
