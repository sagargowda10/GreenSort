import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// 👇 THIS WAS MISSING. It allows other pages to use: import { useAuth } from ...
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage) on app start
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

 // ... inside AuthProvider ...

  // REGISTER (Update return statement)
  const register = async (name, email, password, role) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/register', { name, email, password, role }, config);
      
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // 🟢 CHANGE: Return the isAdmin status
      return { success: true, isAdmin: data.isAdmin }; 

    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  // LOGIN (Update return statement)
  const login = async (email, password) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const { data } = await axios.post('/api/auth/login', { email, password }, config);

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));

      // 🟢 CHANGE: Return the isAdmin status
      return { success: true, isAdmin: data.isAdmin }; 

    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  // Logout Action
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout'); // Clear backend cookie
    } catch (error) {
      console.error(error);
    }
    localStorage.removeItem('userInfo'); // Clear local storage
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;