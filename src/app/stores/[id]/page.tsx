"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import { fetchStoreWithProducts, StoreWithProducts } from "../../../lib/publicStores";

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: "أكل بيتي / مطبخ",
  DESSERT: "حلويات",
  CLOTHES: "ملابس",
};

export default function StoreDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<StoreWithProducts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params.id);
    if (!id) return;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetchStoreWithProducts(id);
        setData(res);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل بيانات المتجر");
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [params.id]);

  const store = data?.store;

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* أعلى الصفحة: Back + اسم المتجر */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-xs rounded-xl border px-3 py-1 hover:bg-gray-50"
          >
            ⟵ رجوع
          </button>
          {store && (
            <div className="text-right">
              <h1 className="text-xl font-semibold">{store.name}</h1>
              <p className="text-xs text-[var(--text-muted)]">
                {CATEGORY_LABELS[store.category] || store.category}
              </p>
            </div>
          )}
        </div>

        {isLoading ? (
          <p className="text-sm text-[var(--text-muted)]">
            جاري تحميل بيانات المتجر...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !store ? (
          <p className="text-sm text-[var(--text-muted)]">
            المتجر غير متاح حالياً.
          </p>
        ) : (
          <>
            {/* كروت معلومات المتجر */}
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-4">
                <h2 className="text-sm font-semibold mb-2">عن المتجر</h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {store.description || "لا يوجد وصف متاح حتى الآن."}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-4 text-sm">
                <h2 className="text-sm font-semibold mb-2">تفاصيل الطلب</h2>
                <p className="mb-1">
                  <span className="text-[var(--text-muted)]">
                    أقل قيمة للطلب:
                  </span>{" "}
                  <span className="font-semibold">
                    {store.min_order_amount} ج
                  </span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">
                    مصاريف التوصيل:
                  </span>{" "}
                  <span className="font-semibold">
                    {store.delivery_fee} ج
                  </span>
                </p>
              </div>
            </div>

            {/* قائمة المنتجات */}
            <div className="bg-white rounded-2xl shadow-sm p-4 mt-2">
              <h2 className="text-lg font-semibold mb-3">
                قائمة المنتجات
              </h2>

              {data!.products.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  لا توجد منتجات مضافة بعد لهذا المتجر.
                </p>
              ) : (
                <div className="space-y-3">
                  {data!.products.map((p) => (
                    <div
                      key={p.id}
                      className="flex gap-3 border border-gray-100 rounded-2xl p-3 items-center"
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                          بدون صورة
                        </div>
                      )}

                      <div className="flex-1 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{p.name}</div>
                            {p.description && (
                              <div className="text-xs text-[var(--text-muted)] line-clamp-2">
                                {p.description}
                              </div>
                            )}
                          </div>
                          <div className="text-left text-sm font-semibold">
                            {p.price} ج
                          </div>
                        </div>

                        <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                          <span>المخزون: {p.stock}</span>
                          {p.stock <= 0 && (
                            <span className="text-red-500">غير متوفر حالياً</span>
                          )}
                        </div>
                      </div>

                      {/* Placeholder للـ Cart – هنكملها بعدين */}
                      <button
                        className="text-xs rounded-xl bg-[var(--primary)] text-white px-3 py-1.5 hover:bg-[var(--primary-dark)] disabled:opacity-60"
                        disabled={p.stock <= 0}
                        // onClick={() => addToCartLater(p)}
                      >
                        إضافة للسلة
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
