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
        identifier: yup.string().required(),
        password: yup.string().required()
            .matches(/[A-Z]/,"atleast one uppercase")
            .matches(/[a-z]/,"Atleast should be contain one lowercase")
            .matches(/[\d]/,"should be contain one digits")
            .matches(/[@#$%+_-]/,"alteast one one special symbol").min(8, "minimum 8 digit password"),
    })

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });
    const handleLogin = async (data) => {
        try {
            const res = await axios.post(
                'https://app.elationsoft.net/api/companies/login',
                data
            );
            if (res?.data?.success) {
                toast.success(res?.data?.message);
                localStorage.setItem('token', res?.data?.data?.token);
                navigate('/dashboard');
            }

        } catch (err) {
            toast.error(
                err?.response?.data?.message || "Login failed"
            );
        }
    };
    return (
        <div className="container-fluid">
            <ToastContainer />
            <div className="row mt-2 mt-lg-5">
                <div className="col-12 col-md-6 col-lg-6  mb-lg-4 mb-md-0 text-center">
                    <img src="login.jpg" className="img-fluid w-100"
                        style={{
                            height: "600px",
                            maxHeight: "70vh",
                            objectFit: "contain"
                        }} alt="" />
                </div>
                <div className="col-md-6 col-lg-4 col-12 mt-2 mt-lg-3">
                    <h1 className='text-center' >!Login <span className='text-success' >Here</span></h1>
                    <form onSubmit={handleSubmit(handleLogin)} >
                        <input {...register('identifier')} type="text" placeholder='Enter your Email || Password' className='form-control mb-2' />
                        {errors?.identifier && <p className='text-danger mb-2' >{errors?.identifier?.message}</p>}
                        <input {...register('password')} type="password" placeholder='Enter your Password' className='form-control mb-2' />
                        {errors?.password && <p className='text-danger mb-2' >{errors?.password?.message}</p>}
                        <input type="submit" className='form-control mb-2 btn btn-danger' />
                        <p className='mt-2 '>Not a member? <Link className='text-decoration-none' to='/register'>Singup now</Link> </p>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
