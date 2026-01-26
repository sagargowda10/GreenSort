import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { getImpactStats } from '../services/pickupService'; // We use the service we made earlier
import { User, LogOut, Leaf, Scan, Truck, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Impact Stats on Load
  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await getImpactStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Logout
  const handleLogout = () => {
    logout(); // From AuthContext
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- Header Card --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-recycle-green text-white flex items-center justify-center text-4xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>

        {/* --- Impact Stats Grid --- */}
        <h2 className="text-xl font-bold text-gray-800 ml-1">Your Green Impact</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Scans */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Waste Identified</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats?.totalScans || 0}</p>
            </div>
          </div>

          {/* Card 2: Pickups */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-full">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pickups Completed</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats?.totalPickups || 0}</p>
            </div>
          </div>

          {/* Card 3: CO2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-4 bg-green-50 text-green-600 rounded-full">
              <Leaf className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">CO2 Saved (kg)</p>
              <p className="text-2xl font-bold text-gray-800">{loading ? '...' : stats?.co2Saved || 0}</p>
            </div>
          </div>
        </div>

        {/* --- Recent Activity Section --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Activity</h3>
          
          {loading ? (
             <p className="text-gray-400">Loading activity...</p>
          ) : !stats?.recentPickups?.length ? (
             <div className="text-center py-8 text-gray-400">
               <p>No activity yet.</p>
               <button onClick={() => navigate('/identify')} className="text-recycle-green font-bold hover:underline mt-2">Start Recycling</button>
             </div>
          ) : (
            <div className="space-y-4">
              {stats.recentPickups.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="font-bold text-gray-800">Pickup Scheduled</p>
                      <p className="text-sm text-gray-500">{new Date(item.scheduledAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white text-xs font-bold border rounded-full text-gray-600 uppercase">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;