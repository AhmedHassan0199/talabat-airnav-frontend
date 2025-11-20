const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "/api";

export interface StoreReview {
  id: number;
  rating: number;
  comment?: string;
  created_at: string;
  customer_name: string;
}

export async function fetchStoreReviews(storeId: number): Promise<StoreReview[]> {
  const res = await fetch(`${API_BASE_URL}/stores/${storeId}/reviews`, {
    method: "GET",
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "تعذر تحميل المراجعات");
  return data;
}

export async function addOrUpdateStoreReview(
  token: string,
  storeId: number,
  rating: number,
  comment?: string
): Promise<StoreReview> {
  const res = await fetch(`${API_BASE_URL}/stores/${storeId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating, comment }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "تعذر حفظ المراجعة");
  return data;
}
