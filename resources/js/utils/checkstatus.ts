//check which platforms are connected

import axios from 'axios';
export const checkConnectedPlatforms = async () => {
    try {
        const response = await axios.get('/platforms/connected');
        return response.data; // assuming the response contains the connected platforms data
    } catch (error) {
        console.error('Error checking connected platforms:', error);
        return null;
    }
};