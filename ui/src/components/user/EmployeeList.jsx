import React, { useEffect, useState } from "react";
import {
    FaMagnifyingGlass,
    FaPen,
    FaTrash,
    FaEye,
    FaXmark,
    FaTriangleExclamation,
    FaUserPlus,
    FaArrowsRotate,
    FaCircleCheck,
    FaArrowDownWideShort,
    FaArrowUpShortWide,
} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    getEmployees,
    createEmployee,
    updateEmployeeStatus,
    verifyEmployee,
} from "../../services/UserServices";
import { getCompanyProfile } from "../../services/AdminServices";
import { ToastService } from "../../utils/ToastUtils";
import "../../styles/EmployeeList.css";

const EmployeeList = () => {
    const [data, setData] = useState([]);
    const [companyId, setCompanyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    // DYNAMIC SORTING PARAMETERS
    // Available sortBy values: employee_id, company_id, employee_code, full_name, email, status, created_at
    const [sortBy, setSortBy] = useState("created_at");
    // Available order values: DESC, ASC
    const [order, setOrder] = useState("DESC");
    const [page, setPage] = useState(1);

    // MODAL STATES
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewItem, setViewItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // FORM STATE (FOR ADD / EDIT)
    const [formData, setFormData] = useState({
        full_name: "",
        employee_code: "",
        role: "",
        department: "Engineering",
        email: "",
        phone: "",
        password: "",
        status: "ACTIVE",
    });

    const itemsPerPage = 8;

    // ================= INITIAL LOAD =================
    useEffect(() => {
        fetchCompany();
    }, []);

    // Re-fetch when sortBy or order or status changes
    useEffect(() => {
        fetchData();
    }, [sortBy, order, filterStatus]);

    const fetchCompany = async () => {
        try {
            const res = await getCompanyProfile();
            const cId = res?.data?.data?.company_id || res?.data?.data?.id;
            if (cId) {
                setCompanyId(cId);
            }
        } catch (err) {
            console.log("Could not fetch company profile for company_id:", err);
        }
    };

    // ================= FETCH EMPLOYEES FROM API =================
    const fetchData = async (overrideParams = {}) => {
        setLoading(true);
        try {
            const currentSortBy =
                overrideParams.sortBy !== undefined ? overrideParams.sortBy : sortBy;
            const currentOrder =
                overrideParams.order !== undefined ? overrideParams.order : order;
            const currentStatus =
                overrideParams.filterStatus !== undefined
                    ? overrideParams.filterStatus
                    : filterStatus;
            const currentQuery =
                overrideParams.query !== undefined ? overrideParams.query : query;

            const params = {};
            if (currentQuery && currentQuery.trim()) {
                params.search = currentQuery.trim();
            }
            if (currentStatus && (currentStatus === "ACTIVE" || currentStatus === "INACTIVE")) {
                params.status = currentStatus;
            }
            if (currentSortBy) {
                params.sortBy = currentSortBy;
            }
            if (currentOrder) {
                params.order = currentOrder;
            }

            const res = await getEmployees(params);
            const apiData = res?.data?.data || res?.data || [];
            if (Array.isArray(apiData)) {
                setData(apiData);
            } else {
                setData([]);
            }
            setPage(1);
        } catch (error) {
            console.log("Employee API fetch error:", error?.response?.data || error);
            ToastService.handleApiError(error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    // Populate form data when editing or adding
    useEffect(() => {
        if (editItem) {
            setFormData({
                full_name: editItem.full_name || editItem.name || "",
                employee_code: editItem.employee_code || "",
                role: editItem.role || editItem.designation || "",
                department: editItem.department || "Engineering",
                email: editItem.email || "",
                phone: editItem.mobile_no || editItem.phone || "",
                password: "",
                status: editItem.status || "ACTIVE",
            });
        } else {
            setFormData({
                full_name: "",
                employee_code: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
                role: "",
                department: "Engineering",
                email: "",
                phone: "",
                password: "Emp@" + Math.floor(1000 + Math.random() * 9000),
                status: "ACTIVE",
            });
        }
    }, [editItem, isAddModalOpen]);

    // Available departments dynamically collected from live data + standard list
    const defaultDepartments = [
        "Engineering",
        "Design",
        "Management",
        "Human Resources",
        "Sales",
        "Marketing",
        "Support",
    ];
    const departments = Array.from(
        new Set([
            ...defaultDepartments,
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

    // ================= REAL-TIME SORTING =================
    const displayData = [...filteredData].sort((a, b) => {
        if (!sortBy) return 0;
        let valA = a?.[sortBy];
        let valB = b?.[sortBy];

        if (sortBy === "full_name") {
            valA = a?.full_name || a?.name || "";
            valB = b?.full_name || b?.name || "";
        }

        if (sortBy === "employee_id" || sortBy === "company_id" || sortBy === "id") {
            const numA = Number(valA) || 0;
            const numB = Number(valB) || 0;
            return order === "ASC" ? numA - numB : numB - numA;
        }

        if (sortBy === "created_at") {
            const dateA = new Date(valA || 0).getTime();
            const dateB = new Date(valB || 0).getTime();
            return order === "ASC" ? dateA - dateB : dateB - dateA;
        }

        const cmp = String(valA || "").localeCompare(String(valB || ""));
        return order === "ASC" ? cmp : -cmp;
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

        if (!editItem) {
            if (!formData.phone.trim()) {
                toast.error("Mobile number is required");
                return;
            }
            if (!formData.password.trim()) {
                toast.error("Password is required for employee account");
                return;
            }
        }

        setSubmitting(true);
        try {
            if (editItem) {
                // EDIT STATUS (via PATCH /api/employees/:id/status)
                const empId = editItem.employee_id || editItem.id;
                if (editItem.status !== formData.status && empId) {
                    const statusRes = await updateEmployeeStatus(
                        empId,
                        formData.status
                    );
                    if (statusRes?.data?.success === false) {
                        toast.error(
                            statusRes?.data?.message || "Failed to update employee status"
                        );
                        setSubmitting(false);
                        return;
                    }
                }

                toast.success("Employee status updated successfully!");
                setEditItem(null);
                fetchData();
            } else {
                // CREATE EMPLOYEE (POST /api/auth/create)
                let cId = companyId;
                if (!cId) {
                    try {
                        const cRes = await getCompanyProfile();
                        cId = cRes?.data?.data?.company_id || cRes?.data?.data?.id;
                        if (cId) setCompanyId(cId);
                    } catch (cErr) {
                        console.error("Could not fetch company_id", cErr);
                    }
                }

                if (!cId) {
                    toast.error("Unable to identify Company ID. Please reload page.");
                    setSubmitting(false);
                    return;
                }

                const payload = {
                    company_id: Number(cId),
                    employee_code: formData.employee_code.trim(),
                    full_name: formData.full_name.trim(),
                    mobile_no: formData.phone.trim(),
                    email: formData.email.trim(),
                    password: formData.password.trim(),
                };

                const createRes = await createEmployee(payload);

                if (
                    createRes?.data?.success === true ||
                    createRes?.status === 200 ||
                    createRes?.status === 201
                ) {
                    const newEmpId =
                        createRes?.data?.data?.employee_id ||
                        createRes?.data?.data?.id;

                    // If inactive status was selected upon creation, update it
                    if (formData.status === "INACTIVE" && newEmpId) {
                        try {
                            await updateEmployeeStatus(newEmpId, "INACTIVE");
                        } catch (sErr) {
                            console.log("Status update error after create:", sErr);
                        }
                    }

                    toast.success(
                        createRes?.data?.message || "Employee created successfully!"
                    );
                    setIsAddModalOpen(false);
                    fetchData();
                } else {
                    toast.error(
                        createRes?.data?.message || "Failed to create employee"
                    );
                }
            }
        } catch (error) {
            console.error("Save employee error:", error);
            ToastService.handleApiError(error);
        } finally {
            setSubmitting(false);
        }
    };

    // ================= DEACTIVATE EMPLOYEE =================
    const handleDeleteConfirm = async () => {
        if (!deleteItem) return;
        setDeleting(true);

        try {
            const delId = deleteItem.employee_id || deleteItem.id;
            const res = await updateEmployeeStatus(delId, "INACTIVE");
            if (res?.data?.success === false) {
                toast.error(res?.data?.message || "Failed to deactivate employee");
            } else {
                toast.success("Employee marked as INACTIVE successfully!");
                setDeleteItem(null);
                fetchData();
            }
        } catch (error) {
            console.log("Deactivate error:", error);
            ToastService.handleApiError(error);
        } finally {
            setDeleting(false);
        }
    };

    // ================= VERIFY EMPLOYEE =================
    const handleVerifyConfirm = async (item) => {
        const empId = item?.employee_id || item?.id;
        if (!empId) return;
        try {
            const res = await verifyEmployee(empId);
            if (res?.data?.success === false) {
                toast.error(res?.data?.message || "Failed to verify employee");
            } else {
                toast.success(res?.data?.message || "Employee verified successfully!");
                fetchData();
            }
        } catch (error) {
            ToastService.handleApiError(error);
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
                        if (!submitting) {
                            setIsAddModalOpen(false);
                            setEditItem(null);
                        }
                    }}
                >
                    <div
                        className="es-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="es-modal__header">
                            <div>
                                <div className="es-modal__title">
                                    {editItem ? "Edit Employee Status" : "Add Employee"}
                                </div>
                                <div className="es-modal__sub">
                                    {editItem
                                        ? "Update employee profile status"
                                        : "Register a new dynamic employee in the system"}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="es-modal__close"
                                disabled={submitting}
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
                                            Employee Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="es-input"
                                            placeholder="Enter employee full name"
                                            value={formData.full_name}
                                            disabled={!!editItem}
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
                                            Employee Code *
                                        </label>
                                        <input
                                            type="text"
                                            className="es-input"
                                            placeholder="e.g. EMP-1024"
                                            value={formData.employee_code}
                                            disabled={!!editItem}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    employee_code: e.target.value,
                                                })
                                            }
                                            required
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
                                            placeholder="e.g. Software Engineer"
                                            value={formData.role}
                                            disabled={!!editItem}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    role: e.target.value,
                                                })
                                            }
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
                                            disabled={!!editItem}
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
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            className="es-input"
                                            placeholder="Enter email address"
                                            value={formData.email}
                                            disabled={!!editItem}
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
                                            Mobile / Phone (10 digits) *
                                        </label>
                                        <input
                                            type="tel"
                                            className="es-input"
                                            placeholder="Enter 10-digit mobile"
                                            maxLength={10}
                                            value={formData.phone}
                                            disabled={!!editItem}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    phone: e.target.value,
                                                })
                                            }
                                            required
                                            style={{ width: "100%" }}
                                        />
                                    </div>

                                    {/* PASSWORD FOR NEW EMPLOYEE */}
                                    {!editItem && (
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label className="es-modal__label">
                                                Account Password *
                                            </label>
                                            <input
                                                type="text"
                                                className="es-input"
                                                placeholder="Set employee login password"
                                                value={formData.password}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        password: e.target.value,
                                                    })
                                                }
                                                required
                                                style={{ width: "100%" }}
                                            />
                                            <span style={{ fontSize: "12px", color: "var(--gray-500)", marginTop: "4px", display: "block" }}>
                                                Password for employee portal login credentials
                                            </span>
                                        </div>
                                    )}

                                    {/* STATUS */}
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <label className="es-modal__label">
                                            Account Status
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
                                            <option value="INACTIVE">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="es-modal__footer">
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    disabled={submitting}
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
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Saving..."
                                        : editItem
                                        ? "Update Status"
                                        : "Save Employee"}
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
                                    Employee Profile
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
                            {/* Profile header */}
                            <div className="view-modal-profile">
                                {(viewItem?.profile_image || viewItem?.avatar || viewItem?.img || viewItem?.photo) ? (
                                    <img
                                        src={viewItem.profile_image || viewItem.avatar || viewItem.img || viewItem.photo}
                                        alt={viewItem?.full_name || viewItem?.name}
                                        className="view-modal-avatar"
                                    />
                                ) : (
                                    <div className="view-modal-avatar-placeholder">
                                        {(viewItem?.full_name || viewItem?.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div className="view-modal-profile-info">
                                    <div className="view-modal-name">{viewItem?.full_name || viewItem?.name || "—"}</div>
                                    <div className="view-modal-code">
                                        {viewItem?.employee_code ? `#${viewItem.employee_code}` : `ID: ${viewItem?.employee_id || viewItem?.id}`}
                                    </div>
                                </div>
                            </div>
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
                                        {viewItem?.department || "General"}
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
                                                    : "es-emp-badge--inactive"
                                            }`}
                                        >
                                            <span className="es-emp-status-dot"></span>
                                            {viewItem?.status || "ACTIVE"}
                                        </span>
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Verification Status</div>
                                    <div className="es-modal__value">
                                        {viewItem?.emp_verified ? (
                                            <span style={{ color: "#059669", fontWeight: 600 }}>
                                                ✓ Verified
                                            </span>
                                        ) : (
                                            <span style={{ color: "#d97706", fontWeight: 600 }}>
                                                Pending Verification
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Company ID</div>
                                    <div className="es-modal__value">
                                        {viewItem?.company_id || companyId || "—"}
                                    </div>
                                </div>

                                <div className="es-modal__field">
                                    <div className="es-modal__label">Created At</div>
                                    <div className="es-modal__value">
                                        {viewItem?.created_at
                                            ? new Date(viewItem.created_at).toLocaleDateString()
                                            : "—"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="es-modal__footer">
                            {!viewItem?.emp_verified && (
                                <button
                                    type="button"
                                    className="es-btn es-btn--primary"
                                    onClick={() => {
                                        handleVerifyConfirm(viewItem);
                                        setViewItem(null);
                                    }}
                                >
                                    <FaCircleCheck /> Verify Employee
                                </button>
                            )}
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
                DEACTIVATE CONFIRMATION MODAL
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
                            <div className="es-modal__title">Deactivate Employee?</div>
                            <div
                                className="es-modal__sub"
                                style={{ marginTop: "8px", fontSize: "15px" }}
                            >
                                Are you sure you want to deactivate{" "}
                                <strong>
                                    {deleteItem?.full_name || deleteItem?.name}
                                </strong>
                                ?
                                <br />
                                Their status will be set to <strong>INACTIVE</strong> in the database.
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
                                {deleting ? "Deactivating..." : "Yes, Deactivate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =================================================
                PAGE HEADER — PREMIUM GRADIENT
            ================================================= */}
            <div className="es-page-header-premium">
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="es-page-title">Team Employees</div>
                    <div className="es-page-subtitle">
                        {loading
                            ? "Loading dynamic employees..."
                            : query.trim() || filterDepartment || filterStatus
                            ? `${displayData.length} result${displayData.length !== 1 ? "s" : ""} found`
                            : `${data.length} total employees registered`}
                    </div>
                </div>

                <div className="es-header-btn-group">
                    <button
                        className="es-btn--header-ghost"
                        onClick={() => fetchData()}
                        title="Refresh List"
                    >
                        <FaArrowsRotate className={loading ? "fa-spin" : ""} /> Refresh
                    </button>
                    <button
                        className="es-btn--header-primary"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <FaUserPlus /> Add Employee
                    </button>
                </div>
            </div>

            {/* =================================================
                SEARCH & FILTERS
            ================================================= */}
            <div className="es-search-bar-premium">
                {/* SEARCH INPUT */}
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
                        style={{ minWidth: "280px" }}
                    />
                </div>

                {/* DEPARTMENT FILTER */}
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

                {/* STATUS FILTER */}
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
                    <option value="INACTIVE">Inactive</option>
                </select>

                {/* SORT BY FIELD (QUERY: employee_id, company_id, employee_code, full_name, email, status, created_at) */}
                <select
                    className="es-select"
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setPage(1);
                    }}
                    title="Sort by field"
                    style={{ fontWeight: 600 }}
                >
                    <option value="created_at">Sort By: Created Date</option>
                    <option value="employee_id">Sort By: Employee ID</option>
                    <option value="company_id">Sort By: Company ID</option>
                    <option value="employee_code">Sort By: Employee Code</option>
                    <option value="full_name">Sort By: Full Name</option>
                    <option value="email">Sort By: Email</option>
                    <option value="status">Sort By: Status</option>
                </select>

                {/* ORDER DIRECTION (QUERY: DESC, ASC) */}
                <select
                    className="es-select"
                    value={order}
                    onChange={(e) => {
                        setOrder(e.target.value);
                        setPage(1);
                    }}
                    title="Sort order direction"
                    style={{ fontWeight: 600 }}
                >
                    <option value="DESC">Order: Descending (↓)</option>
                    <option value="ASC">Order: Ascending (↑)</option>
                </select>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}
            <div className="es-table-wrap-premium">
                <table className="es-table">
                    <thead>
                        <tr>
                            <th>ID &amp; Employee Name</th>
                            <th>Role &amp; Department</th>
                            <th>Email / Phone</th>
                            <th>Status</th>
                            <th>Verified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px",
                                        color: "var(--gray-500)",
                                        fontSize: "15px",
                                    }}
                                >
                                    <FaArrowsRotate
                                        className="fa-spin"
                                        style={{ marginRight: "8px", fontSize: "16px" }}
                                    />
                                    Loading dynamic employees from server...
                                </td>
                            </tr>
                        ) : currentData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        color: "var(--gray-500)",
                                        fontSize: "15px",
                                    }}
                                >
                                    <div style={{ marginBottom: "12px", fontSize: "32px", color: "var(--gray-400)" }}>
                                        👥
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--gray-700)", marginBottom: "6px" }}>
                                        {query.trim() || filterDepartment || filterStatus
                                            ? "No employees match your search criteria"
                                            : "No employees registered yet"}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "var(--gray-400)", marginBottom: "16px" }}>
                                        {query.trim() || filterDepartment || filterStatus
                                            ? "Try adjusting your search query or status filter."
                                            : "Add your first employee to dynamically track attendance, roles, and profiles."}
                                    </div>
                                    {!query.trim() && !filterDepartment && !filterStatus && (
                                        <button
                                            type="button"
                                            className="es-btn es-btn--primary"
                                            onClick={() => setIsAddModalOpen(true)}
                                        >
                                            <FaUserPlus /> Add First Employee
                                        </button>
                                    )}
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
                                const isVerified = !!item?.emp_verified;

                                // Avatar: real image if available, else initials with gradient color
                                const empImg = item?.profile_image || item?.avatar || item?.img || item?.photo || null;
                                const avatarInitials = empName !== "—"
                                    ? empName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                                    : "?";
                                const avatarColorIdx = (empId % 6).toString();

                                return (
                                    <tr key={empId}>
                                        {/* EMPLOYEE NAME + AVATAR */}
                                        <td data-label="ID & Employee Name">
                                            <div className="emp-cell-identity">
                                                {empImg ? (
                                                    <img
                                                        src={empImg}
                                                        alt={empName}
                                                        className="emp-avatar"
                                                        onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                                                    />
                                                ) : null}
                                                <div
                                                    className="emp-avatar-placeholder"
                                                    data-color={avatarColorIdx}
                                                    style={{ display: empImg ? "none" : "flex" }}
                                                >
                                                    {avatarInitials}
                                                </div>
                                                <div className="emp-cell-identity-text">
                                                    <div className="tbl-main">{empName}</div>
                                                    <div className="tbl-sub">
                                                        ID: {empId}{empCode ? ` • ${empCode}` : ""}
                                                    </div>
                                                </div>
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
                                                        : "es-emp-badge--inactive"
                                                }`}
                                            >
                                                <span className="es-emp-status-dot"></span>
                                                {empStatus}
                                            </span>
                                        </td>

                                        {/* VERIFIED */}
                                        <td data-label="Verified">
                                            {isVerified ? (
                                                <span className="es-verified-badge" title="Employee Verified">
                                                    ✓ Verified
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="es-pending-badge"
                                                    onClick={() => handleVerifyConfirm(item)}
                                                    title="Click to verify this employee"
                                                >
                                                    ⚡ Verify Now
                                                </button>
                                            )}
                                        </td>

                                        {/* ACTIONS */}
                                        <td data-label="Actions">
                                            <div className="tbl-actions">
                                                {/* VIEW */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--view"
                                                    title="View Profile"
                                                    onClick={() => setViewItem(item)}
                                                >
                                                    <FaEye />
                                                </button>

                                                {/* EDIT STATUS */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--edit"
                                                    title="Edit Status"
                                                    onClick={() => setEditItem(item)}
                                                >
                                                    <FaPen />
                                                </button>

                                                {/* DEACTIVATE */}
                                                <button
                                                    type="button"
                                                    className="tbl-action-btn tbl-action-btn--delete"
                                                    title="Deactivate Employee"
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