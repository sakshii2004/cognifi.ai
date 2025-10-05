import React, { useState } from "react";
import { object, string } from "yup";
import { toast } from "react-toastify";
import { useGenAIStore } from "../store/useGenAIStore";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { useLoginMutation } from "../features/api/apiSlices/userApiSlice";
import { setCredentials } from "../features/authenticate/authSlice";
import { updateLoader } from "../features/loader/loaderSlice";

import loginImg from "../assets/login.webp";
import { UserAuthForm } from "../components/Forms";
import validateForm from "../utils/validateForm";
import { EmailInput, PasswordInput } from "../components/Inputs";
import SubmitButton from "../components/SubmitButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validationSchema = object({
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

  const { email, password } = formData;
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      dispatch(updateLoader(60));

      const res = await login(formData).unwrap();
      await dispatch(setCredentials(res.user));

      dispatch(updateLoader(100));
      toast.success(res.message || "Logged in successfully!");
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
        title="Welcome Back!"
        imageSrc={loginImg}
        imageTitle="Start using Now."
        alt="login image"
        form={
          <>
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
              isLoading={loginLoading}
              handleSubmit={handleSubmit}
              isDisabled={!email || !password || hasErrors}
            />
          </>
        }
        footer="Don't have an account?"
        footerLink="Register"
        footerLinkPath="/register"
      />
    </section>
  );
};

export default Login;
