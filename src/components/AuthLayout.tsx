"use client";

import { ReactNode } from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md bg-[var(--card-bg)] shadow-xl rounded-2xl p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-main)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
