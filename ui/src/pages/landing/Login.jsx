import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { passwordValidation } from "../../utils/Validation";
import { loginUser } from "../../services/LandingServices";
import { ToastService } from "../../utils/ToastUtils";
import "../../styles/Login.css";

const schema = yup.object().shape({
    identifier: yup.string().required("Email or mobile is required"),
    password: passwordValidation,
});

const Login = () => {
    const navigate = useNavigate();
    const [loading,setLoading]=useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const handleLogin = async (data) => {
        if(loading) return;
        setLoading(true);
        try {
            const res = await loginUser(data);
            if (res?.data?.success === true) {
                localStorage.setItem("token", res?.data?.data.token);
                ToastService.success(res?.data?.message);
                navigate("/dashboard");
            } else {
                ToastService.error(res?.data?.message);
            }
        } catch (error) {
            ToastService.handleApiError(error);
        }finally{
            setLoading(false)
        }
    };

    return (
        <div className="login-page">

            <ToastContainer />

            <div className="login-container">

                {/* ================= LEFT ================= */}

                <div className="login-left">

                    <div className="brand">
                        <div className="brand-logo">
                            ES
                        </div>

                        <span>Elation Softnet</span>
                    </div>

                    <div className="left-content">

                        <h1>
                            Run your team from one
                            <br />
                            dashboard.
                        </h1>

                        <p>
                            Track employees, manage customers, and
                            <br />
                            keep your organization moving — all in one
                            <br />
                            place.
                        </p>

                    </div>

                    <div className="features">

                        <div className="feature">
                            <span className="feature-icon">♧</span>
                            <span>128 employees managed</span>
                        </div>

                        <div className="feature">
                            <span className="feature-icon">♧</span>
                            <span>42 active customers</span>
                        </div>

                        <div className="feature">
                            <span className="feature-icon">♢</span>
                            <span>Secure, role-based access</span>
                        </div>

                    </div>

                </div>


                {/* ================= RIGHT ================= */}

                <div className="login-right">

                    <div className="form-wrapper">

                        <h2>
                            Welcome back
                        </h2>

                        <p className="subtitle">
                            Log in to your Elation Softnet account.
                        </p>


                        <form onSubmit={handleSubmit(handleLogin)}>

                            {/* EMAIL */}

                            <div className="form-group">

                                <label>
                                    Email or mobile
                                </label>

                                <input
                                    {...register("identifier")}
                                    type="text"
                                    placeholder="test@gmail.com"
                                />

                                {errors?.identifier && (
                                    <p className="login-error">
                                        {errors.identifier.message}
                                    </p>
                                )}

                            </div>


                            {/* PASSWORD */}

                            <div className="form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="Enter your password"
                                />

                                {errors?.password && (
                                    <p className="login-error">
                                        {errors.password.message}
                                    </p>
                                )}

                            </div>


                            {/* OPTIONS */}

                            <div className="login-options">

                                <label className="remember">

                                    <input
                                        type="checkbox"
                                    />

                                    <span>
                                        Remember me
                                    </span>

                                </label>

                                <a href="#">
                                    Forgot password?
                                </a>

                            </div>


                            {/* LOGIN */}

                            <button  disabled={loading}
                                type="submit"
                                className="login-btn"
                            >
                                {loading? "Logging in...":"Login"}
                            </button>

                        </form>


                        {/* OR */}

                        <div className="or-section">

                            <span></span>

                            <p>or</p>

                            <span></span>

                        </div>
                        {/* REGISTER */}

                        <p className="register-text">

                            Don't have an account?

                            <Link to="/register">
                                {" "}Register your company
                            </Link>

                        </p>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Login;