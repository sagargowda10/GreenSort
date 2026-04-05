import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Truck, User, Calendar, MapPin, XCircle } from 'lucide-react';
import BASE_URL from '../services/api'; // ✅ import base URL

const AdminPage = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPickups();
  }, []);

  // ✅ Fetch all pickups
  const fetchAllPickups = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/pickups/all`);
      setPickups(data);
    } catch (error) {
      toast.error('Failed to fetch pickups');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update pickup status
  const updateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/pickups/${id}/status`, { status: newStatus });
      toast.success(`Pickup marked as ${newStatus}`);
      fetchAllPickups();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        Access Denied. Admins Only.
      </div>
    );
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
                <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Info</th>
                  <th className="py-4 px-6">Items</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pickups.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">

                    {/* User */}
                    <td className="py-4 px-6">
                      <p className="font-bold">
                        {item.userId?.profile?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.userId?.email}
                      </p>
                    </td>

                    {/* Info */}
                    <td className="py-4 px-6">
                      <div className="text-xs">{item.date}</div>
                      <div className="text-xs">{item.address}</div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-6">
                      {item.items.map((i, idx) => (
                        <span key={idx} className="text-xs mr-1">
                          {i}
                        </span>
                      ))}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(item._id, 'completed')}
                            className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => updateStatus(item._id, 'cancelled')}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pickups.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-400">
              No pickup requests found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;