const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');

async function executeProcedures() {
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
    
    const procPath = path.resolve(__dirname, '../Database/db_schema/Procedimientos.sql');
    
    if (!fs.existsSync(procPath)) {
      console.error(' Archivo no encontrado:', procPath);
      process.exit(1);
    }
    
    let procSQL = fs.readFileSync(procPath, 'utf8');
    
    // Dividir por DELIMITER y ejecutar cada bloque
    const blocks = procSQL.split('DELIMITER //');
    
    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      // Encontrar el end //
      const endIdx = block.lastIndexOf('DELIMITER');
      const sqlCode = endIdx > -1 ? block.substring(0, endIdx) : block;
      
      // Normalizar comillas
      const normalizedSQL = sqlCode.replace(/\/\/$/gm, ';').trim();
      
      if (normalizedSQL.length > 10) {
        try {
          console.log(' Ejecutando bloque', i, '...');
          await connection.query(normalizedSQL);
          console.log(' Bloque', i, 'ejecutado');
        } catch (e) {
          console.error(' Bloque', i, 'error:', e.message.substring(0, 100));
        }
      }
    }
    
    console.log(' Procedimientos procesados');
    
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

executeProcedures();
