"use client";

import { useEffect, useState, FormEvent } from "react";
import MainLayout from "../../../components/MainLayout";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

type SellerStore = {
  id: number;
  name: string;
  description?: string;
  category: string;
  min_order_amount: number;
  delivery_fee: number;
  profile_image_url?: string;
  is_active: boolean;
};

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  is_active: boolean;
};

async function fetchMyStore(token: string): Promise<SellerStore | null> {
  const res = await fetch(`${API_BASE_URL}/stores/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (res.status === 404) {
    return null;
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحميل بيانات المتجر");
  }
  return data;
}

async function fetchMyProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products/my`, {
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

async function createProduct(
  token: string,
  payload: Partial<Product>
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
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

async function updateProduct(
  token: string,
  id: number,
  payload: Partial<Product>
): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "تعذر تحديث المنتج");
  }
  return data;
}

async function deleteProduct(
  token: string,
  id: number
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "تعذر حذف المنتج");
  }
}

async function uploadProductImage(
  token: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${API_BASE_URL}/uploads/product-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "فشل رفع صورة المنتج");
  }
  // backend بيرجع { "url": "/media/products/..." }
  return data.url as string;
}

export default function SellerProductsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [store, setStore] = useState<SellerStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingStore, setLoadingStore] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

    const run = async () => {
      try {
        setError(null);
        setLoadingStore(true);
        setLoadingProducts(true);

        const [storeRes, productsRes] = await Promise.all([
          fetchMyStore(token),
          fetchMyProducts(token),
        ]);

        if (storeRes) {
          setStore(storeRes);
        }
        setProducts(productsRes);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل بيانات المتجر أو المنتجات");
      } finally {
        setLoadingStore(false);
        setLoadingProducts(false);
      }
    };

    run();
  }, [user, token, isLoading, router]);

  const resetForm = () => {
    setEditingProductId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageUrl(undefined);
    setImageFile(null);
    setIsActive(true);
    setSuccessMsg(null);
    setError(null);
  };

  const startEdit = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(String(p.price));
    setStock(String(p.stock));
    setImageUrl(p.image_url || undefined);
    setImageFile(null);
    setIsActive(p.is_active);
    setSuccessMsg(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaving(true);
      setSuccessMsg(null);
      setError(null);

      let finalImageUrl = imageUrl;

      if (imageFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadProductImage(token, imageFile);
        } finally {
          setUploadingImage(false);
        }
      }

      const payload: Partial<Product> = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: price ? Number(price) : 0,
        stock: stock ? Number(stock) : 0,
        image_url: finalImageUrl,
        is_active: isActive,
      };

      let saved: Product;

      if (editingProductId) {
        saved = await updateProduct(token, editingProductId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === saved.id ? saved : p))
        );
        setSuccessMsg("تم تحديث المنتج بنجاح ✅");
      } else {
        saved = await createProduct(token, payload);
        setProducts((prev) => [saved, ...prev]);
        setSuccessMsg("تم إضافة المنتج بنجاح ✅");
      }

      setEditingProductId(saved.id);
      setImageFile(null);
      setImageUrl(saved.image_url || finalImageUrl);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccessMsg(null);
      await deleteProduct(token, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingProductId === id) {
        resetForm();
      }
      setSuccessMsg("تم حذف المنتج بنجاح ✅");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "تعذر حذف المنتج");
    } finally {
      setDeletingId(null);
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

  if (user.role !== "SELLER") {
    return (
      <MainLayout>
        <p className="text-sm text-[var(--text-muted)]">
          هذه الصفحة متاحة للبائعين فقط.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* الهيدر */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold mb-1">
              إدارة المنتجات
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              أضف وعدّل منتجات متجرك، الصور، الأسعار، والكمية المتاحة.
            </p>
            {store && (
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                المتجر: <span className="font-semibold">{store.name}</span>
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="mt-2 md:mt-0 rounded-2xl border border-[var(--primary)] text-[var(--primary)] text-sm px-4 py-2 hover:bg-[var(--primary)] hover:text-white"
          >
            إضافة منتج جديد ➕
          </button>
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

        <div className="grid gap-4 md:grid-cols-5">
          {/* الفورم */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-sm p-4 space-y-4"
            >
              <h2 className="text-sm font-semibold mb-1">
                {editingProductId
                  ? "تعديل المنتج"
                  : "إضافة منتج جديد"}
              </h2>

              {/* صورة المنتج */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  {imageFile ? (
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="صورة المنتج"
                      className="w-full h-full object-cover"
                    />
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="صورة المنتج"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">
                      لا توجد صورة
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <label className="block text-sm font-medium">
                    صورة المنتج
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                    }}
                    className="block w-full text-xs text-gray-500
                               file:mr-3 file:py-2 file:px-3
                               file:rounded-xl file:border-0
                               file:text-xs file:font-semibold
                               file:bg-[var(--primary)] file:text-white
                               hover:file:bg-[var(--primary-dark)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)]">
                    الصورة ستظهر للعملاء في قائمة المنتجات.
                  </p>
                </div>
              </div>

              {/* اسم المنتج */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  اسم المنتج
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="مثال: ملوخية فراش، كنافة بالكريمة..."
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <label className="block mb-1 text-sm font-medium">
                  وصف المنتج
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  rows={3}
                  placeholder="أكتب مكونات المنتج، الحجم، عدد الأفراد المناسبين..."
                />
              </div>

              {/* السعر + الكمية + الحالة */}
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    السعر (جنيه)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="مثال: 80"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    الكمية المتاحة (Stock)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    placeholder="مثال: 10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4"
                />
                <label
                  htmlFor="is_active"
                  className="text-xs text-[var(--text-muted)]"
                >
                  المنتج متاح للطلب حاليًا
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-2xl bg-[var(--primary)] text-white text-sm px-6 py-2.5 hover:bg-[var(--primary-dark)] disabled:opacity-60"
                >
                  {saving
                    ? uploadingImage
                      ? "جاري رفع الصورة وحفظ المنتج..."
                      : "جاري حفظ المنتج..."
                    : editingProductId
                    ? "حفظ التعديلات"
                    : "إضافة المنتج"}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-[var(--text-muted)] underline"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* قائمة المنتجات */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h2 className="text-sm font-semibold mb-3">
                المنتجات الحالية
              </h2>

              {loadingProducts ? (
                <p className="text-sm text-[var(--text-muted)]">
                  جاري تحميل المنتجات...
                </p>
              ) : products.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  لم تقم بإضافة أي منتجات حتى الآن.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="border border-gray-100 rounded-2xl p-3 flex gap-3 hover:shadow-sm transition cursor-pointer"
                      onClick={() => startEdit(p)}
                    >
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] text-gray-400">
                            لا صورة
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">
                            {p.name}
                          </span>
                          <span className="font-semibold">
                            {p.price} ج
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                            {p.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                          <span>الكمية: {p.stock}</span>
                          <span
                            className={
                              p.is_active
                                ? "text-green-600"
                                : "text-red-500"
                            }
                          >
                            {p.is_active ? "متاح" : "غير متاح"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(p);
                            }}
                            className="rounded-xl border px-3 py-1 text-[11px] hover:bg-gray-100"
                          >
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id);
                            }}
                            disabled={deletingId === p.id}
                            className="rounded-xl border border-red-300 text-red-600 px-3 py-1 text-[11px] hover:bg-red-50 disabled:opacity-60"
                          >
                            {deletingId === p.id
                              ? "جاري الحذف..."
                              : "حذف"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
