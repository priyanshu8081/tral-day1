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
    FaArrowLeft
} from "react-icons/fa6";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import "../../styles/CompanyProfile.css";
import {
    getCompanyProfile,
    editCompanyProfile,
} from "../../services/AdminServices";
import { ToastService } from "../../utils/ToastUtils";
import { companyNameValidation, concatPersonValidation, designationValidation, emailValidation, mobileValidation } from "../../utils/Validation";

const schema = yup.object().shape({
    company_name: companyNameValidation,
    contact_person_name:concatPersonValidation,
    designation:designationValidation,
    email: emailValidation,
    mobile: mobileValidation,
});

const CompanyProfile = () => {
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [isEdit, setIsEdit] = useState(false);

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
        try {
            const res = await getCompanyProfile();
            const companyData = res?.data?.data;
            setCompany(companyData);
            populateForm(companyData);
        } catch (error) {
            ToastService.handleApiError(error);
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
            const res = await editCompanyProfile(data);
            if (res?.data?.success === true) {
                ToastService.success(
                    res?.data?.message || "Company profile updated successfully!"
                );
                setCompany(res?.data?.data || { ...company, ...data });
                setIsEdit(false);
            } else {
                ToastService.error(
                    res?.data?.message || "Unable to update company profile"
                );
            }
        } catch (error) {
            ToastService.handleApiError(error);
        }
    };

    const handleValidationError = (formErrors) => {
        const firstError = Object.values(formErrors)[0];
        if (firstError?.message) {
            ToastService.error(firstError.message);
        }
    };

    const initials = (company?.company_name || "ES")
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className="cp-page">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="cp-container">
                {/* ── TOP BAR ─────────────────────────────────────── */}
                <div className="cp-top-bar">
                    <div className="cp-title-wrap">
                        <h2>Company Profile</h2>
                        <p>Manage and view your registered enterprise credentials</p>
                    </div>

                    <button
                        type="button"
                        className="es-btn es-btn--ghost"
                        onClick={() => navigate("/dashboard")}
                    >
                        <FaArrowLeft /> Dashboard
                    </button>
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
                                        Company ID: {company?.company_id || "ES-1002"}
                                    </span>
                                    <span>•</span>
                                    <span
                                        className="es-emp-badge es-emp-badge--active"
                                        style={{ padding: "3px 9px", fontSize: "11px" }}
                                    >
                                        <span className="es-emp-status-dot"></span>
                                        {company?.status || "Verified Account"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            {!isEdit ? (
                                <button
                                    type="button"
                                    className="es-btn es-btn--primary"
                                    onClick={handleEdit}
                                >
                                    <FaPen /> Edit Company Info
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="es-btn es-btn--ghost"
                                    onClick={handleCancel}
                                >
                                    <FaXmark /> Cancel Editing
                                </button>
                            )}
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
                                #{company?.company_id || "1002"}
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
                                {company?.status || "Active"}
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--purple">
                            <FaUser />
                        </div>
                        <div>
                            <div className="cp-stat-label">Authorized Contact</div>
                            <div className="cp-stat-val" style={{ fontSize: "15px" }}>
                                {company?.contact_person_name || "Representative"}
                            </div>
                        </div>
                    </div>

                    <div className="cp-stat-card">
                        <div className="cp-stat-icon cp-stat-icon--amber">
                            <FaCalendarDays />
                        </div>
                        <div>
                            <div className="cp-stat-label">Registered Date</div>
                            <div className="cp-stat-val" style={{ fontSize: "14px" }}>
                                {company?.created_at
                                    ? new Date(company.created_at).toLocaleDateString()
                                    : "Active Client"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CARD: VIEW OR EDIT ──────────────────────────── */}
                {!isEdit ? (
                    <div className="cp-card">
                        <div className="cp-card-header">
                            <h4 className="cp-card-title">Corporate Information</h4>
                            <button
                                type="button"
                                className="es-btn es-btn--ghost"
                                style={{ height: "30px", fontSize: "12px" }}
                                onClick={handleEdit}
                            >
                                <FaPen style={{ fontSize: "11px" }} /> Edit
                            </button>
                        </div>

                        <div className="cp-grid">
                            <div className="cp-item">
                                <div className="cp-label">Company Name</div>
                                <div className="cp-val">
                                    {company?.company_name || "—"}
                                </div>
                            </div>

                            <div className="cp-item">
                                <div className="cp-label">Contact Person Name</div>
                                <div className="cp-val">
                                    {company?.contact_person_name || "—"}
                                </div>
                            </div>

                            <div className="cp-item">
                                <div className="cp-label">Designation</div>
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
                                    style={{ color: "var(--primary)" }}
                                >
                                    {company?.email || "—"}
                                </div>
                            </div>

                            <div className="cp-item">
                                <div className="cp-label">
                                    <FaPhone /> Contact Mobile
                                </div>
                                <div
                                    className="cp-val"
                                    style={{ color: "var(--primary)" }}
                                >
                                    {company?.mobile || "—"}
                                </div>
                            </div>

                            <div className="cp-item">
                                <div className="cp-label">Account Status</div>
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
                            <h4 className="cp-card-title">Edit Corporate Information</h4>
                            <span style={{ fontSize: "13px", color: "#64748b" }}>
                                Updates will be reflected across your company account
                            </span>
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
                                        Contact Person Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="cp-form-input"
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
                                        Designation *
                                    </label>
                                    <input
                                        type="text"
                                        className="cp-form-input"
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
                                        Official Email *
                                    </label>
                                    <input
                                        type="email"
                                        className="cp-form-input"
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
                                        Contact Mobile (10 digits) *
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={10}
                                        className="cp-form-input"
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
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="es-btn es-btn--primary"
                                    disabled={isSubmitting}
                                >
                                    <FaCheck /> {isSubmitting ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyProfile;