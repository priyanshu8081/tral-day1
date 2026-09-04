import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaXmark } from "react-icons/fa6";

import { emailValidation } from "../../utils/Validation";

import {
    createCustomer,
    editCustomer
} from "../../services/UserServices";

import { ToastService } from "../../utils/ToastUtils";
import { ToastContainer } from "react-toastify";


const schema = yup.object().shape({

    customer_name: yup
        .string()
        .required("Customer name is required")
        .matches(
            /^[A-Za-z]{3,}(?:\s[A-Za-z]+)*$/,
            "Customer name should contain only letters"
        ),

    email: emailValidation,

    phone: yup
        .string()
        .required("Phone number is required")
        .matches(
            /^[6-9]\d{9}$/,
            "Enter valid number"
        ),

    alternate_phone: yup
        .string()
        .required("Alternate phone is required")
        .matches(
            /^[6-9]\d{9}$/,
            "Enter valid number"
        ),

    address_line1: yup
        .string()
        .required("Address is required")
        .matches(
            /^[a-zA-Z0-9\s,./#-]+$/,
            "Enter valid address"
        ),

    address_line2: yup
        .string(),

    city: yup
        .string()
        .matches(
            /^[A-Za-z]{3,}$/,
            "Enter valid city name"
        )
        .required("City is required"),

    state: yup
        .string()
        .required("State is required")
        .matches(
            /^[A-Za-z ]{3,}$/,
            "Enter valid state name"
        ),

    pincode: yup
        .string()
        .required("Pincode is required")
        .matches(
            /^[0-9]{6}$/,
            "Enter valid pincode"
        ),

    gstin_number: yup
        .string()
        .required("GST number is required")
        .matches(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[A-Z0-9]{1}$/,
            "Enter a valid GST number"
        )
        .uppercase(),

});


const AddProduct = ({ onClose, onSuccess, editData }) => {

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
    });


    // =========================
    // EDIT DATA FORM ME FILL
    // =========================

    useEffect(() => {

        if (editData) {

            setValue(
                "customer_name",
                editData?.customer_name || ""
            );

            setValue(
                "email",
                editData?.email || ""
            );

            setValue(
                "phone",
                editData?.phone || ""
            );

            setValue(
                "alternate_phone",
                editData?.alternate_phone || ""
            );

            setValue(
                "address_line1",
                editData?.address_line1 || ""
            );

            setValue(
                "address_line2",
                editData?.address_line2 || ""
            );

            setValue(
                "city",
                editData?.city || ""
            );

            setValue(
                "state",
                editData?.state || ""
            );

            setValue(
                "pincode",
                editData?.pincode || ""
            );

            setValue(
                "gstin_number",
                editData?.gstin_number || ""
            );

        }

    }, [editData, setValue]);


    // =========================
    // ADD / EDIT CUSTOMER
    // =========================

    const handleCustomer = async (data) => {

        setIsSubmitting(true);

        try {

            let res;

            // =========================
            // EDIT
            // =========================

            if (editData) {

                res = await editCustomer(
                    editData.id,
                    data
                );

            }

            // =========================
            // CREATE
            // =========================

            else {

                res = await createCustomer(data);

            }


            // =========================
            // SUCCESS
            // =========================

            if (res?.data?.success === true) {

                ToastService.success(
                    res?.data?.message ||
                    (
                        editData
                            ? "Customer updated successfully!"
                            : "Customer added successfully!"
                    )
                );

                if (onSuccess) {
                    onSuccess();
                }

            }

            // =========================
            // API ERROR
            // =========================

            else {

                ToastService.error(
                    res?.data?.message ||
                    "Something went wrong"
                );

            }

        }

        catch (error) {

            console.log(
                "API ERROR:",
                error?.response?.data || error
            );

            ToastService.handleApiError(error);

        }

        finally {

            setIsSubmitting(false);

        }

    };


    return (

        <div
            className="es-modal-overlay"
            onClick={onClose}
        >

            <ToastContainer />


            <div
                className="es-modal"
                onClick={(e) => e.stopPropagation()}
            >


                {/* =========================
                    HEADER
                ========================= */}

                <div className="es-modal__header">

                    <div>

                        <div className="es-modal__title">

                            {editData
                                ? "Edit Customer"
                                : "Add Customer"
                            }

                        </div>


                        <div className="es-modal__sub">

                            {editData
                                ? "Update customer profile"
                                : "Create a new customer profile"
                            }

                        </div>

                    </div>


                    <button
                        type="button"
                        className="es-modal__close"
                        onClick={onClose}
                    >

                        <FaXmark />

                    </button>

                </div>


                {/* =========================
                    BODY
                ========================= */}

                <div className="es-modal__body">

                    <form
                        id="customerForm"
                        onSubmit={handleSubmit(handleCustomer)}
                    >


                        <div className="es-modal-form-grid">


                            {/* CUSTOMER NAME */}

                            <div>

                                <label className="es-modal__label">
                                    Customer Name
                                </label>

                                <input
                                    {...register("customer_name")}
                                    type="text"
                                    placeholder="Enter customer name"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.customer_name && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.customer_name.message}
                                    </p>

                                )}

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="es-modal__label">
                                    Email
                                </label>

                                <input
                                    {...register("email")}
                                    type="text"
                                    placeholder="Enter email"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.email && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.email.message}
                                    </p>

                                )}

                            </div>


                            {/* PHONE */}

                            <div>

                                <label className="es-modal__label">
                                    Mobile Number
                                </label>

                                <input
                                    {...register("phone")}
                                    type="text"
                                    placeholder="Enter first mobile"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.phone && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.phone.message}
                                    </p>

                                )}

                            </div>


                            {/* ALTERNATE PHONE */}

                            <div>

                                <label className="es-modal__label">
                                    Alternate Mobile
                                </label>

                                <input
                                    {...register("alternate_phone")}
                                    type="text"
                                    placeholder="Enter second number"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.alternate_phone && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.alternate_phone.message}
                                    </p>

                                )}

                            </div>


                            {/* ADDRESS 1 */}

                            <div
                                style={{
                                    gridColumn: "1 / -1"
                                }}
                            >

                                <label className="es-modal__label">
                                    Address Line 1
                                </label>

                                <input
                                    {...register("address_line1")}
                                    type="text"
                                    placeholder="Enter first address line"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.address_line1 && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.address_line1.message}
                                    </p>

                                )}

                            </div>


                            {/* ADDRESS 2 */}

                            <div
                                style={{
                                    gridColumn: "1 / -1"
                                }}
                            >

                                <label className="es-modal__label">
                                    Address Line 2 (Optional)
                                </label>

                                <input
                                    {...register("address_line2")}
                                    type="text"
                                    placeholder="Enter second address line"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.address_line2 && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.address_line2.message}
                                    </p>

                                )}

                            </div>


                            {/* CITY */}

                            <div>

                                <label className="es-modal__label">
                                    City
                                </label>

                                <input
                                    {...register("city")}
                                    type="text"
                                    placeholder="Enter city"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.city && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.city.message}
                                    </p>

                                )}

                            </div>


                            {/* STATE */}

                            <div>

                                <label className="es-modal__label">
                                    State
                                </label>

                                <input
                                    {...register("state")}
                                    type="text"
                                    placeholder="Enter state"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.state && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.state.message}
                                    </p>

                                )}

                            </div>


                            {/* PINCODE */}

                            <div>

                                <label className="es-modal__label">
                                    Pincode
                                </label>

                                <input
                                    {...register("pincode")}
                                    type="text"
                                    placeholder="Enter pincode"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.pincode && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.pincode.message}
                                    </p>

                                )}

                            </div>


                            {/* GST */}

                            <div>

                                <label className="es-modal__label">
                                    GSTIN Number
                                </label>

                                <input
                                    {...register("gstin_number")}
                                    type="text"
                                    placeholder="Enter GST number"
                                    className="es-input"
                                    style={{ width: "100%" }}
                                />

                                {errors?.gstin_number && (

                                    <p
                                        style={{
                                            color: "var(--danger)",
                                            fontSize: "12px",
                                            marginTop: "4px"
                                        }}
                                    >
                                        {errors.gstin_number.message}
                                    </p>

                                )}

                            </div>


                        </div>

                    </form>

                </div>


                {/* =========================
                    FOOTER
                ========================= */}

                <div className="es-modal__footer">

                    <button
                        type="button"
                        className="es-btn es-btn--ghost"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        form="customerForm"
                        className="es-btn es-btn--primary"
                        disabled={isSubmitting}
                    >

                        {isSubmitting
                            ? "Saving..."
                            : editData
                                ? "Update Customer"
                                : "Save Customer"
                        }

                    </button>

                </div>


            </div>

        </div>

    );

};

export default AddProduct;