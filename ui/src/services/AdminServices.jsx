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
export const editCompanyProfile = async (idOrData, maybeData) => {
    let id = idOrData;
    let data = maybeData;
    if (typeof idOrData === "object" && !maybeData) {
        data = idOrData;
        id = data?.company_id || data?.id;
    }
    const endpoint = id ? `${API_URL}/companies/${id}` : `${API_URL}/companies/profile`;
    return await axios.put(endpoint, data, {
        headers: authHeader(),
    });
};

// Update company password
export const updateCompanyPassword = async (passwords) => {
    try {
        return await axios.put(`${API_URL}/companies/password`, passwords, {
            headers: authHeader(),
        });
    } catch (err) {
        // Fallback to employee / auth password update if company password endpoint is 404
        if (err?.response?.status === 404) {
            return await axios.put(`${API_URL}/auth/update-password`, passwords, {
                headers: authHeader(),
            });
        }
        throw err;
    }
};