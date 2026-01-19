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

// GET: récupérer tous les utilisateurs avec leurs rôles
export async function GET(_req: NextRequest) {
  const pool = new sql.ConnectionPool(config);
  await pool.connect();

  try {
    const usersResult = await pool.request().query(`
      SELECT id, first_name, last_name, email FROM app_user
    `);

    const rolesResult = await pool.request().query(`
      SELECT id, name FROM roles
    `);

    const userRolesResult = await pool.request().query(`
      SELECT user_id, role_id FROM user_roles
    `);

    const usersWithRoles = (usersResult.recordset || []).map(user => {
      const roleIds = (userRolesResult.recordset || [])
        .filter(ur => ur.user_id === user.id)
        .map(ur => ur.role_id);

      const roleNames = roleIds
        .map(rid => rolesResult.recordset.find(r => r.id === rid)?.name)
        .filter(Boolean) as string[];

      return {
        ...user,
        roles: roleNames,
      };
    });

    return NextResponse.json(usersWithRoles);
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json([], { status: 500 });
  } finally {
    pool.close();
  }
}

// DELETE: supprimer un utilisateur
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('id');
  if (!userId) return NextResponse.json({ message: 'User ID required' }, { status: 400 });

  const pool = new sql.ConnectionPool(config);
  await pool.connect();

  try {
    // Supprimer d'abord les relations rôles
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM user_roles WHERE user_id = @userId');

    // Puis supprimer l'utilisateur
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query('DELETE FROM app_user WHERE id = @userId');

    return NextResponse.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user failed:', err);
    return NextResponse.json({ message: 'Delete failed' }, { status: 500 });
  } finally {
    pool.close();
  }
}
