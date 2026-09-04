import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// GET /companies/profile
export const getCompanyProfile = async () => {
    return await axios.get(`${API_URL}/companies/profile`, {
        headers: authHeader(),
    });
};

// POST /companies/login
export const loginUser = async (data) => {
    return await axios.post(`${API_URL}/companies/login`, data);
};
