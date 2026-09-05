import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/Register.css";
import { companyNameValidation, concatPersonValidation, designationValidation, emailValidation, mobileValidation, passwordValidation } from "../../utils/Validation";

const schema = yup.object().shape({
    company_name:companyNameValidation,

    contact_person_name: concatPersonValidation,

    designation: designationValidation,

    email:emailValidation,

    mobile: mobileValidation,

    logo: yup.mixed(),

    password:passwordValidation,
});

const Register = () => {
    const [loading,setLoading]=useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
        if(loading)  return;
        setLoading(true);
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
        }finally {
        // API response/error aane ke baad button enable
        setLoading(false);
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

                                    <div style={{ position: "relative" }}>
                                        <input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            className="form-control"
                                            placeholder="Create a password"
                                            style={{ paddingRight: "40px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "16px", display: "flex", alignItems: "center" }}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>

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

                            <button disabled={loading}
                                type="submit"
                                className="create-btn"
                            >
                                {loading ? "creating account":"create account"}
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