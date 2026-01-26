import axios from 'axios';

const getAuthHeaders = () => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getPosts = async () => {
    const response = await axios.get('/api/community');
    return response.data;
};

export const createPost = async (formData) => {
    const userInfo = localStorage.getItem('userInfo');
    const token = userInfo ? JSON.parse(userInfo).token : null;
    
    // Note: No manual Content-Type header needed; axios sets it for FormData
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };
    const response = await axios.post('/api/community', formData, config);
    return response.data;
};

export const likePost = async (id) => {
    const config = getAuthHeaders();
    const response = await axios.put(`/api/community/${id}/like`, {}, config);
    return response.data;
};