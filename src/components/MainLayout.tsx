"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--primary)]">
              سوق الكمبوند
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            {user && (
              <span>
                {user.full_name} ({user.role})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-xl border px-3 py-1 text-xs hover:bg-gray-100"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
