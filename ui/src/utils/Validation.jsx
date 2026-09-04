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

export const companyNameValidation =  yup
        .string()
        .required("Company name is required")
        .matches(/^[A-Za-z ]{2,}$/, "Company name contain only letters");

export const concatPersonValidation = yup
    .string()
    .required("Contact person is required")
    .matches(/^[A-Za-z ]{2,}$/, "Contact person contain only letters");

export const designationValidation = yup
    .string()
    .required("Designation is required")
    .matches(/^[A-Za-z ]{3,}$/, "Contain only letter");

export const mobileValidation= yup
        .string()
        .required("Mobile is required")
        .matches(/^[6-9]\d{9}$/, "Enter valid number");