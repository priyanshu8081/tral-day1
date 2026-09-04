import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
    FaPen,
    FaXmark,
    FaBuilding,
    FaUser,
    FaEnvelope,
    FaPhone,
    FaCalendarDays,
    FaIdCard,
    FaCircleCheck,
    FaCheck,
    FaArrowLeft,
    FaCopy,
    FaUsers,
    FaArrowsRotate,
    FaShieldHalved,
    FaLock,
    FaKey,
    FaEye,
    FaEyeSlash,
    FaCircleExclamation,
    FaTriangleExclamation,
} from "react-icons/fa6";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import "../../styles/CompanyProfile.css";
import {
    getCompanyProfile,
    editCompanyProfile,
    updateCompanyPassword,
} from "../../services/AdminServices";
import { getEmployees } from "../../services/UserServices";
import { ToastService } from "../../utils/ToastUtils";
import {
    companyNameValidation,
    concatPersonValidation,
    designationValidation,
    emailValidation,
    mobileValidation,
} from "../../utils/Validation";

const schema = yup.object().shape({
    company_name: companyNameValidation,
    contact_person_name: concatPersonValidation,
    designation: designationValidation,
    email: emailValidation,
    mobile: mobileValidation,
});

const passwordSchema = yup.object().shape({
    current_password: yup.string().required("Current password is required"),
    new_password: yup
        .string()
        .required("New password is required")
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "At least one uppercase letter (A-Z)")
        .matches(/[a-z]/, "At least one lowercase letter (a-z)")
        .matches(/[\d]/, "At least one number (0-9)")
        .matches(/[@#$%+!_.-]/, "At least one special symbol (@#$%+!_.-)")
        .notOneOf(
            [yup.ref("current_password")],
            "New password cannot be the same as current password"
        ),
    confirm_password: yup
        .string()
        .required("Please confirm your new password")
        .oneOf([yup.ref("new_password")], "Passwords do not match"),
});

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [activeTab, setActiveTab] = useState("info"); // 'info' | 'security'

    // Password visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Form for Password Update
    const {
        register: registerPass,
        handleSubmit: handlePassSubmit,
        reset: resetPass,
        watch: watchPass,
        formState: { errors: passErrors, isSubmitting: isPassSubmitting },
    } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const newPasswordVal = watchPass("new_password") || "";
    const confirmPasswordVal = watchPass("confirm_password") || "";

    // Live Password Strength Checklist
    const hasMinLength = newPasswordVal.length >= 8;
    const hasUpper = /[A-Z]/.test(newPasswordVal);
    const hasLower = /[a-z]/.test(newPasswordVal);
    const hasDigit = /[\d]/.test(newPasswordVal);
    const hasSpecial = /[@#$%+!_.-]/.test(newPasswordVal);

    const passedChecks = [
        hasMinLength,
        hasUpper,
        hasLower,
        hasDigit,
        hasSpecial,
    ].filter(Boolean).length;

    let strengthLabel = "Too Short";
    let strengthColor = "#94a3b8";
    let strengthWidth = "10%";

    if (newPasswordVal.length > 0) {
        if (passedChecks <= 2) {
            strengthLabel = "Weak";
            strengthColor = "#ef4444";
            strengthWidth = "30%";
        } else if (passedChecks <= 4) {
            strengthLabel = "Medium";
            strengthColor = "#f59e0b";
            strengthWidth = "65%";
        } else {
            strengthLabel = "Strong";
            strengthColor = "#10b981";
            strengthWidth = "100%";
        }
    }

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const fetchCompanyProfile = async () => {
        setLoading(true);
        try {
            const [profileRes, empRes] = await Promise.allSettled([
                getCompanyProfile(),
                getEmployees(),
            ]);

            if (profileRes.status === "fulfilled") {
                const companyData = profileRes.value?.data?.data;
                setCompany(companyData);
                populateForm(companyData);
            }

            if (empRes.status === "fulfilled") {
                const emps = empRes.value?.data?.data || empRes.value?.data || [];
                setEmployeeCount(Array.isArray(emps) ? emps.length : 0);
            }
        } catch (error) {
            ToastService.handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const populateForm = (data) => {
        if (!data) return;
        setValue("company_name", data?.company_name || "");
        setValue("contact_person_name", data?.contact_person_name || "");
        setValue("designation", data?.designation || "");
        setValue("email", data?.email || "");
        setValue("mobile", data?.mobile || "");
    };

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const handleEdit = () => {
        populateForm(company);
        setIsEdit(true);
    };

    const handleCancel = () => {
        populateForm(company);
        setIsEdit(false);
    };

    const handleUpdate = async (data) => {
        try {
            const cId = company?.company_id || company?.id;
            if (!cId) {
                toast.error("Company ID not found");
                return;
            }

            const res = await editCompanyProfile(cId, data);
            if (
                res?.data?.success === true ||
                res?.status === 200 ||
                res?.status === 201
            ) {
                toast.success(
                    res?.data?.message || "Company profile updated successfully!"
                );
                setCompany((prev) => ({ ...prev, ...data }));
                setIsEdit(false);
                fetchCompanyProfile();
            } else {
                toast.error(
                    res?.data?.message || "Unable to update company profile"
                );
            }
        } catch (error) {
            ToastService.handleApiError(error);
        }
    };

    const handlePasswordUpdate = async (data) => {
        try {
            const payload = {
                current_password: data.current_password,
                new_password: data.new_password,
                confirm_password: data.confirm_password,
            };
            const res = await updateCompanyPassword(payload);
            if (
                res?.data?.success === true ||
                res?.status === 200 ||
                res?.status === 201
            ) {
                toast.success(
                    res?.data?.message || "Password updated successfully!"
                );
                resetPass();
            } else {
                toast.error(
                    res?.data?.message || "Failed to update password"
                );
            }
        } catch (error) {
            if (error?.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                ToastService.handleApiError(error);
            }
        }
    };

    const handleValidationError = (formErrors) => {
        const firstError = Object.values(formErrors)[0];
        if (firstError?.message) {
            toast.error(firstError.message);
        }
    };

    const copyToClipboard = (text, label) => {
        if (!text) return;
        navigator.clipboard.writeText(String(text));
        toast.info(`Copied ${label} to clipboard!`);
    };

    const initials = (company?.company_name || "ES")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const companyIdFormatted = company?.company_id || company?.id || "1002";

    return (
        <div className="cp-page">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="cp-container">
                {/* ── TOP BAR ─────────────────────────────────────── */}
                <div className="cp-top-bar">
                    <div className="cp-title-wrap">
                        <h2>Company Profile</h2>
                        <p>Manage and view your registered enterprise credentials & profile</p>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            type="button"
                            className="es-btn es-btn--ghost"
                            onClick={fetchCompanyProfile}
                            title="Refresh profile"
                        >
                            <FaArrowsRotate className={loading ? "fa-spin" : ""} /> Refresh
                        </button>
                        <button
                            type="button"
                            className="es-btn es-btn--ghost"
                            onClick={() => navigate("/dashboard")}
                        >
                            <FaArrowLeft /> Dashboard
                        </button>
                    </div>
                </div>

                {/* ── HERO BANNER CARD ────────────────────────────── */}
                <div className="cp-hero-card">
                    <div className="cp-banner">
                        <div className="cp-banner-pattern"></div>
                    </div>

                    <div className="cp-hero-body">
                        <div className="cp-avatar-group">
                            <div className="cp-avatar">{initials}</div>
                            <div>
                                <h3 className="cp-name">
                                    {company?.company_name || "Elation Softnet"}
                                </h3>
                                <div className="cp-sub">
                                    <FaBuilding style={{ fontSize: "13px" }} />
                                    <span>
                                        Enterprise ID: #{companyIdFormatted}
                                    </span>
                                    <button
                                        type="button"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: "#6366f1",
                                            cursor: "pointer",
                                            padding: "2px",
                                            display: "inline-flex",
                                            alignItems: "center",
                                        }}
                                        title="Copy Company ID"
                                        onClick={() => copyToClipboard(companyIdFormatted, "Company ID")}
                                    >
                                        <FaCopy style={{ fontSize: "12px" }} />
                                    </button>
                                    <span>•</span>
                                    <span
                                        className="es-emp-badge es-emp-badge--active"
                                        style={{ padding: "3px 9px", fontSize: "11px" }}
                                    >
                                        <span className="es-emp-status-dot"></span>
                                        {company?.status || "Active Organization"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            {activeTab === "info" && !isEdit && (
                                <button
                                    type="button"
                                    className="es-btn es-btn--primary"
                                    onClick={handleEdit}
                                >
                                    <FaPen /> Edit Corporate Info
                                </button>
                            )}
                            {activeTab === "info" && isEdit && (
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    onClick={handleCancel}
                                >
                                    <FaXmark /> Cancel Editing
                                </button>
                            )}
                            <button
                                type="button"
                                className={`es-btn ${activeTab === "security" ? "es-btn--primary" : "es-btn--outline"}`}
                                onClick={() => {
                                    if (activeTab === "security") {
                                        setActiveTab("info");
                                    } else {
                                        setActiveTab("security");
                                        setIsEdit(false);
                                    }
                                }}
                            >
                                {activeTab === "security" ? (
                                    <>
                                        <FaBuilding /> Corporate Profile
                                    </>
                                ) : (
                                    <>
                                        <FaKey /> Change Password
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── METRICS ROW ─────────────────────────────────── */}
                <div className="cp-stats-grid">
                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--indigo">
                            <FaIdCard />
                        </div>
                        <div>
                            <div className="cp-stat-label">Enterprise ID</div>
                            <div className="cp-stat-val">
                                #{companyIdFormatted}
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--emerald">
                            <FaCircleCheck />
                        </div>
                        <div>
                            <div className="cp-stat-label">Verification</div>
                            <div className="cp-stat-val" style={{ color: "#059669" }}>
                                {company?.status || "Verified"}
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--purple">
                            <FaUsers />
                        </div>
                        <div>
                            <div className="cp-stat-label">Staff Managed</div>
                            <div className="cp-stat-val">
                                {employeeCount} Employees
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--amber">
                            <FaCalendarDays />
                        </div>
                        <div>
                            <div className="cp-stat-label">Member Since</div>
                            <div className="cp-stat-val" style={{ fontSize: "14px" }}>
                                {company?.created_at
                                    ? new Date(company.created_at).toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "numeric",
                                          year: "numeric",
                                      })
                                    : "Active Client"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TABS ─────────────────────────────────────────── */}
                <div className="cp-tab-bar">
                    <button
                        type="button"
                        className={`cp-tab-btn ${activeTab === "info" ? "cp-tab-btn--active" : ""}`}
                        onClick={() => setActiveTab("info")}
                    >
                        <FaBuilding /> Corporate Information
                    </button>
                    <button
                        type="button"
                        className={`cp-tab-btn ${activeTab === "security" ? "cp-tab-btn--active" : ""}`}
                        onClick={() => {
                            setActiveTab("security");
                            setIsEdit(false);
                        }}
                    >
                        <FaLock /> Security & Password
                    </button>
                </div>

                {/* ── TAB 1: CORPORATE INFORMATION ─────────────────── */}
                {activeTab === "info" && (
                    !isEdit ? (
                        <div className="cp-card">
                            <div className="cp-card-header">
                                <div>
                                    <h4 className="cp-card-title">Corporate Information</h4>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                                        Official verified enterprise business details
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    style={{ height: "32px", fontSize: "13px" }}
                                    onClick={handleEdit}
                                >
                                    <FaPen style={{ fontSize: "11px" }} /> Edit Info
                                </button>
                            </div>

                            <div className="cp-grid">
                                <div className="cp-item">
                                    <div className="cp-label">
                                        <FaBuilding /> Company Name
                                    </div>
                                    <div className="cp-val">
                                        {company?.company_name || "—"}
                                    </div>
                                </div>

                                <div className="cp-item">
                                    <div className="cp-label">
                                        <FaUser /> Authorized Contact
                                    </div>
                                    <div className="cp-val">
                                        {company?.contact_person_name || "—"}
                                    </div>
                                </div>

                                <div className="cp-item">
                                    <div className="cp-label">
                                        <FaShieldHalved /> Designation
                                    </div>
                                    <div className="cp-val">
                                        {company?.designation || "—"}
                                    </div>
                                </div>

                                <div className="cp-item">
                                    <div className="cp-label">
                                        <FaEnvelope /> Official Email
                                    </div>
                                    <div
                                        className="cp-val"
                                        style={{ color: "#4f46e5", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <span>{company?.email || "—"}</span>
                                        {company?.email && (
                                            <button
                                                type="button"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#6366f1",
                                                    cursor: "pointer",
                                                    padding: 0,
                                                }}
                                                onClick={() => copyToClipboard(company.email, "Email")}
                                            >
                                                <FaCopy style={{ fontSize: "12px" }} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="cp-item">
                                    <div className="cp-label">
                                        <FaPhone /> Contact Mobile
                                    </div>
                                    <div
                                        className="cp-val"
                                        style={{ color: "#4f46e5", display: "flex", alignItems: "center", gap: "8px" }}
                                    >
                                        <span>{company?.mobile || "—"}</span>
                                        {company?.mobile && (
                                            <button
                                                type="button"
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#6366f1",
                                                    cursor: "pointer",
                                                    padding: 0,
                                                }}
                                                onClick={() => copyToClipboard(company.mobile, "Mobile")}
                                            >
                                                <FaCopy style={{ fontSize: "12px" }} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="cp-item">
                                    <div className="cp-label">Account Verification Status</div>
                                    <div className="cp-val">
                                        <span className="es-emp-badge es-emp-badge--active">
                                            <span className="es-emp-status-dot"></span>
                                            {company?.status || "ACTIVE"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="cp-card">
                            <div className="cp-card-header">
                                <div>
                                    <h4 className="cp-card-title">Edit Corporate Information</h4>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                                        Updates will be synchronized across your enterprise credentials
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    style={{ height: "32px", fontSize: "13px" }}
                                    onClick={handleCancel}
                                >
                                    <FaXmark /> Cancel
                                </button>
                            </div>

                            <form
                                onSubmit={handleSubmit(
                                    handleUpdate,
                                    handleValidationError
                                )}
                            >
                                <div className="cp-form-grid">
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            className="cp-form-input"
                                            placeholder="Enter company registered name"
                                            {...register("company_name")}
                                        />
                                        {errors.company_name && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {errors.company_name.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Authorized Contact Person *
                                        </label>
                                        <input
                                            type="text"
                                            className="cp-form-input"
                                            placeholder="Enter contact person name"
                                            {...register("contact_person_name")}
                                        />
                                        {errors.contact_person_name && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {errors.contact_person_name.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Designation / Title *
                                        </label>
                                        <input
                                            type="text"
                                            className="cp-form-input"
                                            placeholder="e.g. Director, Operations Lead"
                                            {...register("designation")}
                                        />
                                        {errors.designation && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {errors.designation.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Official Business Email *
                                        </label>
                                        <input
                                            type="email"
                                            className="cp-form-input"
                                            placeholder="official@company.com"
                                            {...register("email")}
                                        />
                                        {errors.email && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {errors.email.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group" style={{ gridColumn: "1 / -1" }}>
                                        <label className="cp-form-label">
                                            Official Mobile Number (10 digits) *
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            className="cp-form-input"
                                            placeholder="e.g. 9876543210"
                                            {...register("mobile")}
                                        />
                                        {errors.mobile && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {errors.mobile.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="cp-form-footer">
                                    <button
                                        type="button"
                                        className="es-btn es-btn--ghost"
                                        onClick={handleCancel}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="es-btn es-btn--primary"
                                        disabled={isSubmitting}
                                    >
                                        <FaCheck /> {isSubmitting ? "Updating..." : "Save Corporate Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )
                )}

                {/* ── TAB 2: SECURITY & PASSWORD ───────────────────── */}
                {activeTab === "security" && (
                    <div className="cp-security-layout">
                        <div className="cp-card">
                            <div className="cp-card-header">
                                <div>
                                    <h4 className="cp-card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <FaLock style={{ color: "#4f46e5" }} /> Change Corporate Password
                                    </h4>
                                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                                        Ensure your organization login credentials remain safe and up-to-date
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handlePassSubmit(handlePasswordUpdate)}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {/* Current Password */}
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Current Password *
                                        </label>
                                        <div className="cp-input-icon-wrap">
                                            <FaLock className="cp-input-left-icon" />
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                className="cp-form-input cp-input-with-icons"
                                                placeholder="Enter current account password"
                                                {...registerPass("current_password")}
                                            />
                                            <button
                                                type="button"
                                                className="cp-eye-btn"
                                                onClick={() => setShowCurrent(!showCurrent)}
                                                title={showCurrent ? "Hide password" : "Show password"}
                                            >
                                                {showCurrent ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {passErrors.current_password && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {passErrors.current_password.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            New Password *
                                        </label>
                                        <div className="cp-input-icon-wrap">
                                            <FaKey className="cp-input-left-icon" />
                                            <input
                                                type={showNew ? "text" : "password"}
                                                className="cp-form-input cp-input-with-icons"
                                                placeholder="Enter new strong password"
                                                {...registerPass("new_password")}
                                            />
                                            <button
                                                type="button"
                                                className="cp-eye-btn"
                                                onClick={() => setShowNew(!showNew)}
                                                title={showNew ? "Hide password" : "Show password"}
                                            >
                                                {showNew ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {passErrors.new_password && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {passErrors.new_password.message}
                                            </span>
                                        )}

                                        {/* Strength Indicator */}
                                        {newPasswordVal && (
                                            <div className="cp-strength-wrap">
                                                <div className="cp-strength-bar-bg">
                                                    <div
                                                        className="cp-strength-bar-fill"
                                                        style={{ width: strengthWidth, backgroundColor: strengthColor }}
                                                    ></div>
                                                </div>
                                                <div className="cp-strength-meta">
                                                    <span style={{ color: "#64748b" }}>Password Strength:</span>
                                                    <span style={{ color: strengthColor, fontWeight: 700 }}>{strengthLabel}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Requirements Checklist */}
                                        <div className="cp-checklist">
                                            <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                                                Security Requirements:
                                            </div>
                                            <div className={`cp-check-item ${hasMinLength ? "cp-check-item--passed" : ""}`}>
                                                {hasMinLength ? <FaCircleCheck /> : <FaCircleExclamation />}
                                                <span>At least 8 characters long</span>
                                            </div>
                                            <div className={`cp-check-item ${hasUpper ? "cp-check-item--passed" : ""}`}>
                                                {hasUpper ? <FaCircleCheck /> : <FaCircleExclamation />}
                                                <span>At least one uppercase letter (A-Z)</span>
                                            </div>
                                            <div className={`cp-check-item ${hasLower ? "cp-check-item--passed" : ""}`}>
                                                {hasLower ? <FaCircleCheck /> : <FaCircleExclamation />}
                                                <span>At least one lowercase letter (a-z)</span>
                                            </div>
                                            <div className={`cp-check-item ${hasDigit ? "cp-check-item--passed" : ""}`}>
                                                {hasDigit ? <FaCircleCheck /> : <FaCircleExclamation />}
                                                <span>At least one number (0-9)</span>
                                            </div>
                                            <div className={`cp-check-item ${hasSpecial ? "cp-check-item--passed" : ""}`}>
                                                {hasSpecial ? <FaCircleCheck /> : <FaCircleExclamation />}
                                                <span>At least one special symbol (@#$%+!_.-)</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Confirm New Password *
                                        </label>
                                        <div className="cp-input-icon-wrap">
                                            <FaLock className="cp-input-left-icon" />
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                className="cp-form-input cp-input-with-icons"
                                                placeholder="Re-enter your new password"
                                                {...registerPass("confirm_password")}
                                            />
                                            <button
                                                type="button"
                                                className="cp-eye-btn"
                                                onClick={() => setShowConfirm(!showConfirm)}
                                                title={showConfirm ? "Hide password" : "Show password"}
                                            >
                                                {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                        {passErrors.confirm_password && (
                                            <span style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>
                                                {passErrors.confirm_password.message}
                                            </span>
                                        )}
                                        {confirmPasswordVal && !passErrors.confirm_password && (
                                            <span style={{ color: "#059669", fontSize: "12px", marginTop: "4px", display: "flex", alignItems: "center", gap: "5px" }}>
                                                <FaCircleCheck /> Passwords match
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="cp-form-footer">
                                    <button
                                        type="button"
                                        className="es-btn es-btn--ghost"
                                        onClick={() => resetPass()}
                                        disabled={isPassSubmitting}
                                    >
                                        Clear Form
                                    </button>
                                    <button
                                        type="submit"
                                        className="es-btn es-btn--primary"
                                        disabled={isPassSubmitting}
                                    >
                                        <FaKey /> {isPassSubmitting ? "Updating Password..." : "Update Password"}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Security Recommendations Panel */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div className="cp-security-card">
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                                    <div className="cp-stat-icon cp-stat-icon--indigo">
                                        <FaShieldHalved />
                                    </div>
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Account Security</h5>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Enterprise Recommendations</span>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon">
                                        <FaKey />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Use Unique Credentials</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>Avoid reusing passwords across corporate portals or personal services.</div>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                                        <FaCircleCheck />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Confidentiality</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>Never share enterprise credentials with unauthorized personnel.</div>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
                                        <FaTriangleExclamation />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Immediate Escalation</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>If credentials are suspected compromised, update immediately and inform administrator.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="cp-security-card" style={{ background: "#f8fafc" }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "8px" }}>
                                    Session Information
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b", lineHeight: "1.7" }}>
                                    • Logged in as: <strong style={{ color: "#0f172a" }}>{company?.company_name || "Company Admin"}</strong><br />
                                    • Enterprise ID: <strong style={{ color: "#4f46e5" }}>#{companyIdFormatted}</strong><br />
                                    • Status: <span style={{ color: "#059669", fontWeight: 600 }}>Active JWT Authenticated</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProfile;