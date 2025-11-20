// lib/store.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export interface StoreInfo {
  id: number;
  name: string;
  description?: string;
  category: string;
  min_order_amount: number;
  delivery_fee: number;
  is_active: boolean;
}

export async function fetchMyStore(token: string): Promise<StoreInfo | null> {
  const res = await fetch(`${API_BASE_URL}/stores/my`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (res.status === 404) {
    // مفيش متجر لسه
    return null;
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل بيانات المتجر");
  }
  return data;
}

export async function saveMyStore(
  token: string,
  payload: {
    name: string;
    description?: string;
    category?: string;
    min_order_amount?: number;
    delivery_fee?: number;
  }
): Promise<StoreInfo> {
  const res = await fetch(`${API_BASE_URL}/stores/my`, {
    method: "POST",
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
