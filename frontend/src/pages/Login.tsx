import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/useUserData";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { loginUser, btnLoading } = useUserData();

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    loginUser(email, password, navigate);
  }

  return (
    <AuthLayout
      title="Log in to continue"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-white hover:text-accent">
            Sign up
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submitHandler}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button disabled={btnLoading} className="auth-btn mt-2">
          {btnLoading ? "Please wait..." : "Log in"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
