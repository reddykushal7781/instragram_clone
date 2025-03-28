import React, { useState, useEffect } from "react";
import { Button, Input } from "antd";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { create } from "zustand";  // ✅ Import Zustand

// ✅ Zustand Store for Authentication
const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

const LoginPage = () => {
  const { user, setUser } = useAuthStore();  // ✅ Zustand Store
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/v1/user/login",
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(res);
      if (res.data.success) {
        console.log("i am working");
        setUser(res.data.user);  // ✅ Store user in Zustand
        navigate("/home");
        setInput({ email: "", password: "" });
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
  }, []);  // ✅ Added dependency to prevent infinite loop

  return (
    <div className="flex flex-col gap-4 items-center w-screen h-screen justify-center border-2 border-gray-100 p-6 shadow-lg rounded-lg">
      <form onSubmit={loginHandler} className="shadow-lg flex max-w-70 flex-col gap-3 p-8 border-2 border-gray-100">
        <div className="m-1">
          <img src="../public/logo.png" alt="logo" />
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
        {loading ? (
          <Button type="primary" block disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="primary" block htmlType="submit">
            Log in
          </Button>
        )}
        <section className="flex flex-row gap-2 justify-center items-center text-xs">
          <hr className="w-30" />
          <p>OR</p>
          <hr className="w-30" />
        </section>
        <section className="flex justify-center text-xs">
          <p>Forget Password?</p>
        </section>
      </form>
      <section className="shadow-lg p-4 w-70 flex flex-row justify-center items-center border border-gray-200">
        <span className="text-center text-xs">
          Dosen't have an account?{" "}
          <Link to="/signup" className="text-blue-600">
            Signup
          </Link>
        </span>
      </section>
    </div>
  );
};

export default LoginPage;
