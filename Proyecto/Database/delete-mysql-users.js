/**
 * Script para eliminar usuarios de MySQL creados por la app Ghost Running
 * Basándose en los emails de los usuarios de la app (tabla UserGR)
 * 
 * Uso:
 * node delete-mysql-users.js <email1> <email2> ...
 * 
 * Ejemplos:
 * node delete-mysql-users.js angelgo@runner.com
 * node delete-mysql-users.js angelgo@runner.com diegogo@runner.com
 * node delete-mysql-users.js --all  (elimina todos los usuarios app_* y admin_*)
 */

const mysql = require('mysql2/promise');
const crypto = require('crypto');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_ADMIN_USER || process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME || 'Ghost_Running';

// Función para generar el nombre de usuario de MySQL desde el email
function getMySQLUsername(email) {
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    return `app_${hash.slice(0, 12)}`;
}

async function deleteUsersByEmail(emails) {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD,
            database: DB_NAME
        });

        console.log('✅ Conectado a la base de datos\n');

        for (const email of emails) {
            const mysqlUsername = getMySQLUsername(email);
            
            try {
                // Verificar si el usuario existe
                const [users] = await conn.query(
                    "SELECT User, Host FROM mysql.user WHERE User = ?",
                    [mysqlUsername]
                );

                if (users.length === 0) {
                    console.log(`⚠️  Usuario MySQL '${mysqlUsername}' (email: ${email}) no existe`);
                    continue;
                }

                // Eliminar el usuario
                await conn.query(`DROP USER IF EXISTS '${mysqlUsername}'@'%'`);
                console.log(`✅ Usuario MySQL '${mysqlUsername}' eliminado (email: ${email})`);

            } catch (err) {
                console.error(`❌ Error eliminando usuario '${mysqlUsername}' (email: ${email}):`, err.message);
            }
        }

        await conn.query('FLUSH PRIVILEGES');
        console.log('\n✅ Privilegios actualizados');

    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

async function deleteAllAppUsers() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD
        });

        console.log('✅ Conectado a MySQL\n');
        console.log('⚠️  ELIMINANDO TODOS LOS USUARIOS app_* y admin_*\n');

        // Obtener todos los usuarios que empiezan con app_ o admin_
        const [users] = await conn.query(
            "SELECT User, Host FROM mysql.user WHERE User LIKE 'app_%' OR User LIKE 'admin_%'"
        );

        if (users.length === 0) {
            console.log('ℹ️  No se encontraron usuarios app_* o admin_*');
            return;
        }

        console.log(`📋 Usuarios encontrados: ${users.length}\n`);

        for (const user of users) {
            try {
                await conn.query(`DROP USER IF EXISTS '${user.User}'@'${user.Host}'`);
                console.log(`✅ Eliminado: ${user.User}@${user.Host}`);
            } catch (err) {
                console.error(`❌ Error eliminando ${user.User}@${user.Host}:`, err.message);
            }
        }

        await conn.query('FLUSH PRIVILEGES');
        console.log('\n✅ Privilegios actualizados');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

async function listAppUsers() {
    let conn;
    try {
        conn = await mysql.createConnection({
            host: DB_HOST,
            port: DB_PORT,
            user: DB_USER,
            password: DB_PASSWORD
        });

        const [users] = await conn.query(
            "SELECT User, Host FROM mysql.user WHERE User LIKE 'app_%' OR User LIKE 'admin_%'"
        );

        if (users.length === 0) {
            console.log('ℹ️  No hay usuarios app_* o admin_* en la base de datos');
            return;
        }

        console.log(`\n📋 Usuarios de la app encontrados (${users.length}):\n`);
        users.forEach(u => {
            console.log(`   ${u.User}@${u.Host}`);
        });
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (conn) await conn.end();
    }
}

// Main
(async () => {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
📖 Uso:
   node delete-mysql-users.js <email1> <email2> ...
   node delete-mysql-users.js --all
   node delete-mysql-users.js --list

📌 Ejemplos:
   node delete-mysql-users.js angelgo@runner.com
   node delete-mysql-users.js angelgo@runner.com diegogo@runner.com
   node delete-mysql-users.js --all     # Elimina TODOS los usuarios app_* y admin_*
   node delete-mysql-users.js --list    # Lista usuarios de la app sin eliminar
        `);
        process.exit(0);
    }

    if (args[0] === '--all') {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question('⚠️  ¿Estás seguro de eliminar TODOS los usuarios app_* y admin_*? (si/no): ', async (answer) => {
            readline.close();
            if (answer.toLowerCase() === 'si' || answer.toLowerCase() === 's') {
                await deleteAllAppUsers();
            } else {
                console.log('❌ Operación cancelada');
            }
        });
    } else if (args[0] === '--list') {
        await listAppUsers();
    } else {
        await deleteUsersByEmail(args);
    }
})();
