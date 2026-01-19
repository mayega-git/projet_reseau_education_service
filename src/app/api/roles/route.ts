/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

const config = {
  user: 'SA',
  password: 'Rootp@ss123!',
  server: 'localhost', // ou 'sqlserver' si Next.js est dans un conteneur
  database: 'userdb2',
  options: { encrypt: true, trustServerCertificate: true },
};

export async function GET(_req: NextRequest) {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();

  try {
    const result = await pool.request().query('SELECT id, name FROM roles');
    return NextResponse.json(result.recordset);
  } catch (err) {
    console.error('Error fetching roles:', err);
    return NextResponse.json({ message: 'Error fetching roles' }, { status: 500 });
  } finally {
    pool.close(); // libère la connexion
  }
}
