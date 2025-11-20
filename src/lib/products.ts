// lib/products.ts
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  is_active: boolean;
}

export async function fetchMyProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/stores/my/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل المنتجات");
  }
  return data;
}

export async function createProduct(
  token: string,
  payload: {
    name: string;
    description?: string;
    price: number;
    image_url?: string;
    stock?: number;
    is_active?: boolean;
  }
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/stores/my/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر إنشاء المنتج");
  }
  return data;
}

export async function updateProduct(
  token: string,
  id: number,
  payload: Partial<{
    name: string;
    description: string;
    price: number;
    image_url: string;
    stock: number;
    is_active: boolean;
  }>
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/stores/my/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تعديل المنتج");
  }
  return data;
}

export async function deleteProduct(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/stores/my/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر حذف المنتج");
  }
}
