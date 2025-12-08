const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

async function listUsers() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_ADMIN_USER || process.env.DB_USER || 'root',
      password: process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'Ghost_Running'
    });

    const [users] = await connection.execute('SELECT user_Email, user_Username FROM UserGR ORDER BY user_RegistrationDate DESC LIMIT 5');
    console.log('🔍 Últimos 5 usuarios:');
    console.table(users);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

listUsers();
