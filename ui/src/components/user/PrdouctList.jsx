import React, { useEffect, useState } from "react";
import {
    FaMagnifyingGlass,
    FaPen,
    FaTrash,
    FaEye,
    FaXmark,
    FaTriangleExclamation,
    FaArrowsRotate,
    FaUserPlus,
    FaBuilding,
} from "react-icons/fa6";

import {
    getCustomerList,
    deleteCustomer,
    getCustomerCities,
    getCustomerStates
} from "../../services/UserServices";

import AddProduct from "./AddProduct";

const ProductList = () => {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [order, setOrder] = useState("DESC");
    const [page, setPage] = useState(1);

    const [cities, setCities] = useState([]);
    const [states, setStates] = useState([]);

    const [filterCity, setFilterCity] = useState("");
    const [filterState, setFilterState] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // EDIT
    const [editItem, setEditItem] = useState(null);

    // VIEW
    const [viewItem, setViewItem] = useState(null);

    // DELETE
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const itemsPerPage = 8;


    // ================= FETCH CUSTOMER =================

    useEffect(() => {
        fetchedData();
    }, [sortBy, order, filterCity, filterState]);


    const fetchedData = async (overrideParams = {}) => {
        setLoading(true);
        try {
            const currentSortBy = overrideParams.sortBy !== undefined ? overrideParams.sortBy : sortBy;
            const currentOrder = overrideParams.order !== undefined ? overrideParams.order : order;
            const currentCity = overrideParams.filterCity !== undefined ? overrideParams.filterCity : filterCity;
            const currentState = overrideParams.filterState !== undefined ? overrideParams.filterState : filterState;
            const currentQuery = overrideParams.query !== undefined ? overrideParams.query : query;

            const params = {};
            if (currentQuery && currentQuery.trim()) params.search = currentQuery.trim();
            if (currentCity) params.city = currentCity;
            if (currentState) params.state = currentState;
            if (currentSortBy) params.sortBy = currentSortBy;
            if (currentOrder) params.order = currentOrder;

            const res = await getCustomerList(params);
            const sortData = res?.data?.data || [];

            setData(Array.isArray(sortData) ? sortData : []);
            setPage(1);

        } catch (error) {

            console.log(error?.response?.data);

        } finally {
            setLoading(false);
        }
    };


    // ================= FETCH CITY / STATE =================

    useEffect(() => {
        fetchCitiesStates();
    }, []);


    const fetchCitiesStates = async () => {

        try {

            const [cityRes, stateRes] = await Promise.all([
                getCustomerCities(),
                getCustomerStates()
            ]);

            setCities(cityRes?.data?.data || []);
            setStates(stateRes?.data?.data || []);

        } catch (error) {

            console.log(error);

        }

    };


    // ================= SEARCH + FILTER =================

    const filteredData = data.filter((item) => {

        if (
            filterCity &&
            item?.city !== filterCity
        ) {
            return false;
        }

        if (
            filterState &&
            item?.state !== filterState
        ) {
            return false;
        }

        if (!query.trim()) {
            return true;
        }

        const q = query.toLowerCase();

        return (
            String(item?.id || "")
                .toLowerCase()
                .includes(q) ||

            item?.customer_name
                ?.toLowerCase()
                .includes(q) ||

            item?.phone
                ?.toLowerCase()
                .includes(q) ||

            item?.email
                ?.toLowerCase()
                .includes(q) ||

            item?.city
                ?.toLowerCase()
                .includes(q) ||

            item?.state
                ?.toLowerCase()
                .includes(q)
        );

    });


    // ================= SORTING =================

    const displayData = [...filteredData].sort((a, b) => {

        if (!sortBy) return 0;
        let valA = a?.[sortBy];
        let valB = b?.[sortBy];

        if (sortBy === "full_name") {
            valA = a?.customer_name || a?.full_name || a?.name || "";
            valB = b?.customer_name || b?.full_name || b?.name || "";
        }

        if (sortBy === "employee_id" || sortBy === "id" || sortBy === "company_id") {
            const numA = Number(valA || a?.id) || 0;
            const numB = Number(valB || b?.id) || 0;
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

    const totalPages = Math.ceil(
        displayData.length / itemsPerPage
    );

    const startIndex =
        (page - 1) * itemsPerPage;

    const currentData =
        displayData.slice(
            startIndex,
            startIndex + itemsPerPage
        );


    // ================= DELETE =================

    const handleDeleteConfirm = async () => {

        if (!deleteItem) return;

        setDeleting(true);

        try {

            await deleteCustomer(deleteItem.id);

            setData((prev) =>
                prev.filter(
                    (d) => d.id !== deleteItem.id
                )
            );

            setDeleteItem(null);

        } catch (error) {

            console.log(
                error?.response?.data
            );

        } finally {

            setDeleting(false);

        }

    };


    // ================= EDIT SUCCESS =================

    const handleEditSuccess = () => {

        setEditItem(null);

        setIsAddModalOpen(false);

        fetchedData();

    };


    return (

        <div className="es-page">

            {/* =================================================
                ADD / EDIT FORM
            ================================================= */}

            {(isAddModalOpen || editItem) && (

                <AddProduct

                    editData={editItem}

                    onClose={() => {

                        setIsAddModalOpen(false);
                        setEditItem(null);

                    }}

                    onSuccess={handleEditSuccess}

                />

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
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="es-modal__header">

                            <div>

                                <div className="es-modal__title">
                                    Customer Details
                                </div>

                                <div className="es-modal__sub">
                                    ID: {viewItem?.id}
                                </div>

                            </div>

                            <button
                                className="es-modal__close"
                                onClick={() =>
                                    setViewItem(null)
                                }
                            >
                                <FaXmark />
                            </button>

                        </div>


        <div className="es-modal__body">

                            {/* Profile header in view modal */}
                            <div className="view-modal-profile">
                                <div
                                    className="view-modal-avatar-placeholder"
                                    style={{
                                        background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                                    }}
                                >
                                    {(viewItem?.customer_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                </div>
                                <div className="view-modal-profile-info">
                                    <div className="view-modal-name">{viewItem?.customer_name || "—"}</div>
                                    <div className="view-modal-code" style={{ color: "#0369a1" }}>
                                        {viewItem?.company_name ? `🏢 ${viewItem.company_name}` : `ID: ${viewItem?.id}`}
                                    </div>
                                </div>
                            </div>

                            <div className="es-modal__grid">

                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Customer Name
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.customer_name || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Company Name
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.company_name || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Email
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.email || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Phone
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.phone || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Alternate Phone
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.alternate_phone || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        GSTIN
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.gstin_number || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        City
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.city || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        State
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.state || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Pincode
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.pincode || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field">

                                    <div className="es-modal__label">
                                        Company ID
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.company_id || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field es-modal__field--full">

                                    <div className="es-modal__label">
                                        Address Line 1
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.address_line1 || "—"}
                                    </div>

                                </div>


                                <div className="es-modal__field es-modal__field--full">

                                    <div className="es-modal__label">
                                        Address Line 2
                                    </div>

                                    <div className="es-modal__value">
                                        {viewItem?.address_line2 || "—"}
                                    </div>

                                </div>

                            </div>

                        </div>


                        <div className="es-modal__footer">

                            <button
                                className="es-btn es-btn--ghost"
                                onClick={() =>
                                    setViewItem(null)
                                }
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
                    onClick={() =>
                        !deleting &&
                        setDeleteItem(null)
                    }
                >

                    <div
                        className="es-modal es-modal--sm"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="es-modal__header">

                            <div className="es-modal__warn-icon">
                                <FaTriangleExclamation />
                            </div>

                            <button
                                className="es-modal__close"
                                onClick={() =>
                                    !deleting &&
                                    setDeleteItem(null)
                                }
                            >
                                <FaXmark />
                            </button>

                        </div>


                        <div className="es-modal__body es-modal__body--center">

                            <div className="es-modal__title">
                                Delete Customer?
                            </div>

                            <div
                                className="es-modal__sub"
                                style={{
                                    marginTop: "8px",
                                    fontSize: "15px"
                                }}
                            >

                                Are you sure you want to delete{" "}
                                <strong>
                                    {deleteItem?.customer_name}
                                </strong>
                                ?

                                <br />

                                This action cannot be undone.

                            </div>

                        </div>


                        <div className="es-modal__footer">

                            <button
                                className="es-btn es-btn--ghost"
                                onClick={() =>
                                    setDeleteItem(null)
                                }
                                disabled={deleting}
                            >
                                Cancel
                            </button>


                            <button
                                className="es-btn es-btn--danger"
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                            >
                                {deleting
                                    ? "Deleting..."
                                    : "Yes, Delete"
                                }
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                HEADER — PREMIUM GRADIENT
            ================================================= */}

            <div className="es-page-header-premium">
                <div style={{ position: "relative", zIndex: 1 }}>
                    <div className="es-page-title">Customers</div>
                    <div className="es-page-subtitle">
                        {loading
                            ? "Loading dynamic customer directory..."
                            : query.trim() || filterCity || filterState
                            ? `${displayData.length} result${displayData.length !== 1 ? "s" : ""} found`
                            : `${data.length} total customers registered`}
                    </div>
                </div>

                <div className="es-header-btn-group">
                    <button
                        type="button"
                        className="es-btn--header-ghost"
                        onClick={() => fetchedData()}
                        title="Refresh List"
                    >
                        <FaArrowsRotate className={loading ? "fa-spin" : ""} /> Refresh
                    </button>
                    <button
                        type="button"
                        className="es-btn--header-primary"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <FaUserPlus /> Add Customer
                    </button>
                </div>
            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div className="es-search-bar-premium">

                <div className="es-input-wrap">

                    <FaMagnifyingGlass
                        className="es-input-icon"
                    />

                    <input
                        className="es-input"
                        placeholder="Search by name, phone, email, city or state..."
                        type="text"
                        value={query}
                        onChange={(e) => {

                            setQuery(e.target.value);
                            setPage(1);

                        }}
                        style={{
                            minWidth: "340px"
                        }}
                    />

                </div>


                <select
                    className="es-select"
                    value={filterCity}
                    onChange={(e) => {

                        setFilterCity(e.target.value);
                        setPage(1);

                    }}
                >

                    <option value="">
                        All Cities
                    </option>

                    {cities.map((c, i) => (

                        <option
                            key={i}
                            value={c?.city || c}
                        >
                            {c?.city || c}
                        </option>

                    ))}

                </select>


                <select
                    className="es-select"
                    value={filterState}
                    onChange={(e) => {

                        setFilterState(e.target.value);
                        setPage(1);

                    }}
                >

                    <option value="">
                        All States
                    </option>

                    {states.map((s, i) => (

                        <option
                            key={i}
                            value={s?.state || s}
                        >
                            {s?.state || s}
                        </option>

                    ))}

                </select>


                {/* SORT BY FIELD */}
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
                    <option value="employee_id">Sort By: ID / Customer ID</option>
                    <option value="company_id">Sort By: Company ID</option>
                    <option value="employee_code">Sort By: Code</option>
                    <option value="full_name">Sort By: Full Name</option>
                    <option value="email">Sort By: Email</option>
                    <option value="status">Sort By: Status</option>
                </select>

                {/* ORDER DIRECTION */}
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
                            <th>ID &amp; Customer Name</th>
                            <th>Company / Organization</th>
                            <th>Email / Phone</th>
                            <th>City / State</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={5}
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
                                    Loading dynamic customer directory from server...
                                </td>
                            </tr>
                        ) : currentData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 20px",
                                        color: "var(--gray-500)",
                                        fontSize: "15px",
                                    }}
                                >
                                    <div style={{ marginBottom: "12px", fontSize: "32px", color: "var(--gray-400)" }}>
                                        🏪
                                    </div>
                                    <div style={{ fontWeight: 600, fontSize: "16px", color: "var(--gray-700)", marginBottom: "6px" }}>
                                        {query.trim() || filterCity || filterState
                                            ? "No customers match your search criteria"
                                            : "No customer accounts registered yet"}
                                    </div>
                                    <div style={{ fontSize: "14px", color: "var(--gray-400)", marginBottom: "16px" }}>
                                        {query.trim() || filterCity || filterState
                                            ? "Try adjusting your search query, city, or state filter."
                                            : "Onboard your first customer to manage contacts, orders, and addresses."}
                                    </div>
                                    {!query.trim() && !filterCity && !filterState && (
                                        <button
                                            type="button"
                                            className="es-btn es-btn--primary"
                                            onClick={() => setIsAddModalOpen(true)}
                                        >
                                            <FaUserPlus /> Add First Customer
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ) : (

                            currentData.map((item, ind) => (

                                <tr
                                    key={
                                        item?.id || ind
                                    }
                                >

                                    {/* CUSTOMER */}

                                    <td data-label="ID & Customer Name">
                                        <div className="emp-cell-identity">
                                            <div
                                                className="emp-avatar-placeholder"
                                                data-color="1"
                                                style={{ flexShrink: 0 }}
                                            >
                                                {(item?.customer_name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="emp-cell-identity-text">
                                                <div className="tbl-main">{item?.customer_name || "—"}</div>
                                                <div className="tbl-sub">ID: {item?.id || "—"}</div>
                                            </div>
                                        </div>
                                    </td>


                                    {/* COMPANY */}

                                    <td data-label="Company Name & ID">

                                        <div className="tbl-main">
                                            {item?.company_name || "—"}
                                        </div>

                                        <div className="tbl-sub">
                                            Co. ID: {item?.company_id || "—"}
                                        </div>

                                    </td>


                                    {/* EMAIL / PHONE */}

                                    <td data-label="Email / Phone">

                                        <div className="tbl-main">
                                            {item?.email || "—"}
                                        </div>

                                        <div className="tbl-sub">
                                            {item?.phone || "—"}
                                        </div>

                                    </td>


                                    {/* CITY / STATE */}

                                    <td data-label="City / State">

                                        <div className="tbl-main">
                                            {item?.city || "—"}
                                        </div>

                                        <div className="tbl-sub">
                                            {item?.state || "—"}
                                        </div>

                                    </td>


                                    {/* ACTIONS */}

                                    <td data-label="Actions">

                                        <div className="tbl-actions">

                                            {/* VIEW */}

                                            <button
                                                type="button"
                                                className="tbl-action-btn tbl-action-btn--view"
                                                title="View"
                                                onClick={() =>
                                                    setViewItem(item)
                                                }
                                            >
                                                <FaEye />
                                            </button>


                                            {/* EDIT */}

                                            <button
                                                type="button"
                                                className="tbl-action-btn tbl-action-btn--edit"
                                                title="Edit"
                                                onClick={() => {
                                                    setEditItem(item);

                                                }}
                                            >
                                                <FaPen />
                                            </button>


                                            {/* DELETE */}

                                            <button
                                                type="button"
                                                className="tbl-action-btn tbl-action-btn--delete"
                                                title="Delete"
                                                onClick={() =>
                                                    setDeleteItem(item)
                                                }
                                            >
                                                <FaTrash />
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {totalPages > 1 && (

                    <div className="es-pagination">

                        <div className="es-pagination__info">

                            Showing{" "}
                            {startIndex + 1}
                            {"–"}
                            {Math.min(
                                startIndex + itemsPerPage,
                                displayData.length
                            )}
                            {" of "}
                            {displayData.length}

                        </div>


                        <div className="es-pagination__btns">

                            <button
                                className="es-pagination__btn"
                                onClick={() =>
                                    setPage(
                                        page > 1
                                            ? page - 1
                                            : 1
                                    )
                                }
                                disabled={page === 1}
                            >
                                ← Prev
                            </button>


                            {Array.from(
                                {
                                    length: totalPages
                                },
                                (_, i) => i + 1
                            ).map((p) => (

                                <button
                                    key={p}
                                    className={`es-pagination__btn ${page === p
                                            ? "es-pagination__btn--active"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        setPage(p)
                                    }
                                >
                                    {p}
                                </button>

                            ))}


                            <button
                                className="es-pagination__btn"
                                onClick={() =>
                                    setPage(page + 1)
                                }
                                disabled={
                                    page === totalPages
                                }
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

export default ProductList;