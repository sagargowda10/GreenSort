import axios from 'axios';

// Helper to get token
const getAuthHeaders = () => {
  const userInfo = localStorage.getItem('userInfo');
  const token = userInfo ? JSON.parse(userInfo).token : null;
  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// --- Function 1: Schedule a Pickup (Used in PickupPage) ---
export const createPickup = async (pickupData) => {
  const config = getAuthHeaders();
  const response = await axios.post('/api/pickups', pickupData, config);
  return response.data;
};

// --- Function 2: Get Full Stats (Used in ProfilePage) ---
// This was missing!
export const getImpactStats = async () => {
  const config = getAuthHeaders();
  const response = await axios.get('/api/pickups/impact', config);
  return response.data;
};

// --- Function 3: Get Just History (Used in PickupPage) ---
export const getPickupHistory = async () => {
  const config = getAuthHeaders();
  const response = await axios.get('/api/pickups/impact', config);
  return response.data.recentPickups; 
};