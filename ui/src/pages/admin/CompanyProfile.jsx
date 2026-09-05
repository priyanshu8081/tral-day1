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
    FaBriefcase,
} from "react-icons/fa6";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import "../../styles/CompanyProfile.css";
import "../../styles/EmployeeList.css"; // shared premium header / button styles

// Derive backend server origin from the API URL env var
const _apiUrl = import.meta.env.VITE_API_URL || '';
const BACKEND_ORIGIN = _apiUrl ? new URL(_apiUrl).origin : '';
const getLogoSrc = (logoUrl) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    return BACKEND_ORIGIN + logoUrl;
};
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
    const [copiedKey, setCopiedKey] = useState(null);

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
    let strengthWidth = "12%";

    if (newPasswordVal.length > 0) {
        if (passedChecks <= 2) {
            strengthLabel = "Weak";
            strengthColor = "#ef4444";
            strengthWidth = "32%";
        } else if (passedChecks <= 4) {
            strengthLabel = "Medium";
            strengthColor = "#f59e0b";
            strengthWidth = "66%";
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

    const copyToClipboard = (text, keyName, label) => {
        if (!text) return;
        navigator.clipboard.writeText(String(text));
        setCopiedKey(keyName);
        toast.info(`Copied ${label} to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    const copyFullSummary = () => {
        if (!company) return;
        const summary = `
Enterprise: ${company.company_name || "N/A"}
Enterprise ID: #${company.company_id || company.id || "N/A"}
Contact Person: ${company.contact_person_name || "N/A"} (${company.designation || "N/A"})
Email: ${company.email || "N/A"}
Mobile: ${company.mobile || "N/A"}
Status: ${company.status || "Active"}
Staff Count: ${employeeCount}
        `.trim();
        navigator.clipboard.writeText(summary);
        toast.success("Full company profile summary copied to clipboard!");
    };

    const companyIdFormatted = company?.company_id || company?.id || "23";

    return (
        <div className="cp-page">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="cp-container">
                {/* ── PREMIUM GRADIENT HEADER ──────────────────────── */}
                <div className="cp-top-bar" style={{ marginBottom: "10px" }}>
                    <div className="cp-title-wrap">
                        <h2>Company Profile</h2>
                    </div>
                </div>

                {/* ── METRICS & STATS ROW ─────────────────────────── */}
                <div className="cp-stats-grid">
                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--indigo">
                            <FaIdCard />
                        </div>
                        <div className="cp-stat-content">
                            <div className="cp-stat-label">Enterprise ID</div>
                            <div className="cp-stat-val">#{companyIdFormatted}</div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--emerald">
                            <FaCircleCheck />
                        </div>
                        <div className="cp-stat-content">
                            <div className="cp-stat-label">Verification</div>
                            <div className="cp-stat-val" style={{ color: "#059669" }}>
                                {company?.status ? company.status.toUpperCase() : "ACTIVE"}
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--purple">
                            <FaUsers />
                        </div>
                        <div className="cp-stat-content">
                            <div className="cp-stat-label">Staff Managed</div>
                            <div className="cp-stat-val">{employeeCount} Employees</div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--amber">
                            <FaCalendarDays />
                        </div>
                        <div className="cp-stat-content">
                            <div className="cp-stat-label">Member Since</div>
                            <div className="cp-stat-val">
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

                {/* ── SEGMENTED NAVIGATION TABS ───────────────────── */}
                <div className="cp-tab-container">
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
                </div>

                {/* ── TAB 1: CORPORATE INFORMATION ─────────────────── */}
                {activeTab === "info" && (
                    !isEdit ? (
                        <div className="cp-card">
                            {/* ── PREMIUM PROFILE HERO BANNER ── */}
                            <div className="cp-profile-hero">
                                <div className="cp-profile-hero__left">
                                    <div className="cp-profile-hero__logo">
                                        {company && company.logo_url ? (
                                            <img
                                                src={getLogoSrc(company.logo_url)}
                                                alt={company.company_name || 'Company Logo'}
                                                className="cp-profile-hero__logo-img"
                                                onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.querySelector('.cp-profile-hero__logo-fallback').style.display = 'flex'; }}
                                            />
                                        ) : null}
                                        <div className="cp-profile-hero__logo-fallback" style={{ display: company?.logo_url ? 'none' : 'flex' }}>
                                            {(company?.company_name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className="cp-profile-hero__info">
                                        <h4 className="cp-profile-hero__title">Corporate Information</h4>
                                        <span className="cp-profile-hero__sub">Official verified enterprise business details and contacts</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    style={{ height: "34px", fontSize: "13px" }}
                                    onClick={handleEdit}
                                >
                                    <FaPen style={{ fontSize: "11px" }} /> Edit Info
                                </button>
                            </div>

                            {/* Balanced 2-column layout without nested box borders */}
                            <div className="cp-grid-symmetric">
                                {/* Group 1: Organization Legal Details */}
                                <div className="cp-group-box">
                                    <div className="cp-section-title">
                                        <FaBuilding style={{ color: "#6366f1" }} /> Organization Profile
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Company Legal Name</div>
                                            <div className="cp-field-value">{company?.company_name || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Enterprise ID Code</div>
                                            <div className="cp-field-value">#{companyIdFormatted}</div>
                                        </div>
                                        <div className="cp-field-action">
                                            <button
                                                type="button"
                                                className="cp-copy-icon-btn"
                                                title="Copy ID"
                                                onClick={() => copyToClipboard(companyIdFormatted, "card-id", "Company ID")}
                                            >
                                                {copiedKey === "card-id" ? (
                                                    <FaCheck style={{ fontSize: "12px", color: "#059669" }} />
                                                ) : (
                                                    <FaCopy style={{ fontSize: "12px" }} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Account Verification</div>
                                            <div className="cp-field-value">
                                                <span className="cp-status-pill">
                                                    <span className="cp-pulse-dot"></span>
                                                    <span>{company?.status ? company.status.toUpperCase() : "VERIFIED ACTIVE"}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Group 2: Executive Contact Details */}
                                <div className="cp-group-box">
                                    <div className="cp-section-title">
                                        <FaUser style={{ color: "#6366f1" }} /> Authorized Representative
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Contact Person</div>
                                            <div className="cp-field-value">{company?.contact_person_name || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Designation / Role</div>
                                            <div className="cp-field-value">{company?.designation || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Official Email</div>
                                            <div className="cp-field-value" style={{ color: "#4f46e5" }}>
                                                {company?.email || "—"}
                                            </div>
                                        </div>
                                        {company?.email && (
                                            <div className="cp-field-action">
                                                <button
                                                    type="button"
                                                    className="cp-copy-icon-btn"
                                                    title="Copy Email"
                                                    onClick={() => copyToClipboard(company.email, "card-email", "Email")}
                                                >
                                                    {copiedKey === "card-email" ? (
                                                        <FaCheck style={{ fontSize: "12px", color: "#059669" }} />
                                                    ) : (
                                                        <FaCopy style={{ fontSize: "12px" }} />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="cp-field-row">
                                        <div className="cp-field-meta">
                                            <div className="cp-field-label">Official Mobile</div>
                                            <div className="cp-field-value" style={{ color: "#4f46e5" }}>
                                                {company?.mobile || "—"}
                                            </div>
                                        </div>
                                        {company?.mobile && (
                                            <div className="cp-field-action">
                                                <button
                                                    type="button"
                                                    className="cp-copy-icon-btn"
                                                    title="Copy Mobile"
                                                    onClick={() => copyToClipboard(company.mobile, "card-phone", "Mobile")}
                                                >
                                                    {copiedKey === "card-phone" ? (
                                                        <FaCheck style={{ fontSize: "12px", color: "#059669" }} />
                                                    ) : (
                                                        <FaCopy style={{ fontSize: "12px" }} />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Executive Summary Strip */}
                            <div className="cp-summary-strip">
                                <div className="cp-summary-text">
                                    <FaShieldHalved style={{ fontSize: "16px" }} />
                                    <span>Enterprise credentials verified & synchronized across all services.</span>
                                </div>
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    style={{ height: "32px", fontSize: "12px" }}
                                    onClick={copyFullSummary}
                                >
                                    <FaCopy /> Copy Full Summary
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="cp-card">
                            <div className="cp-card-header">
                                <div>
                                    <h4 className="cp-card-title">Edit Corporate Information</h4>
                                    <span className="cp-card-subtitle">
                                        Updates will be synchronized across your enterprise credentials
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    style={{ height: "34px", fontSize: "13px" }}
                                    onClick={handleCancel}
                                >
                                    <FaXmark /> Cancel
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(handleUpdate, handleValidationError)}>
                                <div className="cp-form-grid-symmetric">
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            <FaBuilding style={{ color: "#6366f1" }} /> Company Registered Name *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaBuilding className="cp-input-icon" />
                                            <input
                                                type="text"
                                                className={`cp-form-input ${errors.company_name ? "cp-input--error" : ""}`}
                                                placeholder="Enter registered company name"
                                                {...register("company_name")}
                                            />
                                        </div>
                                        {errors.company_name && (
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {errors.company_name.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            <FaUser style={{ color: "#6366f1" }} /> Authorized Contact Person *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaUser className="cp-input-icon" />
                                            <input
                                                type="text"
                                                className={`cp-form-input ${errors.contact_person_name ? "cp-input--error" : ""}`}
                                                placeholder="Full name of representative"
                                                {...register("contact_person_name")}
                                            />
                                        </div>
                                        {errors.contact_person_name && (
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {errors.contact_person_name.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            <FaBriefcase style={{ color: "#6366f1" }} /> Corporate Designation / Title *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaBriefcase className="cp-input-icon" />
                                            <input
                                                type="text"
                                                className={`cp-form-input ${errors.designation ? "cp-input--error" : ""}`}
                                                placeholder="e.g. Managing Director, Operations Lead"
                                                {...register("designation")}
                                            />
                                        </div>
                                        {errors.designation && (
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {errors.designation.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            <FaEnvelope style={{ color: "#6366f1" }} /> Official Corporate Email *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaEnvelope className="cp-input-icon" />
                                            <input
                                                type="email"
                                                className={`cp-form-input ${errors.email ? "cp-input--error" : ""}`}
                                                placeholder="official@company.com"
                                                {...register("email")}
                                            />
                                        </div>
                                        {errors.email && (
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {errors.email.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cp-form-group cp-form-group--full">
                                        <label className="cp-form-label">
                                            <FaPhone style={{ color: "#6366f1" }} /> Official Mobile Number (10 digits) *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaPhone className="cp-input-icon" />
                                            <input
                                                type="text"
                                                maxLength={10}
                                                className={`cp-form-input ${errors.mobile ? "cp-input--error" : ""}`}
                                                placeholder="e.g. 9876543210"
                                                {...register("mobile")}
                                            />
                                        </div>
                                        {errors.mobile && (
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {errors.mobile.message}
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
                                        <FaCheck /> {isSubmitting ? "Saving Changes..." : "Save Corporate Changes"}
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
                                    <span className="cp-card-subtitle">
                                        Ensure your organization login credentials remain protected
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={handlePassSubmit(handlePasswordUpdate)}>
                                <div className="cp-password-stack">
                                    {/* Current Password */}
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            Current Password *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaLock className="cp-input-icon" />
                                            <input
                                                type={showCurrent ? "text" : "password"}
                                                className={`cp-form-input ${passErrors.current_password ? "cp-input--error" : ""}`}
                                                style={{ paddingRight: "44px" }}
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
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {passErrors.current_password.message}
                                            </span>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div className="cp-form-group">
                                        <label className="cp-form-label">
                                            New Password *
                                        </label>
                                        <div className="cp-input-wrap">
                                            <FaKey className="cp-input-icon" />
                                            <input
                                                type={showNew ? "text" : "password"}
                                                className={`cp-form-input ${passErrors.new_password ? "cp-input--error" : ""}`}
                                                style={{ paddingRight: "44px" }}
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
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {passErrors.new_password.message}
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
                                        <div className="cp-input-wrap">
                                            <FaLock className="cp-input-icon" />
                                            <input
                                                type={showConfirm ? "text" : "password"}
                                                className={`cp-form-input ${passErrors.confirm_password ? "cp-input--error" : ""}`}
                                                style={{ paddingRight: "44px" }}
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
                                            <span className="cp-error-msg">
                                                <FaCircleExclamation /> {passErrors.confirm_password.message}
                                            </span>
                                        )}
                                        {confirmPasswordVal && !passErrors.confirm_password && (
                                            <span style={{ color: "#059669", fontSize: "12px", marginTop: "5px", display: "flex", alignItems: "center", gap: "5px", fontWeight: 600 }}>
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

                        {/* Security Recommendations Sidebar */}
                        <div className="cp-security-sidebar">
                            <div className="cp-security-card">
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
                                    <div className="cp-stat-icon cp-stat-icon--indigo">
                                        <FaShieldHalved />
                                    </div>
                                    <div>
                                        <h5 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>Enterprise Security</h5>
                                        <span style={{ fontSize: "12px", color: "#64748b" }}>Authentication Best Practices</span>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon">
                                        <FaKey />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Unique Credentials</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>Never reuse corporate credentials across external portals or personal services.</div>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon" style={{ background: "#ecfdf5", color: "#059669" }}>
                                        <FaCircleCheck />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Strict Confidentiality</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>Keep administrative login passwords strictly confidential to authorized staff.</div>
                                    </div>
                                </div>

                                <div className="cp-security-tip-item">
                                    <div className="cp-security-tip-icon" style={{ background: "#fffbeb", color: "#d97706" }}>
                                        <FaTriangleExclamation />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Immediate Escalation</div>
                                        <div style={{ fontSize: "12px", color: "#64748b" }}>If any unauthorized access is suspected, change password immediately.</div>
                                    </div>
                                </div>
                            </div>

                            <div className="cp-security-card" style={{ background: "#f8fafc" }}>
                                <div style={{ fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "10px" }}>
                                    Active Session Info
                                </div>
                                <div style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.8" }}>
                                    • Organization: <strong style={{ color: "#0f172a" }}>{company?.company_name || "Company Admin"}</strong><br />
                                    • Enterprise ID: <strong style={{ color: "#4f46e5" }}>#{companyIdFormatted}</strong><br />
                                    • Status: <span style={{ color: "#059669", fontWeight: 700 }}>Active JWT Authenticated</span>
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