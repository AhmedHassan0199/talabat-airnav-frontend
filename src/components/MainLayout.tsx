"use client";

import { ReactNode } from "react";
import Link from "next/link";
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
          {/* عنوان الأبلكيشن */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[var(--primary)]">
              سوق الكمبوند
            </span>
          </div>

          {/* يمين الهيدر */}
          <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
            {/* اسم المستخدم + الدور */}
            {user && (
              <span className="hidden sm:inline">
                {user.full_name} ({user.role})
              </span>
            )}

            {/* أيقونات التنقل */}
            <div className="flex items-center gap-2 text-base">
              {/* Home */}
              <Link
                href="/"
                className="rounded-full border px-2 py-1 text-xs hover:bg-gray-100"
                title="الصفحة الرئيسية"
              >
                🏠
              </Link>

              {/* Profile */}
              <Link
                href="/me"
                className="rounded-full border px-2 py-1 text-xs hover:bg-gray-100"
                title="الملف الشخصي"
              >
                👤
              </Link>
            </div>

            {/* 👇 زر إدارة المتجر – يظهر فقط للبائع */}
            {user?.role === "SELLER" && (
              <Link
                href="/seller/store"
                className="rounded-full border px-2 py-1 text-xs hover:bg-gray-100"
                title="إدارة المتجر"
              >
                🏬
              </Link>)}

            {/* زر تسجيل الخروج */}
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
