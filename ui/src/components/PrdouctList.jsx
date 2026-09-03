import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaBuilding,
    FaUser,
    FaEnvelope,
    FaPhone, FaLocationDot
} from "react-icons/fa6";
import { TbMapPinCode } from "react-icons/tb";
import { FaRegAddressCard } from "react-icons/fa";
import { FaCity } from "react-icons/fa6";

const ProductList = () => {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("");
    useEffect(() => {
        fetchedData();
    }, []);

    const fetchedData = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "https://app.elationsoft.net/api/customer",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );
            setData(res?.data?.data);

        } catch (error) {
            console.log(error.response?.data);
        }
    };
    return (
        <div className="container-fluid py-4  min-vh-90">
            <div className="row g-2">
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                    <input placeholder="Search Customer Name.." className="form-control mb-2" type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                    <select value={sort} className="form-select w-100" onChange={(e) => setSort(e.target.value)}>
                        <option value="">Sort by name</option>
                        <option value="asc">A-Z</option>
                        <option value="desc">Z-A</option>
                    </select>
                </div>
                {
                    data?.filter((item) => {
                        const searchQuery = item?.customer_name?.toLowerCase().includes(query?.toLocaleLowerCase());
                        return searchQuery;
                    })?.sort((a, b) => {
                        if (sort === "asc") {
                            return (a?.customer_name || "").localeCompare(
                                b?.customer_name || ""
                            );
                        }
                        if (sort === "desc") {
                            return (b?.customer_name || "").localeCompare(
                                a?.customer_name || ""
                            );
                        }
                    })
                        ?.map((item, ind) => {
                            return (
                                < div key={ind || item?.id} className="col-lg-3 col-md-4 col-12 ">
                                    <div
                                        className="card border-0 shadow-lg border-rounded overflow-hidden">
                                        <div className="card-body  mt-2">
                                            <div className="text-start">
                                                <p className="text-muted">
                                                    <FaBuilding className="me-2" />
                                                    Company Name : {item?.company_name}
                                                </p>
                                            </div>

                                            <hr />
                                            <div className="d-flex align-items-center mb-3">

                                                <div className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3" style={{ width: "40px", height: "40px" }}>
                                                    <FaUser />
                                                </div>

                                                <div>
                                                    <small className="text-muted">
                                                        Customer Name
                                                    </small> <br />
                                                    <small className="text-muted fw-bold">
                                                        {item?.customer_name}
                                                    </small>
                                                </div>

                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <FaEnvelope />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <small className="text-muted">
                                                        Email                                                 </small> <br />
                                                    <small className="text-muted fw-bold">
                                                        {item?.email}
                                                    </small>
                                                </div>

                                            </div>

                                            <div className="d-flex align-items-center mb-2">

                                                <div className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }} >
                                                    <FaPhone />
                                                </div>

                                                <div>
                                                    <small className="text-muted">
                                                        Mobile
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {item?.phone}
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="d-flex align-items-center mb-2">

                                                <div className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }} >
                                                    <TbMapPinCode />
                                                </div>

                                                <div>
                                                    <small className="text-muted">
                                                        Pincode
                                                    </small>

                                                    <div className="fw-semibold">
                                                        {item?.pincode}
                                                    </div>
                                                </div>


                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <FaRegAddressCard />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <small className="text-muted">
                                                        Customer Id                                                 </small> <br />
                                                    <small className="text-muted fw-bold">
                                                        {item?.id}
                                                    </small>
                                                </div>

                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <FaCity />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <small className="text-muted">
                                                        city                                            </small> <br />
                                                    <small className="text-muted fw-bold">
                                                        {item?.city}
                                                    </small>
                                                </div>

                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <div
                                                    className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                                    style={{ width: "40px", height: "40px" }}
                                                >
                                                    <FaLocationDot />
                                                </div>

                                                <div style={{ minWidth: 0 }}>
                                                    <small className="text-muted">
                                                        state                                                 </small> <br />
                                                    <small className="text-muted fw-bold">
                                                        {item?.state}
                                                    </small>
                                                </div>

                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )
                        })
                }
            </div>

        </div >
    );
};

export default ProductList;