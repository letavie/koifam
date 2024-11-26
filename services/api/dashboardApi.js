import api from "../config";

/**
 * @param {string} startTime 
 * @param {string} endTime 
 * @returns {Promise<Object>} 
 */
export const revenueByDay = async (startTime, endTime) => {
    try {
        const response = await api.get(`/dashboard/daily`, {
            params: { startTime, endTime },
        });
        
        if (response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch daily revenue');
        }
    } catch (error) {
        console.error('Error fetching daily revenue:', error);
        throw error;
    }
};

/**
 * @param {string} year 
 * @returns {Promise<Object>} 
 */
export const revenueByMonth = async (year) => {
    try {
        const response = await api.get(`/dashboard/month`, {
            params: { year },
        });

        if (response.data.status === 'success') {
            return response.data.data;
        } else {
            throw new Error(response.data.message || 'Failed to fetch monthly revenue');
        }
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        throw error;
    }
};
