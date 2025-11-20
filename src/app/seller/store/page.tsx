"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import { useAuth } from "../../../components/AuthProvider";
import { fetchMyStore, saveMyStore, StoreInfo } from "../../../lib/store";

export default function SellerStorePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("0");
  const [deliveryFee, setDeliveryFee] = useState<string>("0");

  // حماية route: لازم token + role SELLER
  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (!user) return;

    if (user.role !== "SELLER") {
      // لو مش بائع يرجعه على البروفايل
      router.replace("/me");
      return;
    }
  }, [user, token, isLoading, router]);

  // جلب بيانات المتجر
  useEffect(() => {
    const run = async () => {
      if (!token || !user || user.role !== "SELLER") {
        setIsFetching(false);
        return;
      }
      try {
        setIsFetching(true);
        setError(null);
        const myStore = await fetchMyStore(token);
        if (myStore) {
          setStore(myStore);
          setName(myStore.name);
          setDescription(myStore.description || "");
          setCategory(myStore.category || "FOOD");
          setMinOrderAmount(String(myStore.min_order_amount ?? 0));
          setDeliveryFee(String(myStore.delivery_fee ?? 0));
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل بيانات المتجر");
      } finally {
        setIsFetching(false);
      }
    };
    run();
  }, [token, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("برجاء تسجيل الدخول مرة أخرى.");
      return;
    }

    if (!name.trim()) {
      setError("اسم المتجر مطلوب.");
      return;
    }

    try {
      setIsSaving(true);
      const saved = await saveMyStore(token, {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        min_order_amount: Number(minOrderAmount || 0),
        delivery_fee: Number(deliveryFee || 0),
      });
      setStore(saved);
      setSuccess("تم حفظ بيانات المتجر بنجاح.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ بيانات المتجر");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold mb-2">إدارة المتجر</h1>

        {isFetching && (
          <p className="text-sm text-[var(--text-muted)]">
            جاري تحميل بيانات المتجر...
          </p>
        )}

        {!isFetching && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-lg font-semibold mb-4">
                {store ? "تعديل بيانات المتجر" : "إنشاء متجر جديد"}
              </h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
                    اسم المتجر
                  </label>
                  <input
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: مطبخ أم محمد / Ahmed Store"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
                    وصف المتجر
                  </label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: أكل بيتى طازة، يومياً من الساعة ١ ظهراً حتى ٩ مساءً"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
                      نوع المتجر
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] bg-white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="FOOD">أكل بيتي / مطبخ</option>
                      <option value="DESSERT">حلويات</option>
                      <option value="CLOTHES">ملابس</option>
                      <option value="ACCESSORIES">إكسسوارات</option>
                      <option value="OTHER">أخرى</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
                      أقل قيمة للطلب (جنيه)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block mb-1 text-sm font-medium text-[var(--text-main)]">
                      مصاريف التوصيل (جنيه)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center rounded-xl bg-[var(--primary)] text-white text-sm font-medium px-4 py-2.5 hover:bg-[var(--primary-dark)] transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving
                    ? "جاري حفظ بيانات المتجر..."
                    : store
                    ? "حفظ التعديلات"
                    : "إنشاء المتجر"}
                </button>
              </form>
            </div>
            {store && (
              <div className="bg-white rounded-2xl shadow-sm p-5 text-sm">
                <h2 className="text-lg font-semibold mb-4">
                  ملخص المتجر الحالي
                </h2>
                <button
                    onClick={() => router.push("/seller/products")}
                    className="mb-4 rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                    >
                    إدارة المنتجات
                </button>
                <p className="mb-1">
                  <span className="font-medium">الاسم:</span> {store.name}
                </p>
                <p className="mb-1">
                  <span className="font-medium">النوع:</span> {store.category}
                </p>
                <p className="mb-1">
                  <span className="font-medium">الحد الأدنى للطلب:</span>{" "}
                  {store.min_order_amount} ج
                </p>
                <p className="mb-1">
                  <span className="font-medium">مصاريف التوصيل:</span>{" "}
                  {store.delivery_fee} ج
                </p>
                {store.description && (
                  <p className="mt-2 text-[var(--text-muted)]">
                    {store.description}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
