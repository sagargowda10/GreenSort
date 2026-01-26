import React, { useState, useEffect } from 'react';
import { createPickup, getPickupHistory } from '../services/pickupService';

const PickupPage = () => {
  // --- State Management ---
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    address: '',
    date: '',
    items: ''
  });
  const [formStatus, setFormStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  // --- Load Data on Page Open ---
  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const data = await getPickupHistory();
      setPickups(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ type: '', message: '' });

    try {
      // 1. Prepare data (Convert comma string to array)
      const payload = {
        address: formData.address,
        scheduledAt: formData.date,
        items: formData.items.split(',').map(item => item.trim()).filter(i => i)
      };

      // 2. Send to Backend
      await createPickup(payload);

      // 3. Success UI
      setFormStatus({ type: 'success', message: 'Pickup scheduled successfully!' });
      setFormData({ address: '', date: '', items: '' }); // Reset form
      fetchPickups(); // Refresh the history list immediately

    } catch (error) {
      setFormStatus({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to schedule pickup.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Helper to color-code status ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Schedule Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            🚛 Schedule Pickup
          </h2>

          {formStatus.message && (
            <div className={`p-4 mb-4 rounded-lg ${formStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {formStatus.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label>
              <input
                type="text"
                required
                placeholder="123 Green Street, Apartment 4B"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date & Time</label>
              <input
                type="datetime-local"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items to Recycle</label>
              <textarea
                required
                rows="3"
                placeholder="E.g., Cardboard boxes, 5kg Plastic bottles, Old Laptop..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                value={formData.items}
                onChange={(e) => setFormData({...formData, items: e.target.value})}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">Separate items with commas</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? 'Scheduling...' : 'Confirm Pickup Request'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: History List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Recent Pickups</h2>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading history...</div>
          ) : pickups.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
              <p className="text-gray-500 mb-2">No pickups scheduled yet.</p>
              <p className="text-sm text-green-600">Fill out the form to make your first contribution!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pickups.map((pickup) => (
                <div key={pickup._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusColor(pickup.status)}`}>
                      {pickup.status}
                    </span>
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(pickup.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">Items:</p>
                    <p className="text-gray-800 font-medium">{pickup.items.join(', ')}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t">
                    <span>📍 {pickup.address}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PickupPage;