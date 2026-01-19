/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { token } = useAuth();
  const { logout } = useAuth();
  const [token, setToken] = useState('');
  const router = useRouter();
  // const token = localStorage.getItem('token');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else if (!storedToken) {
      // console.log(token, 'token logged in protectedroute');
      console.log(storedToken, 'storedtoken logged in protectedroute');
      logout();
    }
  }, [router]);

  return <>{token ? children : null}</>;
};

export default ProtectedRoute;
