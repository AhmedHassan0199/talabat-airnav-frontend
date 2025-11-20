// lib/publicStores.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

export interface PublicStore {
  id: number;
  name: string;
  description?: string;
  category: string;
  min_order_amount: number;
  delivery_fee: number;
  is_active: boolean;
}

export interface StoreWithProducts {
  store: PublicStore;
  products: {
    id: number;
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    stock: number;
    is_active: boolean;
  }[];
}

export async function fetchStores(params?: {
  category?: string;
  search?: string;
}): Promise<PublicStore[]> {
  const query = new URLSearchParams();
  if (params?.category) query.set("category", params.category);
  if (params?.search) query.set("search", params.search);

  const url =
    `${API_BASE_URL}/stores` + (query.toString() ? `?${query.toString()}` : "");

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل المتاجر");
  }
  return data;
}

export async function fetchStoreWithProducts(
  id: number
): Promise<StoreWithProducts> {
  const res = await fetch(`${API_BASE_URL}/stores/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل بيانات المتجر");
  }
  return data;
}
