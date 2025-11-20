"use client";

import { useEffect, useState, FormEvent } from "react";
import MainLayout from "../../../components/MainLayout";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

type SellerStore = {
  id: number;
  name: string;
  description?: string;
  category: string;
  min_order_amount: number;
  delivery_fee: number;
  profile_image_url?: string;
  is_active: boolean;
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "FOOD", label: "أكل بيتي / مطبخ" },
  { value: "DESSERT", label: "حلويات" },
  { value: "CLOTHES", label: "ملابس" },
];

async function fetchMyStore(token: string): Promise<SellerStore | null> {
  const res = await fetch(`${API_BASE_URL}/stores/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (res.status === 404) {
    return null;
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل بيانات المتجر");
  }
  return data;
}

async function updateMyStore(
  token: string,
  payload: Partial<SellerStore>
): Promise<SellerStore> {
  const res = await fetch(`${API_BASE_URL}/stores/my`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر حفظ بيانات المتجر");
  }
  return data;
}

async function uploadStoreImage(
  token: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_BASE_URL}/uploads/store-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "فشل رفع صورة المتجر");
  }
  return data.url as string;
}

export default function SellerStorePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<SellerStore | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<string>("");

  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);

  const [loadingStore, setLoadingStore] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "SELLER") {
      router.replace("/");
      return;
    }

    const run = async () => {
      try {
        setLoadingStore(true);
        setError(null);
        const s = await fetchMyStore(token);
        if (s) {
          setStore(s);
          setName(s.name || "");
          setDescription(s.description || "");
          setCategory(s.category || "FOOD");
          setMinOrderAmount(
            s.min_order_amount != null ? String(s.min_order_amount) : ""
          );
          setDeliveryFee(
            s.delivery_fee != null ? String(s.delivery_fee) : ""
          );
          setProfileImageUrl(s.profile_image_url || undefined);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل بيانات المتجر");
      } finally {
        setLoadingStore(false);
      }
    };

    run();
  }, [user, token, isLoading, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);

      let finalProfileImageUrl = profileImageUrl;

      if (profileImageFile) {
        setUploadingImage(true);
        try {
          finalProfileImageUrl = await uploadStoreImage(
            token,
            profileImageFile
          );
        } finally {
          setUploadingImage(false);
        }
      }

      const payload: Partial<SellerStore> = {
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        min_order_amount: minOrderAmount
          ? Number(minOrderAmount)
          : 0,
        delivery_fee: deliveryFee ? Number(deliveryFee) : 0,
        profile_image_url: finalProfileImageUrl,
      };

      const updated = await updateMyStore(token, payload);
      setStore(updated);
      setProfileImageUrl(updated.profile_image_url || finalProfileImageUrl);
      setSuccessMsg("تم حفظ بيانات المتجر بنجاح ✅");
      setProfileImageFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ بيانات المتجر");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !user || !token) {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          جاري التحقق من حسابك...
        </p>
      </MainLayout>
    );
  }

  if (user.role !== "SELLER") {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          هذه الصفحة متاحة للبائعين فقط.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* العنوان + زر إدارة المنتجات */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-1">
              إدارة بيانات المتجر
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              عدّل اسم المتجر، الوصف، معلومات الطلب، وصورة البروفايل
              التي ستظهر للعملاء في صفحة سوق الكمبوند.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/seller/products")}
            className="mt-2 md:mt-0 rounded-2xl bg-[var(--primary)] text-white text-sm px-4 py-2 hover:bg-[var(--primary-dark)]"
          >
            إدارة المنتجات 🍽️
          </button>
        </div>

        {loadingStore ? (
          <p className="text-sm text-[var(--text-muted)]">
            جاري تحميل بيانات المتجر...
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm p-4 space-y-4"
          >
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {successMsg && (
              <div className="text-sm text-green-600">
                {successMsg}
              </div>
            )}

            {/* صورة البروفايل */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                {profileImageFile ? (
                  <img
                    src={URL.createObjectURL(profileImageFile)}
                    alt="صورة المتجر"
                    className="w-full h-full object-cover"
                  />
                ) : profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="صورة المتجر"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400">
                    لا توجد صورة
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1">
                <label className="block text-sm font-medium">
                  صورة بروفايل المتجر
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileImageFile(file);
                  }}
                  className="block w-full text-xs text-gray-500
                             file:mr-3 file:py-2 file:px-3
                             file:rounded-xl file:border-0
                             file:text-xs file:font-semibold
                             file:bg-[var(--primary)] file:text-white
                             hover:file:bg-[var(--primary-dark)]"
                />
                <p className="text-[10px] text-[var(--text-muted)]">
                  هذه الصورة ستظهر في بطاقة المتجر وفي صفحة تفاصيل
                  المتجر للعملاء.
                </p>
              </div>
            </div>

            {/* اسم المتجر */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                اسم المتجر
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                placeholder="مثال: مطبخ أم أحمد - أكل بيتي"
                required
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                وصف المتجر
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                rows={3}
                placeholder="اكتب نبذة عن نوع الأكل/المنتجات التي تقدمها، مميزاتك، مواعيد التواجد..."
              />
            </div>

            {/* الفئة */}
            <div>
              <label className="block mb-1 text-sm font-medium">
                نوع المتجر
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* الحد الأدنى + مصاريف التوصيل */}
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  الحد الأدنى للطلب (جنيه)
                </label>
                <input
                  type="number"
                  min={0}
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثال: 50"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  مصاريف التوصيل (جنيه)
                </label>
                <input
                  type="number"
                  min={0}
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثال: 10"
                />
              </div>
            </div>

            {/* زر الحفظ */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving || uploadingImage}
                className="rounded-2xl bg-[var(--primary)] text-white text-sm px-6 py-2.5 hover:bg-[var(--primary-dark)] disabled:opacity-60"
              >
                {saving
                  ? uploadingImage
                    ? "جاري رفع الصورة وحفظ البيانات..."
                    : "جاري حفظ البيانات..."
                  : "حفظ بيانات المتجر"}
              </button>
            </div>
          </form>
        )}
      </div>
    </MainLayout>
  );
}
