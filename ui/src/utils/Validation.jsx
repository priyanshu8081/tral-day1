import *as yup from 'yup';

export const emailValidation = yup
    .string()
    .required()
    .matches(/^[A-Za-z\d%&+_-]+@[A-Za-z\d.]+\.[A-Za-z]{2,}$/, "enter valid email");

export const passwordValidation = yup.string().required()
    .matches(/[A-Z]/, "atleast one uppercase")
    .matches(/[a-z]/, "Atleast should be contain one lowercase")
    .matches(/[\d]/, "should be contain one digits")
    .matches(/[@#$%+_-]/, "alteast one one special symbol").min(8, "minimum 8 digit password");