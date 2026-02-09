import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Backend URL
    timeout: 10000,
});

export const fetchUsers = async (params) => {
    const response = await api.get('/users', { params });
    return response.data;
};

export const fetchFilters = async () => {
    const response = await api.get('/filters');
    return response.data;
};

export const fetchLocationHierarchy = async () => {
    const response = await api.get('/location-hierarchy');
    return response.data;
};

export default api;
