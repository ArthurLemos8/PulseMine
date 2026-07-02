
import mysql from 'mysql2/promise'; 
import 'dotenv/config';

export const conexaoBancoDados = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'pulseminer'
});