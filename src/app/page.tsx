"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { useAuth } from "../components/AuthProvider";
import { fetchStores, PublicStore } from "../lib/publicStores";
import Link from "next/link";

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "أكل بيتي / مطبخ",
  DESSERT: "حلويات",
  CLOTHES: "ملابس",
};

const CATEGORY_CHIPS: { key: string; label: string }[] = [
  { key: "ALL", label: "الكل" },
  { key: "FOOD", label: "أكل بيتي" },
  { key: "DESSERT", label: "حلويات" },
  { key: "CLOTHES", label: "ملابس" },
];

export default function HomePage() {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  const [stores, setStores] = useState<PublicStore[]>([]);
  const [filtered, setFiltered] = useState<PublicStore[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // 🔐 حماية الهوم: لو مفيش token نرجع على /login
  useEffect(() => {
    if (isLoading) return; // لسه بيشيّك من localStorage
    if (!token) {
      router.replace("/login");
    }
  }, [token, isLoading, router]);

  // 🧠 تحميل المتاجر بعد التأكد إن في token
  useEffect(() => {
    if (!token) return;

    const run = async () => {
      try {
        setIsLoadingStores(true);
        setError(null);
        const data = await fetchStores();
        setStores(data);
        setFiltered(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل المتاجر");
      } finally {
        setIsLoadingStores(false);
      }
    };
    run();
  }, [token]);

  // فلترة محلية بالسيرش والكاتيجوري
  useEffect(() => {
    let result = [...stores];

    if (selectedCategory !== "ALL") {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.description || "").toLowerCase().includes(term)
      );
    }

    setFiltered(result);
  }, [stores, search, selectedCategory]);

  // أثناء التحقق من الـ token أو أثناء التحويل على /login
  if (isLoading || !token) {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          جاري التحقق من حسابك...
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* عنوان */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">سوق الكمبوند</h1>
            <p className="text-sm text-[var(--text-muted)]">
              اختار من المطابخ والمتاجر المختلفة واطلب لحد باب شقتك ✨
            </p>
          </div>
        </div>

        {/* Search + Categories */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <input
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
              placeholder="دور باسم المتجر أو نوع الأكل..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-end">
            {CATEGORY_CHIPS.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full px-3 py-1 text-xs border transition ${
                  selectedCategory === cat.key
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-white text-[var(--text-muted)] border-gray-200 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stores list */}
        <div className="mt-1">
          {isLoadingStores ? (
            <p className="text-sm text-[var(--text-muted)]">
              جاري تحميل المتاجر...
            </p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              لا توجد متاجر متاحة حاليًا بهذا البحث.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="block rounded-2xl bg-white shadow-sm border border-gray-100 p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* صورة المتجر */}
                    {store.profile_image_url ? (
                      <img
                        src={store.profile_image_url}
                        alt={store.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                        لا صورة
                      </div>
                    )}

                    <div className="flex-1">
                      <h2 className="font-semibold text-base mb-1">
                        {store.name}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mb-1">
                        {CATEGORY_LABELS[store.category] || store.category}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                        <span>⭐ {store.avg_rating.toFixed(1)}</span>
                        <span>({store.reviews_count} تقييم)</span>
                      </div>

                      {store.description && (
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1">
                          {store.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>الحد الأدنى: {store.min_order_amount} ج</span>
                    <span>التوصيل: {store.delivery_fee} ج</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
