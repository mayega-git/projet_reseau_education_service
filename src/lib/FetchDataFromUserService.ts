import { GlobalNotifier } from '@/components/ui/GlobalNotifier';
import { EducationServiceRoutes, UserServiceRoutes } from './api';
import { GetUser } from '@/types/User';
import { BlogInterface } from '@/types/blog';
import { PodcastInterface } from '@/types/podcast';

// function to fetch user data by id
export const fetchUserData = async (authorId: string) => {
  try {
    const response = await fetch(`${UserServiceRoutes.base}/${authorId}`, {
      method: 'GET',
    });

    const data = await response.json();
    if (!response.ok) throw new Error('Failed to User');
    return data.data;
  } catch (err) {
    console.error('An error occurred while fetching', err);
  } finally {
  }
};

// function to fetch all user data by user id from a an array of users
export const fetchAllUsers = async (
  data: PodcastInterface[] | BlogInterface[]
): Promise<{ [key: string]: GetUser }> => {
  const usersMap: { [key: string]: GetUser } = {};

  // Exécution parallèle pour chaque row
  await Promise.all(
    data.reverse().map(async (row) => {
      try {
        const authorData = await fetchUserData(row.authorId);

        usersMap[row.id] = {
          id: authorData?.id || 'unknown',
          firstName: authorData?.firstName || 'Unknown',
          lastName: authorData?.lastName || '',
          email: authorData?.email || '',
          roles: authorData?.role
            ? Array.isArray(authorData.role)
              ? authorData.role
              : [authorData.role] // transforme en tableau si c'est une string
            : [],
          token: null,
        };
      } catch (err) {
        console.error(`Failed to fetch user for blog/podcast id=${row.id}`, err);
        // Fournit des valeurs par défaut en cas d'erreur
        usersMap[row.id] = {
          id: 'unknown',
          firstName: 'Unknown',
          lastName: '',
          email: '',
          roles: [],
          token: null,
        };
      }
    })
  );

  return usersMap;
};




export const handleFollowUser = async (
  userId: string,
  postAuthorId: string,
  postAuthorName: string
) => {
  if (!userId || !postAuthorId) {
    GlobalNotifier('User or author information is missing.', 'error');
    return;
  }

  const url = new URL(UserServiceRoutes.follow);
  url.searchParams.set('followerId', userId);
  url.searchParams.set('followingId', postAuthorId);

  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to follow user.');
    }

    GlobalNotifier(`You started following ${postAuthorName}`, 'success');
    window.location.reload();
  } catch (err) {
    console.error('Error following user:', err);
    GlobalNotifier(
      'An error occurred while trying to follow the user.',
      'error'
    );
  }
};

export const handleUnfollowUser = async (
  userId: string,
  postAuthorId: string,
  postAuthorName: string
) => {
  if (!userId || !postAuthorId) {
    GlobalNotifier('User or author information is missing.', 'error');
    return;
  }

  const url = new URL(UserServiceRoutes.unfollow);
  url.searchParams.set('followerId', userId);
  url.searchParams.set('followingId', postAuthorId);

  try {
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to follow user.');
    }

    GlobalNotifier(`You unfollowed ${postAuthorName}`, 'success');
  } catch (err) {
    console.error('Error unfollowing user:', err);
    GlobalNotifier(
      'An error occurred while trying to follow the user.',
      'error'
    );
  }
};

export const handleIsFollowing = async (
  userId: string,
  postAuthorId: string
) => {
  if (!userId || !postAuthorId) {
    GlobalNotifier('User or author information is missing.', 'error');
    return;
  }

  const url = new URL(UserServiceRoutes.isFollowing);
  url.searchParams.set('followerId', userId);
  url.searchParams.set('followingId', postAuthorId);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occured.');
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Error unfollowing user:', err);
    GlobalNotifier(
      'An error occurred while trying to follow the user.',
      'error'
    );
  }
};

export const getAllFollowersOfUser = async (userId: string) => {
  if (!userId) {
    GlobalNotifier('User or author information is missing.', 'error');
    return;
  }

  const url = new URL(UserServiceRoutes.allFollowers);
  url.searchParams.set('userId', userId);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occured.');
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Error unfollowing user:', err);
    GlobalNotifier(
      'An error occurred while trying to follow the user.',
      'error'
    );
  }
};

export const getAllUsersAUserIsFollowing = async (userId: string) => {
  if (!userId) {
    GlobalNotifier('User or author information is missing.', 'error');
    return;
  }

  const url = new URL(UserServiceRoutes.allFollowing);
  url.searchParams.set('userId', userId);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'An error occured.');
    }

    const data = await response.json();
    return data.data;
  } catch (err) {
    console.error('Error unfollowing user:', err);
    GlobalNotifier(
      'An error occurred while trying to follow the user.',
      'error'
    );
  }
};

// roles controller methods
export const handleUpgradeRole = async (userId: string, role: string) => {
  if (!userId) return;

  const url = new URL(`${UserServiceRoutes.role}/assign`);
  url.searchParams.set('userId', userId);
  url.searchParams.set('roleName', role);

  try {
    const response = await fetch(url.toString(), { method: 'POST' });

    if (!response.ok) {
      throw new Error(`Failed to assign role: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.data) {
      GlobalNotifier(
        'Congratulations! You have successfully become an author',
        'success'
      );
      return data.data;
    }
  } catch (err) {
    console.error('An error occurred', err);
    GlobalNotifier('Something went wrong. Please try again.', 'error');
  } finally {
  }
};


// Ajouter cette fonction dans ton fichier existant

export interface UserWithBlogCount extends GetUser {
  blogCount?: number;
}

/**
 * Récupère tous les utilisateurs
 */
export const getAllUsers = async (): Promise<GetUser[]> => {
  const url = `${UserServiceRoutes.base}`;
  
  console.log('📤 [getAllUsers] Fetching all users from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📥 [getAllUsers] Response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [getAllUsers] Error:', errorText);
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ [getAllUsers] Users fetched:', result.data?.length || 0);

    return result.data || [];
  } catch (error) {
    console.error('❌ [getAllUsers] Exception:', error);
    throw error;
  }
};

/**
 * Récupère le nombre de blogs d'un utilisateur
 * TODO: Remplacer par l'endpoint réel du service Education
 */
export const getUserBlogCount = async (userId: string): Promise<number> => {
  const url = `${EducationServiceRoutes.blogs}/count-by-author/${userId}`;
  
  console.log('📤 [getUserBlogCount] Fetching blog count for user:', userId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('⚠️ [getUserBlogCount] Failed to fetch blog count');
      return 0;
    }

    const result = await response.json();
    return result.data?.count || 0;
  } catch (error) {
    console.error('❌ [getUserBlogCount] Exception:', error);
    return 0;
  }
};

/**
 * Récupère tous les users avec leur nombre de blogs
 */
export const getAllUsersWithBlogCount = async (): Promise<UserWithBlogCount[]> => {
  const users = await getAllUsers();

  // Récupérer le nombre de blogs pour chaque user en parallèle
  const usersWithCount = await Promise.all(
    users.map(async (user) => {
      try {
        const blogCount = await getUserBlogCount(user.id);
        return { ...user, blogCount };
      } catch (error) {
        console.error(`Failed to fetch blog count for user ${user.id}`, error);
        return { ...user, blogCount: 0 };
      }
    })
  );

  return usersWithCount;
};

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (userId: string): Promise<void> => {
  const url = `${UserServiceRoutes.base}/${userId}`;
  
  console.log('📤 [deleteUser] Deleting user:', userId);

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [deleteUser] Error:', errorText);
      throw new Error(`Failed to delete user: ${response.status}`);
    }

    console.log('✅ [deleteUser] User deleted successfully');
  } catch (error) {
    console.error('❌ [deleteUser] Exception:', error);
    throw error;
  }
};

/**
 * Modifie les rôles d'un utilisateur
 */
export const updateUserRoles = async (
  userId: string,
  roles: string[]
): Promise<void> => {
  const url = `${UserServiceRoutes.role}/${userId}`;
  
  console.log('📤 [updateUserRoles] Updating roles for user:', userId, roles);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [updateUserRoles] Error:', errorText);
      throw new Error(`Failed to update user roles: ${response.status}`);
    }

    console.log('✅ [updateUserRoles] Roles updated successfully');
  } catch (error) {
    console.error('❌ [updateUserRoles] Exception:', error);
    throw error;
  }
};