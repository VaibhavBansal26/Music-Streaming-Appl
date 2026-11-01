import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserData } from "../hooks/useUserData";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { registerUser, btnLoading } = useUserData();

  async function submitHandler(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    registerUser(name, email, password, navigate);
  }

  return (
    <AuthLayout
      title="Create your account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-white hover:text-accent">
            Log in
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={submitHandler}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
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
            autoComplete="new-password"
            placeholder="At least 8 characters"
            className="auth-input"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button disabled={btnLoading} className="auth-btn mt-2">
          {btnLoading ? "Please wait..." : "Sign up"}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
