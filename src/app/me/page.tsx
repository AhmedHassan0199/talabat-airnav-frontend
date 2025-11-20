"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import { useAuth } from "../../components/AuthProvider";
import { fetchMyOrders, fetchMyReviews, MyOrderSummary, MyReviewSummary } from "../../lib/orders";

export default function MePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<MyOrderSummary[]>([]);
  const [reviews, setReviews] = useState<MyReviewSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }

    const run = async () => {
      try {
        setLoadingData(true);
        setError(null);
        if (user?.role === "CUSTOMER") {
          const [o, r] = await Promise.all([
            fetchMyOrders(token),
            fetchMyReviews(token),
          ]);
          setOrders(o);
          setReviews(r);
        }
        // لو SELLER ممكن نرجعلهم حاجة مختلفة بعدين
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل البيانات");
      } finally {
        setLoadingData(false);
      }
    };

    run();
  }, [user, token, isLoading, router]);

  if (isLoading || !user || !token) {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">جاري التحقق من حسابك...</p>
      </MainLayout>
    );
  }

  // لو Customer نعرض الملخص
  if (user.role === "CUSTOMER") {
    return (
      <MainLayout>
        <div className="space-y-4">
          <h1 className="text-xl font-semibold mb-2">
            حسابي
          </h1>
          <p className="text-sm text-[var(--text-muted)] mb-2">
            ملخص آخر طلباتك وآخر مراجعاتك على المتاجر.
          </p>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {/* آخر الطلبات */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">آخر الطلبات</h2>
            {loadingData ? (
              <p className="text-sm text-[var(--text-muted)]">جاري التحميل...</p>
            ) : orders.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                لم تقم بأي طلبات حتى الآن.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{o.store_name}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        حالة الطلب: {o.status}
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-semibold">{o.total_amount} ج</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* مراجعاتي */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-2">مراجعاتي</h2>
            {loadingData ? (
              <p className="text-sm text-[var(--text-muted)]">جاري التحميل...</p>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                لم تضف أي مراجعات بعد.
              </p>
            ) : (
              <div className="space-y-2 text-sm">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{r.store_name}</span>
                      <span className="text-xs">⭐ {r.rating}</span>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  // لو SELLER – ممكن نسيبها بسيطة حالياً
  return (
    <MainLayout>
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">حسابي (بائع)</h1>
        <p className="text-sm text-[var(--text-muted)]">
          سيتم إضافة لوحة تحكم للبائع هنا فيما بعد.
        </p>
      </div>
    </MainLayout>
  );
}
