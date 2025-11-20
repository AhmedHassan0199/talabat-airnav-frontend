"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/MainLayout";
import { useCart } from "../../components/CartProvider";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

export default function CartPage() {
  const { cart, setItemQuantity, removeItem, clearCart } = useCart();
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const total = cart.items.reduce(
    (sum, it) => sum + it.price * it.quantity,
    0
  );

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (user && user.role !== "CUSTOMER") {
      router.replace("/");
      return;
    }
  }, [user, token, isLoading, router]);

  const placeOrder = async () => {
    if (!token || !cart.storeId || cart.items.length === 0) return;

    try {
      setPlacing(true);
      setError(null);
      setSuccessMsg(null);

      const body = {
        store_id: cart.storeId,
        items: cart.items.map((it) => ({
          product_id: it.productId,
          quantity: it.quantity,
        })),
        delivery_method: "DELIVERY", // ممكن نخليها اختيار لاحقاً
        notes: notes.trim() || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "تعذر إنشاء الطلب");
      }

      clearCart();
      setNotes("");
      setSuccessMsg("تم إرسال الطلب للبائع (قيد الموافقة) ✅");
      // optional: redirect to /orders
      // router.push("/orders");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setPlacing(false);
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

  if (user.role !== "CUSTOMER") {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          صفحة السلة متاحة للعملاء فقط.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold mb-1">
            سلة الطلبات
          </h1>
          {cart.storeName && (
            <p className="text-sm text-[var(--text-muted)]">
              من المتجر: <span className="font-semibold">{cart.storeName}</span>
            </p>
          )}
        </div>

        {(error || successMsg) && (
          <div className="space-y-1">
            {error && (
              <div className="text-sm text-red-600">{error}</div>
            )}
            {successMsg && (
              <div className="text-sm text-green-600">
                {successMsg}
              </div>
            )}
          </div>
        )}

        {cart.items.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            السلة فارغة. ابدأ باختيار منتجات من أحد المتاجر.
          </p>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              {cart.items.map((it) => (
                <div
                  key={it.productId}
                  className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {it.imageUrl ? (
                      <img
                        src={it.imageUrl}
                        alt={it.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">
                        لا صورة
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">
                        {it.name}
                      </span>
                      <span className="font-semibold">
                        {it.price * it.quantity} ج
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      سعر الوحدة: {it.price} ج
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setItemQuantity(
                              it.productId,
                              it.quantity - 1
                            )
                          }
                          className="w-7 h-7 rounded-full border flex items-center justify-center text-sm"
                        >
                          -
                        </button>
                        <span className="min-w-[20px] text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setItemQuantity(
                              it.productId,
                              it.quantity + 1
                            )
                          }
                          className="w-7 h-7 rounded-full border flex items-center justify-center text-sm"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(it.productId)}
                        className="text-[11px] text-red-600 underline"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes + total + place order */}
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  ملاحظات للطلب (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  rows={2}
                  placeholder="مثال: بدون بصل، توصيل بعد الساعة ٧..."
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  الإجمالي:
                </span>
                <span className="text-lg font-semibold">
                  {total} ج
                </span>
              </div>

              <button
                type="button"
                disabled={placing}
                onClick={placeOrder}
                className="w-full rounded-2xl bg-[var(--primary)] text-white text-sm py-2.5 hover:bg-[var(--primary-dark)] disabled:opacity-60"
              >
                {placing
                  ? "جاري إرسال الطلب..."
                  : "تأكيد الطلب (قيد الموافقة)"}
              </button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
