import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Register.css";

const schema = yup.object().shape({
    company_name: yup
        .string()
        .required("Company name is required")
        .matches(/^[A-Za-z ]{2,}$/, "Company name contain only letters"),

    contact_person_name: yup
        .string()
        .required("Contact person is required")
        .matches(/^[A-Za-z ]{2,}$/, "Contact person contain only letters"),

    designation: yup
        .string()
        .required("Designation is required")
        .matches(/^[A-Za-z ]{3,}$/, "Contain only letter"),

    email: yup
        .string()
        .required("Email is required")
        .matches(
            /^[A-Za-z\d%&+_-]+@[A-Za-z\d.]+\.[A-Za-z]{2,}$/,
            "Enter valid email"
        ),

    mobile: yup
        .string()
        .required("Mobile is required")
        .matches(/^[6-9]\d{9}$/, "Enter valid number"),

    logo: yup.mixed(),

    password: yup
        .string()
        .required("Password is required")
        .matches(/[A-Z]/, "Atleast one uppercase")
        .matches(/[a-z]/, "Atleast one lowercase")
        .matches(/[\d]/, "Should contain one digit")
        .matches(/[@#$%+_-]/, "Atleast one special symbol")
        .min(8, "Minimum 8 digit password"),
});

const Register = () => {
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const handleRegister = async (data) => {
        const formData = new FormData();

        formData.append("company_name", data.company_name);
        formData.append("contact_person_name", data.contact_person_name);
        formData.append("designation", data.designation);
        formData.append("email", data.email);
        formData.append("mobile", data.mobile);
        formData.append("password", data.password);

        if (data.logo?.[0]) {
            formData.append("logo", data.logo[0]);
        }

        try {
            const res = await axios.post(
                "https://app.elationsoft.net/api/companies",
                formData
            );

            if (res?.data?.success === true) {
                toast.success(res?.data?.message);
                navigate("/");
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="register-page">

            <ToastContainer />

            <div className="register-card">

                {/* ================= LEFT PANEL ================= */}

                <div className="left-panel">

                    <div className="brand-name">

                        <div className="brand-box">
                            ES
                        </div>

                        <span>
                            Elation Softnet
                        </span>

                    </div>

                    <div className="left-content">

                        <h1>
                            Set up your
                            <br />
                            organization in
                            <br />
                            minutes.
                        </h1>

                        <p>
                            Create a company account to start managing
                            employees and customers from a single dashboard.
                        </p>

                    </div>

                    <div className="left-features">

                        <div className="feature-item">
                            <span>✓</span>
                            <span>Free to get started</span>
                        </div>

                        <div className="feature-item">
                            <span>✓</span>
                            <span>No credit card required</span>
                        </div>

                        <div className="feature-item">
                            <span>✓</span>
                            <span>Invite your team anytime</span>
                        </div>

                    </div>

                </div>


                {/* ================= RIGHT PANEL ================= */}

                <div className="right-panel">

                    <div className="form-box">

                        <h2>
                            Create company account
                        </h2>

                        <p className="subtitle">
                            Fill in your company and contact details to get started.
                        </p>

                        <form onSubmit={handleSubmit(handleRegister)}>

                            {/* COMPANY NAME + PASSWORD */}

                            <div className="form-row">

                                <div className="form-field">

                                    <label>
                                        Company name
                                    </label>

                                    <input
                                        {...register("company_name")}
                                        type="text"
                                        className="form-control"
                                        placeholder="Elation Softnet P L"
                                    />

                                    {errors.company_name && (
                                        <small className="error">
                                            {errors.company_name.message}
                                        </small>
                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Password
                                    </label>

                                    <input
                                        {...register("password")}
                                        type="password"
                                        className="form-control"
                                        placeholder="Create a password"
                                    />

                                    {errors.password && (
                                        <small className="error">
                                            {errors.password.message}
                                        </small>
                                    )}

                                </div>

                            </div>


                            {/* CONTACT PERSON + DESIGNATION */}

                            <div className="form-row">

                                <div className="form-field">

                                    <label>
                                        Contact person
                                    </label>

                                    <input
                                        {...register("contact_person_name")}
                                        type="text"
                                        className="form-control"
                                        placeholder="Vishvajeeet"
                                    />

                                    {errors.contact_person_name && (
                                        <small className="error">
                                            {errors.contact_person_name.message}
                                        </small>
                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Designation
                                    </label>

                                    <input
                                        {...register("designation")}
                                        type="text"
                                        className="form-control"
                                        placeholder="Developer"
                                    />

                                    {errors.designation && (
                                        <small className="error">
                                            {errors.designation.message}
                                        </small>
                                    )}

                                </div>

                            </div>


                            {/* EMAIL + MOBILE */}

                            <div className="form-row">

                                <div className="form-field">

                                    <label>
                                        Email
                                    </label>

                                    <input
                                        {...register("email")}
                                        type="email"
                                        className="form-control"
                                        placeholder="you@company.com"
                                    />

                                    {errors.email && (
                                        <small className="error">
                                            {errors.email.message}
                                        </small>
                                    )}

                                </div>


                                <div className="form-field">

                                    <label>
                                        Mobile
                                    </label>

                                    <input
                                        {...register("mobile")}
                                        type="text"
                                        className="form-control"
                                        placeholder="9876543211"
                                    />

                                    {errors.mobile && (
                                        <small className="error">
                                            {errors.mobile.message}
                                        </small>
                                    )}

                                </div>

                            </div>


                            {/* COMPANY LOGO */}

                            <div className="logo-section">

                                <label>
                                    Company logo
                                </label>

                                <label className="upload-box">

                                    <input
                                        type="file"
                                        {...register("logo")}
                                        accept=".png,.jpg,.jpeg"
                                    />

                                    <div className="upload-icon">
                                        ↑
                                    </div>

                                    <div>

                                        <div className="upload-title">
                                            Upload company logo
                                        </div>

                                        <div className="upload-subtitle">
                                            PNG or JPG, up to 2 MB
                                        </div>

                                    </div>

                                </label>

                            </div>


                            {/* CREATE BUTTON */}

                            <button
                                type="submit"
                                className="create-btn"
                            >
                                Create account
                            </button>


                            {/* LOGIN */}

                            <div className="login-text">

                                Already have an account?{" "}

                                <Link to="/">
                                    Log in
                                </Link>

                            </div>

                        </form>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Register;