import axios from "axios";
import React, { useEffect, useState } from "react";
import {
    FaBuilding,
    FaUser,
    FaBriefcase,
    FaEnvelope,
    FaPhone,
    FaCircleCheck,
} from "react-icons/fa6";

const Dashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchedData();
    }, []);

    const fetchedData = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "https://app.elationsoft.net/api/companies/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setData(res?.data?.data);
        } catch (error) {
            console.log(error.response?.data);
        }
    };
    return (
        <div className="container-fluid py-4 min-vh-90">

            <div className="row">

                <div className="col-lg-4 col-sm-8 col-md-6 col-12 mx-auto">

                    {data && (
                        <div
                            className="card border-0 shadow-lg overflow-hidden"
                            style={{ borderRadius: "18px" }}>
                            <div className="position-relative" style={{ height: "140px", }} >
                                <div
                                    className="position-absolute bg-white shadow d-flex align-items-center justify-content-center " style={{maxHeight:"90%",width:"100%"}} >
                                    <img
                                        src={`https://app.elationsoft.net${data?.logo_url}`}
                                        alt={data?.company_name}
                                        className="img-fluid card-img-top"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            backgroundRepeat:"no-repeat",
                                            backgroundOrigin:"center"
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="card-body pt-5 mt-2">

                                <div className="text-start mb-4">
                                    <p className="text-muted mb-2 mt-2">
                                        <FaBuilding className="me-2" />
                                        <b>Company Name :</b> {data?.company_name}
                                    </p>
                                    <span className="mt-2 badge bg-success px-3 py-2 rounded-pill">
                                        <FaCircleCheck className="me-1" />
                                        {data?.status}
                                    </span>

                                </div>

                                <hr />
                                <div className="d-flex align-items-center mb-3">

                                    <div
                                        className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <FaUser />
                                    </div>

                                    <div>
                                        <small className="text-muted">
                                            Contact Person
                                        </small>

                                        <div className="fw-semibold">
                                            {data?.contact_person_name}
                                        </div>
                                    </div>

                                </div>

                                <div className="d-flex align-items-center mb-3">

                                    <div
                                        className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <FaBriefcase />
                                    </div>

                                    <div>
                                        <small className="text-muted">
                                            Designation
                                        </small>

                                        <div className="fw-semibold">
                                            {data?.designation}
                                        </div>
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
                                            Email
                                        </small>

                                        <div
                                            className="fw-semibold text-truncate"
                                            style={{ maxWidth: "250px" }}
                                        >
                                            {data?.email}
                                        </div>
                                    </div>

                                </div>

                                <div className="d-flex align-items-center mb-2">

                                    <div
                                        className="bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center rounded-circle me-3"
                                        style={{ width: "40px", height: "40px" }}
                                    >
                                        <FaPhone />
                                    </div>

                                    <div>
                                        <small className="text-muted">
                                            Mobile
                                        </small>

                                        <div className="fw-semibold">
                                            {data?.mobile}
                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>
    );
};

export default Dashboard;