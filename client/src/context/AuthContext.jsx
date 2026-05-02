import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { loginRequest, meRequest, signupRequest } from '../api/auth.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ttm_user') || 'null'));
  const [booting, setBooting] = useState(Boolean(localStorage.getItem('ttm_token')));

  useEffect(() => {
    const hydrate = async () => {
      if (!localStorage.getItem('ttm_token')) return setBooting(false);
      try {
        const { data } = await meRequest();
        setUser(data.user);
        localStorage.setItem('ttm_user', JSON.stringify(data.user));
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    };
    hydrate();
  }, []);

  const persistAuth = (data) => {
    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = async (payload) => {
    const { data } = await loginRequest(payload);
    persistAuth(data);
    toast.success('Welcome back');
  };

  const signup = async (payload) => {
    const { data } = await signupRequest(payload);
    persistAuth(data);
    toast.success('Account created');
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, booting, isAdmin: user?.role === 'admin', login, signup, logout }),
    [user, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
