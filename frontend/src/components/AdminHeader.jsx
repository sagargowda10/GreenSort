import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Users, Truck } from 'lucide-react';

const AdminHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* 1. Logo (Redirects to Admin Dashboard) */}
        <Link to="/admin" className="text-xl font-bold flex items-center gap-2 hover:text-green-400 transition">
          <Shield className="w-6 h-6 text-green-500" />
          <span className="tracking-wide">GreenSort <span className="text-gray-400 font-normal">Admin</span></span>
        </Link>

        {/* 2. RESTRICTED NAVIGATION (Only Community & Pickup Status) */}
        <div className="flex items-center gap-8">
          
          {/* Link to Community */}
          <Link to="/community" className="text-gray-300 hover:text-white font-medium flex items-center gap-2 transition hover:bg-gray-800 px-3 py-2 rounded-lg">
            <Users className="w-4 h-4" /> 
            Community
          </Link>
          
          {/* Link to Dashboard (Pickup Status) */}
          <Link to="/admin" className="text-gray-300 hover:text-white font-medium flex items-center gap-2 transition hover:bg-gray-800 px-3 py-2 rounded-lg">
            <Truck className="w-4 h-4" /> 
            Pickup Status
          </Link>

          {/* User Profile & Logout */}
          <div className="pl-6 border-l border-gray-700 flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-white leading-none">{user?.profile?.name || user?.name || 'Admin'}</p>
              <p className="text-[10px] text-green-500 uppercase tracking-wider mt-1">Administrator</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-gray-800 hover:bg-red-600 text-white p-2 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default AdminHeader;