"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { loginUser } from "../../lib/auth";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!usernameOrEmail || !password) {
      setError("برجاء إدخال اسم المستخدم/البريد وكلمة المرور");
      return;
    }

    try {
      setIsSubmitting(true);
      const resp = await loginUser(usernameOrEmail, password);
      login(resp);
      router.push("/me");
    } catch (err: any) {
      setError(err.message || "خطأ في تسجيل الدخول");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="تسجيل الدخول"
      subtitle="ادخل سوق الكمبوند وابدأ تطلب أو تبيع."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
            اسم المستخدم أو البريد الإلكتروني
          </label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            placeholder="user123 أو email@example.com"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
            كلمة المرور
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center rounded-xl bg-[var(--primary)] text-white text-sm font-medium px-4 py-2.5 hover:bg-[var(--primary-dark)] transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
        </button>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          ليس لديك حساب؟{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="text-[var(--primary)] underline"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
