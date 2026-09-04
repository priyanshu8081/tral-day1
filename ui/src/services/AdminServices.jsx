import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Placeholder for future admin endpoints
export const getAdminStats = async () => {
    // return await axios.get(`${API_URL}/admin/stats`, ...);
};

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Get company profile
export const getCompanyProfile = async () => {
    return await axios.get(`${API_URL}/companies/profile`, {
        headers: authHeader(),
    });
};

// Update company profile
export const editCompanyProfile = async (data) => {
    return await axios.put(`${API_URL}/companies/profile`, data, {
        headers: authHeader(),
    });
};