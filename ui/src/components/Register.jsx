import React from 'react'
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
const schema = yup
    .object()
    .shape({
        company_name: yup.string().required().matches(/^[A-Za-z ]{2,}$/, "company name  contain only letters"),
        contact_person_name: yup.string().required().matches(/^[A-Za-z ]{2,}$/, "company name  contain only letters"),
        designation: yup.string().required().matches(/^[A-Za-z ]{3,}$/,"contain only letter"),
        email: yup.string().required().matches(/^[A-Za-z\d%&+_-]+@[A-Za-z\d.]+\.[A-Za-z]{2,}$/,"enter valid email"),
        mobile: yup.string().required().matches(/^[6-9]\d{9}$/, "enter valid number"),
        logo: yup.mixed(),
        password: yup.string().required()
            .matches(/[A-Z]/, "atleast one uppercase")
            .matches(/[a-z]/, "Atleast should be contain one lowercase")
            .matches(/[\d]/, "should be contain one digits")
            .matches(/[@#$%+_-]/, "alteast one one special symbol").min(8, "minimum 8 digit password"),
    })

const Register = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const handleRegister = async (data) => {
        const formData = new FormData();
        formData.append('company_name', data?.company_name);
        formData.append('contact_person_name', data?.contact_person_name);
        formData.append('designation', data?.designation);
        formData.append('email', data?.email);
        formData.append('mobile', data?.mobile);
        formData.append('password', data?.password);
        if (data?.logo?.[0]) {
            formData.append("logo", data.logo[0]);
        }
        try {
            const res = await axios.post(
                'https://app.elationsoft.net/api/companies',
                formData
            );
            if (res?.data?.success === true) {
                toast.success(res?.data?.message);
                navigate('/');
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
        <div className="container-fluid">
            <ToastContainer />
            <div className="row mt-2 mt-lg-4">
                <div className="col-lg-6 col-12 col-md-6">
                    <img src="register.jpg" alt="register image" className="img-fluid w-100"
                        style={{
                            height: "600px",
                            maxHeight: "70vh",
                            objectFit: "contain"
                        }} />
                </div>
                <div className="col-md-5 col-lg-5 col-12 mt-2 mt-lg-4">
                    <h1 className='text-center' >!Registration<span className='text-success' > Form</span></h1>
                    <form onSubmit={handleSubmit(handleRegister)} >
                        <input {...register('company_name')} type="text" placeholder='Enter your company name' className='form-control mb-2' />
                        {errors?.company_name && <p className='text-danger mb-2' >{errors?.company_name?.message}</p>}
                        <input {...register('contact_person_name')} type="text" placeholder='Enter your contact_person_name' className='form-control mb-2' />
                        {errors?.contact_person_name && <p className='text-danger mb-2' >{errors?.contact_person_name?.message}</p>}

                        <input {...register('designation')} type="text" placeholder='Enter your designation' className='form-control mb-2' />
                        {errors?.designation && <p className='text-danger mb-2' >{errors?.designation?.message}</p>}
                        <input {...register('mobile')} type="text" placeholder='Enter your mobile' className='form-control mb-2' />
                        {errors?.mobile && <p className='text-danger mb-2' >{errors?.mobile?.message}</p>}

                        <input {...register('email')} type="text" placeholder='Enter your email' className='form-control mb-2' />
                        {errors?.email && <p className='text-danger mb-2' >{errors?.email?.message}</p>}
                        <input {...register('password')} type="text" placeholder='Enter your password' className='form-control mb-2' />
                        {errors?.password && <p className='text-danger mb-2' >{errors?.password?.message}</p>}
                        <input type="file" {...register('logo')} className='form-control mb-2' />
                        <input type="submit" className='form-control mb-2 btn btn-danger' />
                        <p className='mt-2 '>Already have account ? <Link className='text-decoration-none' to='/'>Singin now</Link> </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
