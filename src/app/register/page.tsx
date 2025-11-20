"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "../../components/AuthLayout";
import { registerUser } from "../../lib/auth";
import { useAuth } from "../../components/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSeller, setIsSeller] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !fullName || !email || !password) {
      setError("برجاء ملء الحقول الأساسية المطلوبة.");
      return;
    }

    try {
      setIsSubmitting(true);
      const resp = await registerUser({
        username,
        full_name: fullName,
        email,
        password,
        phone,
        building,
        floor,
        apartment,
        desired_role: isSeller ? "SELLER" : "CUSTOMER",
      });

      login(resp);
      router.push("/me");
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="إنشاء حساب جديد"
      subtitle="سجّل كمستخدم عادي أو كبائع يعرض منتجاته في السوق."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
              اسم المستخدم
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user123"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
              الاسم بالكامل
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أحمد حسن..."
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
            رقم الموبايل
          </label>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="01xxxxxxxxx"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
              رقم العمارة
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
              placeholder="مثال: 5"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
              الدور
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="مثال: 3"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
              الشقة
            </label>
            <input
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              placeholder="مثال: 12"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
            كلمة المرور
          </label>
          <input
            type="password"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <input
            id="isSeller"
            type="checkbox"
            checked={isSeller}
            onChange={(e) => setIsSeller(e.target.checked)}
          />
          <label htmlFor="isSeller">
            عايز أبيع في السوق (أكون صاحب متجر / مطبخ منزلي)
          </label>
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
          {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
        </button>

        <p className="mt-2 text-center text-xs text-[var(--text-muted)]">
          لديك حساب بالفعل؟{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[var(--primary)] underline"
          >
            تسجيل الدخول
          </button>
        </p>
      </form>
    </AuthLayout>
  );
}
