"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import { useAuth } from "../../components/AuthProvider";

export default function MyProfilePage() {
  const { user, token, refreshMe, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (token) {
      refreshMe();
    }
  }, [token, refreshMe]);

  if (isLoading || (!user && token)) {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          جاري تحميل بيانات الحساب...
        </p>
      </MainLayout>
    );
  }

  if (!token || !user) {
    return null;
  }

  const isSeller = user.role === "SELLER";

  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">البيانات الشخصية</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">الاسم:</span> {user.full_name}
            </div>
            <div>
              <span className="font-medium">اسم المستخدم:</span>{" "}
              {user.username}
            </div>
            <div>
              <span className="font-medium">البريد الإلكتروني:</span>{" "}
              {user.email}
            </div>
            <div>
              <span className="font-medium">الدور:</span>{" "}
              {user.role === "CUSTOMER"
                ? "عميل"
                : user.role === "SELLER"
                ? "بائع"
                : user.role}
            </div>
            <div>
              <span className="font-medium">الوحدة:</span>{" "}
              {user.building
                ? `عمارة ${user.building} - دور ${user.floor || "-"} - شقة ${
                    user.apartment || "-"
                  }`
                : "لم يتم تسجيل بيانات الوحدة"}
            </div>
            {user.phone && (
              <div>
                <span className="font-medium">الموبايل:</span> {user.phone}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-semibold mb-4">وضع الحساب</h2>
          {!isSeller && (
            <p className="text-sm text-[var(--text-muted)]">
              حسابك حاليًا كـ <strong>عميل</strong>. قريبًا هتقدر تطلب ترقية
              لحساب <strong>بائع</strong> وتفتح مطبخك أو متجرك على السوق.
            </p>
          )}
          {isSeller && (
            <div className="space-y-2 text-sm">
              <p className="text-[var(--text-muted)]">
                أنت مسجّل كبائع. قريبًا هنعرض هنا بيانات متجرك (الاسم، الوصف،
                المنتجات، الطلبات، إلخ).
              </p>
              <button className="mt-2 w-full rounded-xl border px-3 py-2 text-xs hover:bg-gray-50">
                إدارة المتجر (قريبًا)
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
