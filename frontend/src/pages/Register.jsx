import React, { useState } from "react";
import { object, string } from "yup";
import { toast } from "react-toastify";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useRegisterMutation } from "../features/api/apiSlices/userApiSlice";
import { setCredentials } from "../features/authenticate/authSlice";
import { updateLoader } from "../features/loader/loaderSlice";

import registerImg from "../assets/register.webp";
import { UserAuthForm } from "../components/Forms";
import validateForm from "../utils/validateForm";
import { UsernameInput, EmailInput, PasswordInput } from "../components/Inputs";
import SubmitButton from "../components/SubmitButton";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validationSchema = object({
    username: string()
      .required("Username is required.")
      .min(3, "Username must be at least 3 characters long.")
      .max(20, "Username should not be more than 20 characters."),
    email: string().required("Email is required.").email("Invalid Email."),
    password: string()
      .required("Password is required.")
      .min(8, "Password must be at least 8 characters long."),
  });

  const handleOnChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    validateForm(e.target.name, e.target.value, validationSchema, setErrors);
  };

  const { username, email, password } = formData;
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();

      dispatch(updateLoader(40));
      const res = await register(formData).unwrap();
      await dispatch(setCredentials(res.user));

      dispatch(updateLoader(100));
      toast.success("Registered successfully!");
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error(error?.data?.error || "Unexpected Internal Server Error!");
      dispatch(updateLoader(100));
    }
  };

  const hasErrors = Object.values(errors).some((error) => !!error);

  return (
    <section className="w-full h-[90vh] px-6 sm:px-8 md:px-12 flex justify-center items-center">
      <UserAuthForm
        title="Register Now"
        imageTitle="Easy to Use."
        imageSrc={registerImg}
        alt="registration image"
        form={
          <>
            <UsernameInput
              value={username}
              onChange={handleOnChange}
              errors={errors}
            />
            <EmailInput
              value={email}
              onChange={handleOnChange}
              errors={errors}
            />
            <PasswordInput
              value={password}
              onChange={handleOnChange}
              errors={errors}
            />
            <SubmitButton
              isLoading={registerLoading}
              handleSubmit={handleSubmit}
              isDisabled={!email || !password || !username || hasErrors}
            />
          </>
        }
        footer="Already have an account?"
        footerLink="Login"
        footerLinkPath="/login"
      />
    </section>
  );
};

export default Register;
