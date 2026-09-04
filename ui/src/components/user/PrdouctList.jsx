import React, { useEffect, useState } from "react";
import {
    FaMagnifyingGlass,
    FaPen,
    FaTrash,
    FaEye,
    FaXmark,
    FaTriangleExclamation
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
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");
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
    }, [sort]);


    const fetchedData = async () => {
        try {

            const res = await getCustomerList("", sort);
            console.log(res);
            

            const sortData = res?.data?.data || [];

            setData(sortData);
            setPage(1);

        } catch (error) {

            console.log(error?.response?.data);

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


    // ================= CITY / STATE SORT =================

    const displayData = [...filteredData].sort((a, b) => {

        if (sort === "city") {

            return (a?.city || "")
                .localeCompare(b?.city || "");

        }

        if (sort === "state") {

            return (a?.state || "")
                .localeCompare(b?.state || "");

        }

        return 0;

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
                HEADER
            ================================================= */}

            <div className="es-page-header">

                <div>

                    <div className="es-page-title">
                        Customers
                    </div>

                    <div className="es-page-subtitle">

                        {query.trim()
                            ? `${displayData.length} result${displayData.length !== 1 ? "s" : ""} found`
                            : `${data.length} total customers`
                        }

                    </div>

                </div>


                <button
                    className="es-btn es-btn--primary"
                    onClick={() =>
                        setIsAddModalOpen(true)
                    }
                >
                    + Add customer
                </button>

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div
                className="es-search-bar"
                style={{
                    marginBottom: "16px"
                }}
            >

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


                <select
                    className="es-select"
                    value={sort}
                    onChange={(e) =>
                        setSort(e.target.value)
                    }
                >

                    <option value="">
                        Order
                    </option>

                    <option value="asc">
                        Name A → Z
                    </option>

                    <option value="desc">
                        Name Z → A
                    </option>

                </select>

            </div>


            {/* =================================================
                TABLE
            ================================================= */}

            <div className="es-table-wrap">

                <table className="es-table">

                    <thead>

                        <tr>

                            <th>
                                ID &amp; Customer Name
                            </th>

                            <th>
                                Company
                            </th>

                            <th>
                                Email / Phone
                            </th>

                            <th>
                                City / State
                            </th>

                            <th>
                                Actions
                            </th>

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
                                        fontSize: "15px"
                                    }}
                                >

                                    {query.trim()
                                        ? `No results for "${query}"`
                                        : "No customers found"
                                    }

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

                                        <div className="tbl-main">
                                            {item?.customer_name || "—"}
                                        </div>

                                        <div className="tbl-sub">
                                            ID: {item?.id || "—"}
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