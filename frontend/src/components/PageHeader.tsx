import React from "react";

interface PageHeaderProps {
  image?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ image, eyebrow, title, subtitle }) => (
  <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end">
    <img
      src={image || "/placeholder.png"}
      className="h-48 w-48 rounded-xl object-cover shadow-2xl"
      alt=""
    />
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  </div>
);

export default PageHeader;
