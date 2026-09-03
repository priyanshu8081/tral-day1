
import React from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { emailValidation } from '../utils/Validation';

const schema = yup
    .object()
    .shape({
        customer_name: yup.string().required().matches(/^[A-Za-z]{3,}(?:\s[A-Za-z]+)*$/,"company name should contain only letters"),
        email: emailValidation,
        phone: yup.string().required().matches(/^[6-9]\d{9}$/, "enter valid number"),
        alternate_phone: yup.string().required().matches(/^[6-9]\d{9}$/, "enter valid number"),
        address_line1: yup.string().required().matches(/^[a-zA-Z0-9\s,./#-]+$/,"enter valid address"),
        address_line2: yup.string(),
        city: yup.string().matches(/^[A-Za-z]{3,}$/,"enter valid  city name").required(),
        state: yup.string().required().matches(/^[A-Za-z ]{3,}$/,"enter valid state name"),
        pincode: yup.string().required().matches(/^[0-9]{6}$/,"enter valid pincode"),
        gstin_number: yup.string().required().matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[A-Z0-9]{1}$/,"Enter a valid gst number").uppercase(),
    })

const AddProduct = () => {
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const handleCustomer = async (data) => {
        try {
            const token = localStorage.getItem('token');

            const res = await axios.post(
                'https://app.elationsoft.net/api/customer/create',
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            if (res?.data?.success === true) {
                toast.success(res?.data?.message);
                navigate('/listProduct')
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Something went wrong"
            );
        }
    }

    return (
        <div className="container-fluid px-3 px-md-4 px-lg-5">
            <ToastContainer />

            <div className="row mt-2 mt-lg-4 align-items-center">

                <div className="col-12 col-md-6 col-lg-6  mb-lg-4 mb-md-0 text-center">
                    <img
                        className="img-fluid w-100"
                        style={{
                            height: "600px",
                            maxHeight: "70vh",
                            objectFit: "contain"
                        }}
                        src="customer.jpg"
                        alt="add customer image"
                    />
                </div>

                <div className="col-12 col-md-6  col-lg-6">
                    <div className="w-100 px-0 px-md-2 px-lg-4 mt-0 mt-lg-5 mb-lg-3">

                        <h1 className="text-start my-lg-3 my-2 fs-2 fs-md-1">
                            !Add <span className="text-success">Customer</span>
                        </h1>

                        <form onSubmit={handleSubmit(handleCustomer)}>

                            {/* customer name */}
                            <input
                                {...register('customer_name')}
                                type="text"
                                placeholder="Enter your customer name"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.customer_name &&
                                <p className="text-danger mb-2">
                                    {errors?.customer_name?.message}
                                </p>
                            }

                            {/* customer address 1 */}
                            <input
                                {...register('address_line1')}
                                type="text"
                                placeholder="Enter First address line"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.address_line1 &&
                                <p className="text-danger mb-2">
                                    {errors?.address_line1?.message}
                                </p>
                            }

                            {/* customer address 2 */}
                            <input
                                {...register('address_line2')}
                                type="text"
                                placeholder="Enter Second address line"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.address_line2 &&
                                <p className="text-danger mb-2">
                                    {errors?.address_line2?.message}
                                </p>
                            }

                            {/* phone */}
                            <input
                                {...register('phone')}
                                type="text"
                                placeholder="Enter your first mobile"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.phone &&
                                <p className="text-danger mb-2">
                                    {errors?.phone?.message}
                                </p>
                            }

                            {/* alternate phone */}
                            <input
                                type="text"
                                {...register('alternate_phone')}
                                placeholder="Enter your second number"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.alternate_phone &&
                                <p className="text-danger mb-2">
                                    {errors?.alternate_phone?.message}
                                </p>
                            }

                            {/* email */}
                            <input
                                {...register('email')}
                                type="text"
                                placeholder="Enter your email"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.email &&
                                <p className="text-danger mb-2">
                                    {errors?.email?.message}
                                </p>
                            }

                            {/* city */}
                            <input
                                {...register('city')}
                                type="text"
                                placeholder="Enter your City"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.city &&
                                <p className="text-danger mb-2">
                                    {errors?.city?.message}
                                </p>
                            }

                            {/* state */}
                            <input
                                {...register('state')}
                                type="text"
                                placeholder="Enter your State"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.state &&
                                <p className="text-danger mb-2">
                                    {errors?.state?.message}
                                </p>
                            }

                            {/* pinCode */}
                            <input
                                {...register('pincode')}
                                type="text"
                                placeholder="Enter your Pin code"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.pincode &&
                                <p className="text-danger mb-2">
                                    {errors?.pincode?.message}
                                </p>
                            }

                            {/* gstNumber */}
                            <input
                                {...register('gstin_number')}
                                type="text"
                                placeholder="Enter your Gst number"
                                className="form-control mb-2 w-100"
                            />
                            {errors?.gstin_number &&
                                <p className="text-danger mb-2">
                                    {errors?.gstin_number?.message}
                                </p>
                            }

                            <input
                                type="submit"
                                className="form-control mb-2 btn btn-danger w-100"
                            />
                        </form>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddProduct