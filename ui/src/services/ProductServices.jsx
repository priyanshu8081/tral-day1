import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
// get customer profile
export const getCompanyProfile = async () => {
    const token = localStorage.getItem("token");

    return await axios.get(
        `${API_URL}/companies/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
}
// get customer 
export const getCustomerList = async (query = "", sort = "") => {
    const token = localStorage.getItem("token");

    return await axios.get(
        `${API_URL}/customer`, {
        params: { search: query, sort: sort }, headers: { Authorization: `Bearer ${token}` }
    }
    );
}
// login user
export const loginUser = async (data) => {
    return await axios.post(
        `${API_URL}/companies/login`,
        data
    );
}