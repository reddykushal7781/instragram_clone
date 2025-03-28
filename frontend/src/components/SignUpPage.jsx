import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from 'lucide-react';
import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const SignUpPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    console.log("working")
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/v1/user/register",
        input,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(res);
      if (res.data.success) {
        setUser(res.data.user);
        navigate("/");
        setInput({ username: "", email: "", password: "" });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 items-center w-screen h-screen justify-center border-2 border-gray-100 p-6 shadow-lg rounded-lg">
      <form
        onSubmit={signupHandler}
        className="shadow-lg flex max-w-70 flex-col gap-3 p-8 border-2 border-gray-100"
      >
        <div>
          <div className="m-1">
            <img src="../public/logo.png" alt="logo" />
          </div>
          <p className="text-xs text-center">
            Signup to see photos & videos from your friends
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <div>
            <Input
              type="text"
              name="username" 
              value={input.username}
              onChange={changeEventHandler}
              placeholder="Enter your email"
              style={{ height: "40px" }}
            />
          </div>
          <div>
            <Input
              type="email"
              name="email"
              value={input.email}
              onChange={changeEventHandler}
              placeholder="Enter your email"
              style={{ height: "40px" }}
            />
          </div>
          <div>
            <Input.Password
              name="password"
              value={input.password}
              onChange={changeEventHandler}
              style={{ height: "40px" }}
            />
          </div>
        </div>
        <div className="text-center text-xs">
          <p>
            By signing up, you agree to our Terms , Privacy Policy and Cookies
            Policy{" "}
          </p>
        </div>
        {loading ? (
          <Button type="primary" block>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="primary" block htmlType="submit">
            Sign Up
          </Button>
        )}
      </form>
      <section className="shadow-lg p-4 w-70 flex flex-row justify-center items-center border border-gray-200">
        <span className="text-center text-xs">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600">
            Sign in
          </Link>
        </span>
      </section>
    </div>
  );
};

export default SignUpPage;
