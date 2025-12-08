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
        conn = await mysql.createConnection({ host: HOST, port: PORT, user: ADMIN_USER, password: ADMIN_PASS, database: DB_NAME });

        // Call the stored procedure only. No JS fallback  if the PA fails, log and return null.
        try {
            const procName = role === 'admin' ? 'sp_create_db_admin_app' : 'sp_create_db_user_app';
            // Cannot use ? placeholders with stored procs that use PREPARE internally; escape manually
            const escapedUsername = conn.escape(appUsername);
            const escapedPassword = conn.escape(password);
            const callSql = `CALL ${procName}(${escapedUsername}, ${escapedPassword})`;
            const [rows] = await conn.query(callSql);
            let createdUsername: string | undefined;
            if (Array.isArray(rows) && rows.length > 0) {
                const first = rows[0] as Record<string, unknown>;
                if (Array.isArray(first) && first.length > 0) {
                    const firstItem = first[0] as Record<string, unknown>;
                    if (firstItem && typeof firstItem.created_db_username === 'string') {
                        createdUsername = firstItem.created_db_username;
                    }
                } else if (typeof first.created_db_username === 'string') {
                    createdUsername = first.created_db_username;
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

/**
 * Actualiza el perfil de un usuario llamando al procedimiento almacenado sp_user_update_profile.
 * Este procedimiento actualiza nombres, apellidos, descripción, foto de perfil y edad.
 */
export async function updateUserProfileViaStoredProc(
    userEmail: string,
    names: string,
    lastnames: string,
    description: string,
    profilePhoto: string,
    age: number
) {
    if (!ADMIN_USER || !ADMIN_PASS) {
        console.warn('DB admin credentials not provided; skipping profile update');
        return { success: false, error: 'Database credentials not configured' };
    }
    let conn;
    try {
        conn = await mysql.createConnection({ 
            host: HOST, 
            port: PORT, 
            user: ADMIN_USER, 
            password: ADMIN_PASS, 
            database: DB_NAME 
        });

        const callSql = `CALL sp_user_update_profile(?, ?, ?, ?, ?, ?)`;
        await conn.query(callSql, [userEmail, names, lastnames, description, profilePhoto, age]);
        
        return { success: true };
    } catch (err) {
        console.error('Error calling sp_user_update_profile:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    } finally {
        if (conn) await conn.end();
    }
}
