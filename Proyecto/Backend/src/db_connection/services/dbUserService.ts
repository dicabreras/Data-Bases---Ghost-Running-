import mysql from 'mysql2/promise';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../../.env') });

const ADMIN_USER = process.env.DB_ADMIN_USER || process.env.DB_USER;
const ADMIN_PASS = process.env.DB_ADMIN_PASSWORD || process.env.DB_PASSWORD;
const HOST = process.env.DB_HOST || '127.0.0.1';
const PORT = Number(process.env.DB_PORT) || 3306;
const DB_NAME = process.env.DB_NAME || '';

function makeSafePassword(len = 12) {
    return crypto.randomBytes(len).toString('base64').replace(/\+/g, '.').replace(/\//g, '-').replace(/=+$/, '');
}

function usernameFromEmail(email: string) {
    const hash = crypto.createHash('sha256').update(email).digest('hex');
    return `app_${hash.slice(0, 12)}`;
}

/**
 * Intenta crear un DB user llamando al procedimiento almacenado `sp_create_db_user`.
 * Si el PA no existe o falla, hace un fallback a CREATE USER + GRANT manual.
 */
export async function createDbUserViaStoredProc(appUsername: string, role: 'admin' | 'user', password: string) {
    if (!ADMIN_USER || !ADMIN_PASS) {
        console.warn('DB admin credentials not provided; skipping DB user creation');
        return null;
    }
    let conn;
    try {
        conn = await mysql.createConnection({ host: HOST, port: PORT, user: ADMIN_USER, password: ADMIN_PASS });

        // Call the stored procedure only. No JS fallback — if the PA fails, log and return null.
        try {
            const procName = role === 'admin' ? 'sp_create_db_admin_app' : 'sp_create_db_user_app';
            const callSql = `CALL ${procName}(?, ?)`;
            const [rows] = await conn.query(callSql, [appUsername, password]);
            let createdUsername: string | undefined;
            if (Array.isArray(rows) && rows.length > 0) {
                const first = rows[0];
                if (Array.isArray(first) && first.length > 0 && first[0].created_db_username) {
                    createdUsername = first[0].created_db_username as string;
                } else if (first.created_db_username) {
                    createdUsername = (first.created_db_username as string);
                }
            }
            return createdUsername ? { dbUsername: createdUsername, dbPassword: password } : null;
        } catch (procErr) {
            console.error('Stored procedure call failed; not attempting JS fallback:', procErr);
            return null;
        }
    } catch (err) {
        console.error('Failed to create DB user via stored proc or fallback:', err);
        return null;
    } finally {
        if (conn) await conn.end();
    }
}
