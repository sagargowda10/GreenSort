import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, Truck, User, Calendar, MapPin, XCircle } from 'lucide-react';

const AdminPage = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPickups();
  }, []);

  const fetchAllPickups = async () => {
    try {
      const { data } = await axios.get('/api/pickups/all');
      setPickups(data);
    } catch (error) {
      toast.error('Failed to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`/api/pickups/${id}/status`, { status: newStatus });
      toast.success(`Pickup marked as ${newStatus}`);
      fetchAllPickups(); // Refresh list to show changes
    } catch (error) {
      toast.error('Update failed');
    }
  };

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.isAdmin) {
    return <div className="text-center mt-20 text-red-500 font-bold">Access Denied. Admins Only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <Truck className="text-green-600 w-8 h-8" /> Pickup Management
        </h1>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                  <th className="py-4 px-6">User Details</th>
                  <th className="py-4 px-6">Pickup Info</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-medium">
                {pickups.map((item) => (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition">
                    
                    {/* User Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                           <User className="w-4 h-4" />
                        </div>
                        <div>
                           <p className="text-gray-900 font-bold">{item.userId?.profile?.name || 'Unknown'}</p>
                           <p className="text-xs text-gray-500">{item.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Info Column */}
                    <td className="py-4 px-6 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Calendar className="w-3 h-3 text-gray-400" /> {item.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs truncate max-w-[150px]" title={item.address}>
                        <MapPin className="w-3 h-3 text-gray-400" /> {item.address}
                      </div>
                    </td>

                    {/* Items Column */}
                    <td className="py-4 px-6">
                      {item.items.map((i, idx) => (
                        <span key={idx} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-1 mb-1 border border-gray-200">
                          {i}
                        </span>
                      ))}
                    </td>

                    {/* Status Column */}
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(item.status)} uppercase tracking-wide`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-6">
                      {item.status === 'pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => updateStatus(item._id, 'completed')}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition shadow-sm"
                            title="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus(item._id, 'cancelled')}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition shadow-sm"
                            title="Cancel Pickup"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {item.status === 'completed' && <span className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Done</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pickups.length === 0 && !loading && (
             <div className="p-10 text-center text-gray-400">
                <Truck className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No pickup requests found.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;