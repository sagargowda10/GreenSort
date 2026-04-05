import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Hook
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ✅ REGISTER
  const register = async (name, email, password, role) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const { data } = await axios.post(
        'https://greensort.onrender.com/api/auth/register',
        { name, email, password, role },
        config
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));

      return { success: true, isAdmin: data.isAdmin };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const config = {
        headers: { 'Content-Type': 'application/json' }
      };

      const { data } = await axios.post(
        'https://greensort.onrender.com/api/auth/login',
        { email, password },
        config
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));

      return { success: true, isAdmin: data.isAdmin };

    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      await axios.post(
        'https://greensort.onrender.com/api/auth/logout'
      );
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem('userInfo');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;