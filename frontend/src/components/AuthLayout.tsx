import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footer: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children, footer }) => (
  <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#1b2a22] to-surface px-4 py-10">
    <div className="w-full max-w-md rounded-2xl border border-line bg-black/60 p-8 shadow-2xl backdrop-blur">
      <Link to="/" className="mb-6 flex items-center justify-center gap-2">
        <img src="/logo.png" alt="" className="h-9 w-9 rounded" />
        <span className="text-xl font-extrabold tracking-tight">Music Streaming</span>
      </Link>
      <h1 className="mb-8 text-center text-2xl font-bold">{title}</h1>
      {children}
      <div className="mt-6 text-center text-sm text-muted">{footer}</div>
    </div>
  </div>
);

export default AuthLayout;
