"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import { useAuth } from "../../../components/AuthProvider";
import {
  fetchMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  Product,
  uploadProductImage,
} from "../../../lib/products";

export default function SellerProductsPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);

  // form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState<string>("0");
  const [isActive, setIsActive] = useState(true);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // حماية المسار
  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!user) return;
    if (user.role !== "SELLER") {
      router.replace("/me");
    }
  }, [user, token, isLoading, router]);

  // تحميل المنتجات
  useEffect(() => {
    const run = async () => {
      if (!token || !user || user.role !== "SELLER") {
        setIsFetching(false);
        return;
      }
      try {
        setIsFetching(true);
        setError(null);
        const data = await fetchMyProducts(token);
        setProducts(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل المنتجات");
      } finally {
        setIsFetching(false);
      }
    };
    run();
  }, [token, user]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setImageUrl("");
    setStock("0");
    setIsActive(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setImageUrl(product.image_url || "");
    setStock(String(product.stock ?? 0));
    setIsActive(product.is_active);
    setSuccess(null);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError("برجاء تسجيل الدخول مرة أخرى.");
      return;
    }
    if (!name.trim()) {
      setError("اسم المنتج مطلوب.");
      return;
    }
    if (!price || isNaN(Number(price))) {
      setError("برجاء إدخال سعر صالح.");
      return;
    }

    try {
      setIsSaving(true);
      
      let finalImageUrl = imageUrl.trim() || undefined;
        // لو فيه فايل جديد مرفوع:
    if (imageFile && token) {
        setIsUploading(true);
        try {
        finalImageUrl = await uploadProductImage(token, imageFile);
        } finally {
        setIsUploading(false);
        }
    }
    const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        image_url: finalImageUrl,
        stock: Number(stock || 0),
        is_active: isActive,
    };

      let saved: Product;
      if (editingId) {
        saved = await updateProduct(token, editingId, payload);
        setProducts((prev) =>
          prev.map((p) => (p.id === saved.id ? saved : p))
        );
        setSuccess("تم حفظ تعديلات المنتج.");
      } else {
        saved = await createProduct(token, payload);
        setProducts((prev) => [saved, ...prev]);
        setSuccess("تم إضافة المنتج بنجاح.");
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء حفظ المنتج");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!token) return;
    const ok = confirm(`هل تريد حذف المنتج "${product.name}"؟`);
    if (!ok) return;

    try {
      await deleteProduct(token, product.id);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err: any) {
      console.error(err);
      alert(err.message || "تعذر حذف المنتج");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-semibold">إدارة المنتجات</h1>
          <button
            onClick={() => router.push("/seller/store")}
            className="text-xs rounded-xl border px-3 py-1 hover:bg-gray-50"
          >
            الرجوع لبيانات المتجر
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* form */}
          <div className="md:col-span-1 bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-3">
              {editingId ? "تعديل منتج" : "إضافة منتج جديد"}
            </h2>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  اسم المنتج
                </label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فتوش / سلطة سيزر"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
                  وصف المنتج
                </label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="مثال: سلطة خضراء طازجة مع صوص خاص..."
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    السعر (جنيه)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="مثال: 40"
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 text-sm font-medium">
                    المخزون (عدد الوحدات)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="مثال: 20"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">
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
                {imageUrl && (
                    <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                    تم اختيار صورة. يمكنك استبدالها برفع صورة أخرى.
                    </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive">المنتج متاح حالياً للطلبات</label>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center rounded-xl bg-[var(--primary)] text-white text-sm font-medium px-4 py-2.5 hover:bg-[var(--primary-dark)] transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                {isSaving
                ? isUploading
                    ? "جاري رفع الصورة وحفظ المنتج..."
                    : "جاري حفظ المنتج..."
                : editingId
                ? "حفظ التعديلات"
                : "إضافة المنتج"}

                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border px-3 py-2 text-xs hover:bg-gray-50"
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* قائمة المنتجات */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-3">قائمة المنتجات</h2>

            {isFetching ? (
              <p className="text-sm text-[var(--text-muted)]">
                جاري تحميل المنتجات...
              </p>
            ) : products.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                لا توجد منتجات حتى الآن. يمكنك إضافة أول منتج من النموذج على
                اليسار.
              </p>
            ) : (
              <div className="space-y-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex gap-3 border border-gray-100 rounded-2xl p-3 items-center"
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400 flex-shrink-0">
                        بدون صورة
                      </div>
                    )}

                    <div className="flex-1 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.name}</div>
                          {p.description && (
                            <div className="text-xs text-[var(--text-muted)] line-clamp-2">
                              {p.description}
                            </div>
                          )}
                        </div>
                        <div className="text-left text-sm font-semibold">
                          {p.price} ج
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>المخزون: {p.stock}</span>
                        <span>
                          الحالة:{" "}
                          {p.is_active ? "متاح" : "موقوف مؤقتاً"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        className="text-xs rounded-xl border px-2 py-1 hover:bg-gray-50"
                        onClick={() => handleEditClick(p)}
                      >
                        تعديل
                      </button>
                      <button
                        className="text-xs rounded-xl border px-2 py-1 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(p)}
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
