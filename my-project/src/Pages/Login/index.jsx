import React from "react";
import TextField from "@mui/material/TextField";
import { Button, CircularProgress } from "@mui/material";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MyContext } from "../../App";
import { useContext } from "react";
import { postData } from "../../utils/api";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [formFields, setFormFields] = useState({
    email: "",
    password: "",
  });

  const context = useContext(MyContext);
  const history = useNavigate();

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields(() => {
      return {
        ...formFields,
        [name]: value,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formFields.email === "") {
      context.openAlertBox("error", "email field required");
      setIsLoading(false);
      return false;
    }

    if (formFields.password === "") {
      context.openAlertBox("error", "password required");
      setIsLoading(false);
      return false;
    }

    postData("/api/user/login", formFields, { withCredentials: true }).then(
      (res) => {
        console.log(res);

        if (res?.error !== true) {
          setIsLoading(false);
          context.openAlertBox("success", res?.message);
          setFormFields({
            email: "",
            password: "",
          });

          localStorage.setItem("accesstoken", res?.data?.accessToken);
          localStorage.setItem("refreshtoken", res?.data?.refreshToken);

          context.setUserData(res?.data?.user);
          context.setIsLogin(true);

          history("/");
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading(false);
        }
      }
    );
  };

  const forgotPassword = () => {
    if (formFields.email === "") {
      context.openAlertBox("error", "Email field required");
      return false;
    }
  
    localStorage.setItem("userEmail", formFields.email);
    localStorage.setItem("actionType", "forgot-password");
  
    postData("/api/user/forgot-password", {
      email: formFields.email,
    }).then((res) => {
      if (res?.error === false) {
        context.openAlertBox("success", res?.message || "OTP sent");
        history("/verify"); // ✅ only navigate if success
      } else {
        context.openAlertBox("error", res?.message || "Something went wrong");
      }
    });
  };
  

  return (
    <section className="py-10 section">
      <div className="container">
        <div className="shadow-md w-[400px] m-auto rounded-md bg-white p-5 px-10 card">
          <h3 className="text-center text-[18px] text-black">
            Login to your account
          </h3>

          <form action="" className="w-full mt-5" onSubmit={handleSubmit}>
            <div className="w-full mb-6 form-group">
              <TextField
                type="email"
                id="email"
                name="email"
                value={formFields.email}
                disabled={isLoading === true ? true : false}
                label="Email Id"
                variant="outlined"
                className="w-full"
                onChange={onChangeInput}
              />
            </div>
            <div className="relative w-full mb-6 form-group">
              <TextField
                type={isShowPassword === false ? "password" : "text"}
                id="password"
                name="password"
                value={formFields.password}
                disabled={isLoading === true ? true : false}
                label="Password"
                variant="outlined"
                className="w-full"
                onChange={onChangeInput}
              />
              <Button
                className="!absolute top-[10px] right-[10px] z-50 !w-[35px] !h-[35px] !min-w-[35px] !rounded-full !text-black"
                onClick={() => setIsShowPassword(!isShowPassword)}
              >
                {isShowPassword === false ? (
                  <FaRegEyeSlash className="text-[20px] opacity-75" />
                ) : (
                  <FaRegEye className="text-[20px] opacity-75" />
                )}
              </Button>
            </div>

            <span
              className="cursor-pointer link text-[14px] font-[600]"
              onClick={forgotPassword}
            >
              Forget Password?
            </span>

            <div className="flex items-center w-full mt-2 mb-2">
              <Button
                type="submit"
                className="w-full btn-lg btn-org flex gap-3"
              >
                {isLoading === true ? (
                  <CircularProgress color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </div>

            <p className="mb-3 text-center">
              Not Registered?
              <Link
                className="link text-[14px] font-[600] text-primary"
                to="/register"
              >
                Sign Up
              </Link>
            </p>

            <p className="text-center font-[500]">
              Or continue with social account
            </p>

            <Button className="flex w-full gap-3 !bg-[#f1f1f1] btn-lg !text-black">
              <FcGoogle className="text-[20px]" />
              Login with Google
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;
