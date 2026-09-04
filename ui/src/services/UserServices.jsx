import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});


// GET /customer
export const getCustomerList = async (queryParamsOrSearch = "", sort = "") => {
    let params = {};
    if (typeof queryParamsOrSearch === "object" && queryParamsOrSearch !== null) {
        params = { ...queryParamsOrSearch };
    } else {
        if (queryParamsOrSearch) params.search = queryParamsOrSearch;
        if (sort) params.sort = sort;
    }
    return await axios.get(`${API_URL}/customer`, {
        params,
        headers: authHeader(),
    });
};


// GET /customer/:id
export const getCustomerById = async (id) => {
    return await axios.get(`${API_URL}/customer/${id}`, {
        headers: authHeader(),
    });
};


// POST /customer/create
export const createCustomer = async (data) => {
    return await axios.post(
        `${API_URL}/customer/create`,
        data,
        {
            headers: authHeader(),
        }
    );
};


// PUT /customer/:id
export const editCustomer = async (id, data) => {
    return await axios.put(
        `${API_URL}/customer/${id}`,
        data,
        {
            headers: authHeader(),
        }
    );
};


// DELETE /customer/:id
export const deleteCustomer = async (id) => {
    return await axios.delete(
        `${API_URL}/customer/${id}`,
        {
            headers: authHeader(),
        }
    );
};


// GET /customer/cities
export const getCustomerCities = async () => {
    return await axios.get(
        `${API_URL}/customer/cities`,
        {
            headers: authHeader(),
        }
    );
};


// GET /customer/states
export const getCustomerStates = async () => {
    return await axios.get(
        `${API_URL}/customer/states`,
        {
            headers: authHeader(),
        }
    );
};


// GET /api/employees
export const getEmployees = async (params = {}) => {
    return await axios.get(
        `${API_URL}/employees`,
        {
            params,
            headers: authHeader(),
        }
    );
};


// POST /api/auth/create (Create Employee)
export const createEmployee = async (data) => {
    return await axios.post(
        `${API_URL}/auth/create`,
        data,
        {
            headers: authHeader(),
        }
    );
};


// PATCH /api/employees/:id/status
export const updateEmployeeStatus = async (id, status) => {
    return await axios.patch(
        `${API_URL}/employees/${id}/status`,
        { status },
        {
            headers: authHeader(),
        }
    );
};


// PATCH /api/companies/verify-employee
export const verifyEmployee = async (employeeId) => {
    return await axios.patch(
        `${API_URL}/companies/verify-employee`,
        { employeeId },
        {
            headers: authHeader(),
        }
    );
};