import React, { useEffect, useState } from "react";
import {
    FaMagnifyingGlass,
    FaPen,
    FaTrash,
    FaEye,
    FaXmark,
    FaTriangleExclamation,
} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getEmployees, updateEmployeeStatus } from "../../services/UserServices";
import "../../styles/EmployeeList.css";


const fallbackEmployees = [

    {
        id: 63,
        employee_id: 63,
        full_name: "Vishvajeet",
        employee_code: "EMP-063",
        role: "Developer",
        email: "vishvajeet@gmail.com",
        phone: "8081322313",
        mobile_no: "8081322313",
        department: "Engineering",
        status: "ACTIVE",
    },
    {
        id: 62,
        employee_id: 62,
        full_name: "Dipanshu",
        employee_code: "EMP-062",
        role: "Frontend Developer",
        email: "dipanshu@gmail.com",
        phone: "8089323513",
        mobile_no: "8089323513",
        department: "Engineering",
        status: "ACTIVE",
    },
    {
        id: 61,
        employee_id: 61,
        full_name: "Priyanshu Chauhan",
        employee_code: "EMP-061",
        role: "Backend Developer",
        email: "priyanshu@gmail.com",
        phone: "8081322313",
        mobile_no: "8081322313",
        department: "Engineering",
        status: "ACTIVE",
    },
    {
        id: 60,
        employee_id: 60,
        full_name: "Rahul Sharma",
        employee_code: "EMP-060",
        role: "UI/UX Designer",
        email: "rahul@gmail.com",
        phone: "8081322513",
        mobile_no: "8081322513",
        department: "Design",
        status: "On Leave",
    },
    {
        id: 59,
        employee_id: 59,
        full_name: "S t gamer Rajpoot",
        employee_code: "EMP-059",
        role: "Project Manager",
        email: "stgamerrrajpoot@gmail.com",
        phone: "8081323513",
        mobile_no: "8081323513",
        department: "Management",
        status: "ACTIVE",
    },
];

const EmployeeList = () => {
    const [data, setData] = useState([]);


    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sort, setSort] = useState("");
    const [page, setPage] = useState(1);

    // MODAL STATES
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // FORM STATE (FOR ADD / EDIT)
    const [formData, setFormData] = useState({
        full_name: "",
        employee_code: "",
        role: "",
        department: "Engineering",
        email: "",
        phone: "",
        status: "ACTIVE",
    });

    const itemsPerPage = 8;

    // ================= FETCH EMPLOYEES FROM API =================
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getEmployees();
            console.log("Fetched employees API response:", res?.data);
            const apiData = res?.data?.data || res?.data || [];
            if (Array.isArray(apiData) && apiData.length > 0) {
                setData(apiData);
            } else {
                setData(fallbackEmployees);
            }
            setPage(1);
        } catch (error) {
            console.log("Employee API fetch error:", error?.response?.data || error);
            // Fallback gracefully so table renders seamlessly
            setData(fallbackEmployees);
        } finally {
            setLoading(false);
        }
    };

    // Populate form data when editing
    useEffect(() => {
        if (editItem) {
            setFormData({
                full_name: editItem.full_name || editItem.name || "",
                employee_code: editItem.employee_code || "",
                role: editItem.role || editItem.designation || "",
                department: editItem.department || "Engineering",
                email: editItem.email || "",
                phone: editItem.mobile_no || editItem.phone || "",
                status: editItem.status || "ACTIVE",
            });
        } else {
            setFormData({
                full_name: "",
                employee_code: `EMP-${Math.floor(100 + Math.random() * 900)}`,
                role: "",
                department: "Engineering",
                email: "",
                phone: "",
                status: "ACTIVE",
            });
        }
    }, [editItem, isAddModalOpen]);

    // Available departments dynamically collected from data + defaults
    const departments = Array.from(
        new Set([
            "Engineering",
            "Design",
            "Management",
            "Human Resources",
            "Sales",
            "Marketing",
            "Support",
            ...data.map((d) => d.department).filter(Boolean),
        ])
    );

    // ================= SEARCH + FILTER =================
    const filteredData = data.filter((item) => {
        const itemDept = item?.department || "";
        const itemStatus = (item?.status || "ACTIVE").toUpperCase();

        if (filterDepartment && itemDept !== filterDepartment) {
            return false;
        }

        if (filterStatus) {
            const fStatusUpper = filterStatus.toUpperCase();
            if (fStatusUpper === "ACTIVE" && itemStatus !== "ACTIVE") return false;
            if (fStatusUpper === "INACTIVE" && itemStatus !== "INACTIVE") return false;
            if (
                fStatusUpper === "ON LEAVE" &&
                !item?.status?.toLowerCase().includes("leave")
            )
                return false;
        }

        if (!query.trim()) {
            return true;
        }

        const q = query.toLowerCase();
        const idStr = String(item?.employee_id || item?.id || "");
        const nameStr = (item?.full_name || item?.name || "").toLowerCase();
        const emailStr = (item?.email || "").toLowerCase();
        const phoneStr = (item?.mobile_no || item?.phone || "").toLowerCase();
        const roleStr = (item?.role || item?.designation || "").toLowerCase();
        const codeStr = (item?.employee_code || "").toLowerCase();
        const deptStr = (item?.department || "").toLowerCase();

        return (
            idStr.includes(q) ||
            nameStr.includes(q) ||
            emailStr.includes(q) ||
            phoneStr.includes(q) ||
            roleStr.includes(q) ||
            codeStr.includes(q) ||
            deptStr.includes(q)
        );
    });

    // ================= SORT =================
    const displayData = [...filteredData].sort((a, b) => {
        const nameA = a?.full_name || a?.name || "";
        const nameB = b?.full_name || b?.name || "";
        const idA = Number(a?.employee_id || a?.id || 0);
        const idB = Number(b?.employee_id || b?.id || 0);

        if (sort === "asc") {
            return nameA.localeCompare(nameB);
        }
        if (sort === "desc") {
            return nameB.localeCompare(nameA);
        }
        if (sort === "newest") {
            return idB - idA;
        }
        if (sort === "oldest") {
            return idA - idB;
        }
        return 0;
    });

    // ================= PAGINATION =================
    const totalPages = Math.ceil(displayData.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const currentData = displayData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    // ================= SAVE EMPLOYEE (ADD / EDIT) =================
    const handleSaveEmployee = async (e) => {
        e.preventDefault();

        if (!formData.full_name.trim() || !formData.email.trim()) {
            toast.error("Name and Email are required");
            return;
        }

        if (editItem) {
            // EDIT
            const updated = {
                ...editItem,
                full_name: formData.full_name,
                name: formData.full_name,
                employee_code: formData.employee_code,
                role: formData.role,
                designation: formData.role,
                department: formData.department,
                email: formData.email,
                phone: formData.phone,
                mobile_no: formData.phone,
                status: formData.status,
            };

            // Attempt status API update if status changed
            if (editItem.status !== formData.status && (editItem.employee_id || editItem.id)) {
                try {
                    await updateEmployeeStatus(
                        editItem.employee_id || editItem.id,
                        formData.status
                    );
                } catch (err) {
                    console.log("Status API update note:", err?.message);
                }
            }

            setData((prev) =>
                prev.map((emp) =>
                    (emp.employee_id || emp.id) === (editItem.employee_id || editItem.id)
                        ? updated
                        : emp
                )
            );

            toast.success("Employee updated successfully!");
            setEditItem(null);
        } else {
            // CREATE
            const newId = Date.now();
            const newEmp = {
                id: newId,
                employee_id: newId,
                full_name: formData.full_name,
                name: formData.full_name,
                employee_code: formData.employee_code || `EMP-${Math.floor(100 + Math.random() * 900)}`,
                role: formData.role || "Staff",
                designation: formData.role || "Staff",
                department: formData.department || "Engineering",
                email: formData.email,
                phone: formData.phone,
                mobile_no: formData.phone,
                status: formData.status || "ACTIVE",
            };

            setData((prev) => [newEmp, ...prev]);
            toast.success("Employee added successfully!");
            setIsAddModalOpen(false);
        }
    };

    // ================= DELETE EMPLOYEE =================
    const handleDeleteConfirm = async () => {
        if (!deleteItem) return;
        setDeleting(true);

        try {
            const delId = deleteItem.employee_id || deleteItem.id;
            setData((prev) =>
                prev.filter((d) => (d.employee_id || d.id) !== delId)
            );
            toast.success("Employee deleted successfully!");
            setDeleteItem(null);
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete employee");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="es-page">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}
            {(isAddModalOpen || editItem) && (
                <div
                    className="es-modal-overlay"
                    onClick={() => {
                        setIsAddModalOpen(false);
                        setEditItem(null);
                    }}
                >
                    <div
                        className="es-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="es-modal__header">
                            <div>
                                <div className="es-modal__title">
                                    {editItem ? "Edit Employee" : "Add Employee"}
                                </div>
                                <div className="es-modal__sub">
                                    {editItem
                                        ? "Update employee profile"
                                        : "Create a new employee profile"}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="es-modal__close"
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditItem(null);
                                }}
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <form id="employeeForm" onSubmit={handleSaveEmployee}>
                            <div className="es-modal__body">
                                <div className="es-modal-form-grid">
                                    {/* FULL NAME */}
                                    <div>
                                        <label className="es-modal__label">
                                            Employee Name
                                        </label>
                                        <input
                                            type="text"
                                            className="es-input"
                                            placeholder="Enter employee full name"
                                            value={formData.full_name}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    full_name: e.target.value,
                                                })
                                            }
                                            required
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* EMPLOYEE CODE */}
                                    <div>
                                        <label className="es-modal__label">
                                            Employee Code
                                        </label>
                                        <input
                                            type="text"
                                            className="es-input"
                                            placeholder="e.g. EMP-064"
                                            value={formData.employee_code}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    employee_code: e.target.value,
                                                })
                                            }
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* ROLE */}
                                    <div>
                                        <label className="es-modal__label">
                                            Role / Designation
                                        </label>
                                        <input
                                            type="text"
                                            className="es-input"
                                            placeholder="e.g. Frontend Developer"
                                            value={formData.role}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    role: e.target.value,
                                                })
                                            }
                                            required
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* DEPARTMENT */}
                                    <div>
                                        <label className="es-modal__label">
                                            Department
                                        </label>
                                        <select
                                            className="es-select"
                                            value={formData.department}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    department: e.target.value,
                                                })
                                            }
                                            style={{ width: "100%" }}
                                        >
                                            {departments.map((dept, i) => (
                                                <option key={i} value={dept}>
                                                    {dept}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* EMAIL */}
                                    <div>
                                        <label className="es-modal__label">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            className="es-input"
                                            placeholder="Enter email address"
                                            value={formData.email}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    email: e.target.value,
                                                })
                                            }
                                            required
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* MOBILE */}
                                    <div>
                                        <label className="es-modal__label">
                                            Mobile / Phone
                                        </label>
                                        <input
                                            type="tel"
                                            className="es-input"
                                            placeholder="Enter 10-digit phone"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label className="es-modal__label">
                                            Status
                                        </label>
                                        <select
                                            className="es-select"
                                            value={formData.status}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    status: e.target.value,
                                                })
                                            }
                                            style={{ width: "100%" }}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="On Leave">On Leave</option>
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="es-modal__footer">
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditItem(null);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="es-btn es-btn--primary"
                                >
                                    {editItem ? "Update Employee" : "Save Employee"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =================================================
                VIEW MODAL
            ================================================= */}
            {viewItem && (
                <div
                    className="es-modal-overlay"
                    onClick={() => setViewItem(null)}
                >
                    <div
                        className="es-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="es-modal__header">
                            <div>
                                <div className="es-modal__title">
                                    Employee Details
                                </div>
                                <div className="es-modal__sub">
                                    ID: {viewItem?.employee_id || viewItem?.id}
                                    {viewItem?.employee_code ? ` • ${viewItem.employee_code}` : ""}
                                </div>
                            </div>
                            <button
                                className="es-modal__close"
                                onClick={() => setViewItem(null)}
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <div className="es-modal__body">
                            <div className="es-modal__grid">
                                <div className="es-modal__field">
                                    <div className="es-modal__label">
                                        Employee Name
                                    </div>
                                    <div className="es-modal__value">
                                        {viewItem?.full_name || viewItem?.name || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">
                                        Employee Code
                                    </div>
                                    <div className="es-modal__value">
                                        {viewItem?.employee_code || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">
                                        Role / Designation
                                    </div>
                                    <div className="es-modal__value">
                                        {viewItem?.role || viewItem?.designation || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">
                                        Department
                                    </div>
                                    <div className="es-modal__value">
                                        {viewItem?.department || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Email</div>
                                    <div className="es-modal__value">
                                        {viewItem?.email || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Phone / Mobile</div>
                                    <div className="es-modal__value">
                                        {viewItem?.mobile_no || viewItem?.phone || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Status</div>
                                    <div className="es-modal__value">
                                        <span
                                            className={`es-emp-badge ${
                                                String(viewItem?.status).toUpperCase() === "ACTIVE"
                                                    ? "es-emp-badge--active"
                                                    : String(viewItem?.status).toLowerCase().includes("leave")
                                                    ? "es-emp-badge--leave"
                                                    : "es-emp-badge--inactive"
                                            }`}
                                        >
                                            <span className="es-emp-status-dot"></span>
                                            {viewItem?.status || "ACTIVE"}
                                        </span>
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Company ID</div>
                                    <div className="es-modal__value">
                                        {viewItem?.company_id || "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="es-modal__footer">
                            <button
                                className="es-btn es-btn--ghost"
                                onClick={() => setViewItem(null)}
                            >
                                Close
                            </button>
                        </div>


                    </div>
                </div>
            )}

            {/* =================================================
                DELETE MODAL
            ================================================= */}
            {deleteItem && (
                <div
                    className="es-modal-overlay"
                    onClick={() => !deleting && setDeleteItem(null)}
                >
                    <div
                        className="es-modal es-modal--sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="es-modal__header">
                            <div className="es-modal__warn-icon">
                                <FaTriangleExclamation />
                            </div>
                            <button
                                className="es-modal__close"
                                onClick={() => !deleting && setDeleteItem(null)}
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <div className="es-modal__body es-modal__body--center">
                            <div className="es-modal__title">Delete Employee?</div>
                            <div
                                className="es-modal__sub"
                                style={{ marginTop: "8px", fontSize: "15px" }}
                            >
                                Are you sure you want to delete{" "}
                                <strong>
                                    {deleteItem?.full_name || deleteItem?.name}
                                </strong>
                                ?
                                <br />
                                This action cannot be undone.
                            </div>
                        </div>

                        <div className="es-modal__footer">
                            <button
                                className="es-btn es-btn--ghost"
                                onClick={() => setDeleteItem(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="es-btn es-btn--danger"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                HEADER
            ================================================= */}
            <div className="es-page-header">
                <div>
                    <div className="es-page-title">Employees</div>
                    <div className="es-page-subtitle">
                        {query.trim() || filterDepartment || filterStatus
                            ? `${displayData.length} result${displayData.length !== 1 ? "s" : ""} found`
                            : `${data.length} total employees`}
                    </div>
                </div>

                <button
                    className="es-btn es-btn--primary"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Add employee
                </button>
            </div>

            {/* =================================================
                SEARCH & FILTERS
            ================================================= */}
            <div
                className="es-search-bar"
                style={{ marginBottom: "16px" }}
            >
                <div className="es-input-wrap">
                    <FaMagnifyingGlass className="es-input-icon" />
                    <input
                        className="es-input"
                        placeholder="Search by name, email, phone, code or role..."
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
                        style={{ minWidth: "340px" }}
                    />
                </div>

                <select
                    className="es-select"
                    value={filterDepartment}
                    onChange={(e) => {
                        setFilterDepartment(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Departments</option>
                    {departments.map((dept, i) => (
                        <option key={i} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>

                <select
                    className="es-select"
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setPage(1);
                    }}
                >
                    <option value="">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="INACTIVE">Inactive</option>
                </select>

                <select
                    className="es-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="">Order</option>
                    <option value="asc">Name A → Z</option>
                    <option value="desc">Name Z → A</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div className="es-table-wrap">
                <table className="es-table">
                    <thead>
                        <tr>
                            <th>ID &amp; Employee Name</th>
                            <th>Role &amp; Department</th>
                            <th>Email / Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px",
                                        color: "var(--gray-400)",
                                        fontSize: "15px",
                                    }}
                                >
                                    {query.trim() || filterDepartment || filterStatus
                                        ? `No results for current search filters`
                                        : "No employees found"}
                                </td>
                            </tr>
                        ) : (
                            currentData.map((item, ind) => {
                                const empId = item?.employee_id || item?.id || ind;
                                const empName = item?.full_name || item?.name || "—";
                                const empCode = item?.employee_code || "";
                                const empRole = item?.role || item?.designation || "Employee";
                                const empDept = item?.department || "General";
                                const empEmail = item?.email || "—";
                                const empPhone = item?.mobile_no || item?.phone || "—";
                                const empStatus = item?.status || "ACTIVE";

                                return (
                                    <tr key={empId}>
                                        {/* EMPLOYEE NAME */}
                                        <td data-label="ID & Employee Name">
                                            <div className="tbl-main">
                                                {empName}
                                            </div>
                                            <div className="tbl-sub">
                                                ID: {empId}
                                                {empCode ? ` • ${empCode}` : ""}
                                            </div>
                                        </td>

                                        {/* ROLE & DEPARTMENT */}
                                        <td data-label="Role & Department">
                                            <div className="tbl-main">
                                                {empRole}
                                            </div>
                                            <div className="tbl-sub">
                                                {empDept}
                                            </div>
                                        </td>

                                        {/* EMAIL / PHONE */}
                                        <td data-label="Email / Phone">
                                            <div className="tbl-main">
                                                {empEmail}
                                            </div>
                                            <div className="tbl-sub">
                                                {empPhone}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td data-label="Status">
                                            <span
                                                className={`es-emp-badge ${
                                                    String(empStatus).toUpperCase() === "ACTIVE"
                                                        ? "es-emp-badge--active"
                                                        : String(empStatus).toLowerCase().includes("leave")
                                                        ? "es-emp-badge--leave"
                                                        : "es-emp-badge--inactive"
                                                }`}
                                            >
                                                <span className="es-emp-status-dot"></span>
                                                {empStatus}
                                            </span>
                                        </td>

                                        {/* ACTIONS */}
                                        <td data-label="Actions">
                                            <div className="tbl-actions">
                                                {/* VIEW */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--view"
                                                    title="View"
                                                    onClick={() => setViewItem(item)}
                                                >
                                                    <FaEye />
                                                </button>

                                                {/* EDIT */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--edit"
                                                    title="Edit"
                                                    onClick={() => setEditItem(item)}
                                                >
                                                    <FaPen />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--delete"
                                                    title="Delete"
                                                    onClick={() => setDeleteItem(item)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* =================================================
                    PAGINATION
                ================================================= */}
                {totalPages > 1 && (
                    <div className="es-pagination">
                        <div className="es-pagination__info">
                            Showing {startIndex + 1}–
                            {Math.min(startIndex + itemsPerPage, displayData.length)} of{" "}
                            {displayData.length}
                        </div>

                        <div className="es-pagination__btns">
                            <button
                                className="es-pagination__btn"
                                onClick={() => setPage(page > 1 ? page - 1 : 1)}
                                disabled={page === 1}
                            >
                                ← Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button
                                    key={p}
                                    className={`es-pagination__btn ${
                                        page === p ? "es-pagination__btn--active" : ""
                                    }`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            ))}

                            <button
                                className="es-pagination__btn"
                                onClick={() => setPage(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeList;