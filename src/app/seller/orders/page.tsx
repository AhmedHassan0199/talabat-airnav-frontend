"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/MainLayout";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
};

type SellerOrder = {
  id: number;
  store_id: number;
  store_name?: string | null;
  customer_id: number;
  customer_name?: string | null;
  status:
    | "PENDING"
    | "ACCEPTED"
    | "REJECTED"
    | "PREPARING"
    | "ON_THE_WAY"
    | "DELIVERED"
    | "CANCELLED";
  total_amount: number;
  delivery_method: "DELIVERY" | "PICKUP";
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
  items: OrderItem[];
};

type StatusFilter = "ALL" | "PENDING" | "PREPARING" | "ON_THE_WAY" | "DELIVERED";

const STATUS_LABELS: Record<SellerOrder["status"], string> = {
  PENDING: "في انتظار الموافقة",
  ACCEPTED: "مقبول",
  REJECTED: "مرفوض",
  PREPARING: "جاري التجهيز",
  ON_THE_WAY: "في الطريق",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: "ALL", label: "الكل" },
  { key: "PENDING", label: "جديدة" },
  { key: "PREPARING", label: "قيد التجهيز" },
  { key: "ON_THE_WAY", label: "في الطريق" },
  { key: "DELIVERED", label: "مكتملة" },
];

function statusToBadgeClass(status: SellerOrder["status"]): string {
  switch (status) {
    case "PENDING":
      return "bg-yellow-50 text-yellow-800 border border-yellow-200";
    case "ACCEPTED":
    case "PREPARING":
      return "bg-blue-50 text-blue-800 border border-blue-200";
    case "ON_THE_WAY":
      return "bg-purple-50 text-purple-800 border border-purple-200";
    case "DELIVERED":
      return "bg-green-50 text-green-800 border border-green-200";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-50 text-red-800 border border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
}

export default function SellerOrdersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // تحميل كل طلبات المتجر للبائع
  const loadOrders = async (authToken: string) => {
    try {
      setLoadingOrders(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/orders/seller`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "تعذر تحميل الطلبات");
      }
      setOrders(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "تعذر تحميل الطلبات");
    } finally {
      setLoadingOrders(false);
    }
  };

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

    loadOrders(token);
  }, [user, token, isLoading, router]);

  const refreshOrders = async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      await loadOrders(token);
    } finally {
      setRefreshing(false);
    }
  };

  // تحديث حالة الطلب (POST /orders/<id>/status)
  const updateOrderStatus = async (
    orderId: number,
    newStatus: SellerOrder["status"],
    markPaid: boolean = false
  ) => {
    if (!token) return;
    try {
      setUpdatingId(orderId);
      setError(null);

      const res = await fetch(
        `${API_BASE_URL}/orders/${orderId}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus, mark_paid: markPaid }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "تعذر تحديث حالة الطلب");
      }

      // تحديث الطلب في الـ state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? data : o))
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء تحديث حالة الطلب");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderActions = (order: SellerOrder) => {
    const disabled = updatingId === order.id;

    if (order.status === "PENDING") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateOrderStatus(order.id, "ACCEPTED")}
            className="rounded-xl bg-green-600 text-white text-xs px-3 py-1.5 hover:bg-green-700 disabled:opacity-60"
          >
            قبول الطلب
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => updateOrderStatus(order.id, "REJECTED")}
            className="rounded-xl bg-red-500 text-white text-xs px-3 py-1.5 hover:bg-red-600 disabled:opacity-60"
          >
            رفض الطلب
          </button>
        </div>
      );
    }

    if (order.status === "ACCEPTED" || order.status === "PREPARING") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {order.status === "ACCEPTED" && (
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                updateOrderStatus(order.id, "PREPARING")
              }
              className="rounded-xl bg-blue-600 text-white text-xs px-3 py-1.5 hover:bg-blue-700 disabled:opacity-60"
            >
              بدء التجهيز
            </button>
          )}
          {order.status === "PREPARING" && (
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                updateOrderStatus(order.id, "ON_THE_WAY")
              }
              className="rounded-xl bg-purple-600 text-white text-xs px-3 py-1.5 hover:bg-purple-700 disabled:opacity-60"
            >
              جاهز وفي الطريق
            </button>
          )}
        </div>
      );
    }

    if (order.status === "ON_THE_WAY") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              updateOrderStatus(order.id, "DELIVERED", true)
            }
            className="rounded-xl bg-green-700 text-white text-xs px-3 py-1.5 hover:bg-green-800 disabled:opacity-60"
          >
            تم التسليم (مدفوع)
          </button>
        </div>
      );
    }

    return null;
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

  // فلترة في الـ Frontend حسب الفلتر المختار
  const visibleOrders =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-1">
              طلبات المتجر
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              راقب الطلبات الجديدة، حدّث حالة كل طلب خطوة بخطوة من
              عند الاستلام لحدّ التسليم 🙌
            </p>
          </div>
          <button
            type="button"
            onClick={refreshOrders}
            disabled={refreshing}
            className="rounded-xl border px-3 py-1.5 text-xs hover:bg-gray-50 disabled:opacity-60"
          >
            {refreshing ? "جاري التحديث..." : "تحديث الطلبات 🔄"}
          </button>
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setStatusFilter(chip.key)}
              className={`rounded-full px-3 py-1 text-xs border transition ${
                statusFilter === chip.key
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-white text-[var(--text-muted)] border-gray-200 hover:bg-gray-50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loadingOrders ? (
          <p className="text-sm text-[var(--text-muted)]">
            جاري تحميل الطلبات...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : visibleOrders.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            لا توجد طلبات بهذه الحالة حاليًا.
          </p>
        ) : (
          <div className="space-y-3">
            {visibleOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-sm font-semibold">
                        طلب رقم #{order.id}
                      </span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full ${statusToBadgeClass(
                          order.status
                        )}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </div>
                    {order.created_at && (
                      <p className="text-xs text-[var(--text-muted)]">
                        {new Date(
                          order.created_at
                        ).toLocaleString("ar-EG", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                    <p className="text-xs">
                      👤{" "}
                      <span className="font-semibold">
                        {order.customer_name || "عميل"}
                      </span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                      نوع الطلب:{" "}
                      {order.delivery_method === "DELIVERY"
                        ? "توصيل"
                        : "استلام من المتجر"}
                    </p>
                    {order.notes && (
                      <p className="text-xs text-[var(--text-muted)]">
                        ملاحظات العميل: {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">
                      إجمالي الطلب
                    </p>
                    <p className="text-base font-semibold">
                      {order.total_amount} ج
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-2 border-t border-gray-100 pt-2">
                  <p className="text-xs font-semibold mb-1">
                    المنتجات:
                  </p>
                  <div className="space-y-1">
                    {order.items.map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex-1">
                          <span className="font-medium">
                            {it.product_name}
                          </span>
                          <span className="mx-1">•</span>
                          <span className="text-[var(--text-muted)]">
                            الكمية: {it.quantity}
                          </span>
                        </div>
                        <div className="text-right text-[var(--text-muted)]">
                          <span>
                            {it.unit_price} ج للواحدة
                          </span>
                          <span className="mx-1">•</span>
                          <span className="font-semibold">
                            المجموع: {it.subtotal} ج
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {renderActions(order)}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
