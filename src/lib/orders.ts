const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "/api";

export interface MyOrderSummary {
  id: number;
  store_id: number;
  store_name: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export async function fetchMyOrders(token: string): Promise<MyOrderSummary[]> {
  const res = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "تعذر تحميل الطلبات");
  return data;
}

export interface MyReviewSummary {
  id: number;
  store_id: number;
  store_name: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export async function fetchMyReviews(token: string): Promise<MyReviewSummary[]> {
  const res = await fetch(`${API_BASE_URL}/profile/my-reviews`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "تعذر تحميل مراجعاتك");
  return data;
}
