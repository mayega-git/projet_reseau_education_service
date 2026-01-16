import { GlobalNotifier } from '@/components/ui/GlobalNotifier';
import { UserServiceRoutes } from './api';
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
          role: authorData?.role
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
          role: [],
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
