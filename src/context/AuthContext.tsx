/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User } from '@/types/User';
import { AppRoles } from '@/constants/roles';

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  roleUpgrade: (token: string) => void;
  role: string[] | null;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string[] | null>(null);
  const router = useRouter();

  // Check localStorage for token on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      const decodedUser = jwtDecode<User>(storedToken); // Decoding token to get user data
      setUser(decodedUser);
      setRole(decodedUser.roles);
    }
  }, []);

  // Login function

  const login = (token: string) => {
    try {
      // Store token in localStorage
      localStorage.setItem('token', token);
      setToken(token);

      // Decode the token
      const decodedUser = jwtDecode<User>(token);

      // Log the decoded user for debugging
      console.log('Decoded User:', decodedUser);

      // Ensure roles are defined
      if (!decodedUser.roles) {
        console.error('Roles are undefined in the token payload');
        return;
      }

      // Set user and roles in context
      setUser(decodedUser);
      setRole(decodedUser.roles);

      // Redirect based on roles
      if (
        decodedUser.roles.includes(AppRoles.SUPER_ADMIN) ||
        decodedUser.roles.includes(AppRoles.ADMIN) ||
        decodedUser.roles.includes(AppRoles.AUTHOR)
      ) {
        // Redirect to dashboard for admins/authors
        router.push('/u/dashboard');
      } else if (
        decodedUser.roles.length === 1 &&
        decodedUser.roles.includes(AppRoles.USER)
      ) {
        // Redirect to feed for regular users
        router.push('/u/feed/blog');
      } else {
        console.error('Unknown role:', decodedUser.roles);
      }
    } catch (error) {
      console.error('Error decoding token or redirecting:', error);
    }
  };

  const roleUpgrade = (token: string) => {
    try {
      // update role in local storage
      localStorage.setItem('token', token);
      setToken(token);

      // Decode the token
      const decodedUser = jwtDecode<User>(token);

      // Log the decoded user for debugging
      console.log('Decoded User:', decodedUser);

      // Ensure roles are defined
      if (!decodedUser.roles) {
        console.error('Roles are undefined in the token payload');
        return;
      }

      // Set user and roles in context
      setUser(decodedUser);
      setRole(decodedUser.roles);

      // Redirect based on roles
      if (
        decodedUser.roles.includes(AppRoles.SUPER_ADMIN) ||
        decodedUser.roles.includes(AppRoles.ADMIN) ||
        decodedUser.roles.includes(AppRoles.AUTHOR)
      ) {
        // Redirect to dashboard for admins/authors
        router.push('/u/dashboard');
      } else if (
        decodedUser.roles.length === 1 &&
        decodedUser.roles.includes(AppRoles.USER)
      ) {
        // Redirect to feed for regular users
        router.push('/u/feed/blog');
      } else {
        console.error('Unknown role:', decodedUser.roles);
      }
    } catch (error) {
      console.error('Error decoding token or redirecting:', error);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setToken(null);
    setUser(null);
    setRole(null);
    router.push('/auth/login'); // Redirect to login page after logout
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, logout, roleUpgrade, role }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
