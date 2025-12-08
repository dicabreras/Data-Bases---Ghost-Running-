const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function fixPasswordColumn() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_ADMIN_USER || process.env.DB_USER || 'root',
      password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Ghost_Running'
    });

    console.log('✅ Conectado a la BD');
    
    const sql = `ALTER TABLE UserGR MODIFY user_Password CHAR(60) NOT NULL COMMENT 'Contraseña hasheada con bcrypt (60 caracteres)'`;
    console.log('🔧 Ejecutando:', sql);
    
    await connection.execute(sql);
    console.log('✅ Columna user_Password modificada exitosamente a CHAR(60)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixPasswordColumn();
