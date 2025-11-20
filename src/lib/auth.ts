const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export type Role = "CUSTOMER" | "SELLER" | "ADMIN" | "SUPERADMIN";

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  building?: string;
  floor?: string;
  apartment?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export async function registerUser(payload: {
  username: string;
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  desired_role?: "CUSTOMER" | "SELLER";
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "حدث خطأ أثناء إنشاء الحساب");
  }
  return data;
}

export async function loginUser(
  username_or_email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username_or_email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "خطأ في بيانات الدخول");
  }
  return data;
}

export async function fetchMe(token: string): Promise<{ user: User }> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل البيانات");
  }
  return data;
}
