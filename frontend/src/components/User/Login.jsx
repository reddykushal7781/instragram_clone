import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Auth from "./Auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackdropLoader from "../Layouts/BackdropLoader";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, loginUser } from "../../actions/userAction";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isAuthenticated, error, user } = useSelector(
    (state) => state.user
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(email, password));
      navigate('/');
    } catch (error) {
      // Error is already handled in the action
    }
  };

  useEffect(() => {
    if (error) {
      // Only show error toast for invalid credentials
      if (error.includes("Invalid User or Password")) {
        toast.error(error);
      }
      dispatch(clearErrors());
    }
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [dispatch, error, isAuthenticated, navigate, user]);

  return (
    <>
      {loading && <BackdropLoader />}
      <Auth>
        <div className="flex flex-col gap-2 p-4 pt-10 bg-white border">
          <img
            draggable="false"
            className="object-contain mx-auto h-30 w-36"
            src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png"
            alt=""
          />
          <form
            onSubmit={handleLogin}
            className="flex flex-col items-center justify-center gap-3 m-3 md:m-8"
          >
            <TextField
              label="Email/Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="small"
              fullWidth
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="small"
              fullWidth
            />
            <button
              type="submit"
              className="w-full py-2 font-medium text-white rounded bg-blue-600"
            >
              Log In
            </button>
          </form>
        </div>

        <div className="p-5 text-center bg-white border">
          <span>
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600">
              Sign up
            </Link>
          </span>
        </div>
      </Auth>
    </>
  );
};

export default Login;
