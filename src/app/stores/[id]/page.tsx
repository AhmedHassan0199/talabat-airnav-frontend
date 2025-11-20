"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../../components/MainLayout";
import { useCart } from "../../../components/CartProvider";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "/api";

type StoreDetails = {
  id: number;
  name: string;
  description?: string;
  category: string;
  min_order_amount: number;
  delivery_fee: number;
  profile_image_url?: string;
  avg_rating?: number;
  reviews_count?: number;
};

type StoreProduct = {
  id: number;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  stock: number;
  is_active: boolean;
};

export default function StorePage() {
  const params = useParams();
  const storeId = Number(params?.id);

  const { addItem } = useCart();

  const [store, setStore] = useState<StoreDetails | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<StoreProduct | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/stores/${storeId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "تعذر تحميل بيانات المتجر");
        }
        setStore(data.store);
        setProducts(data.products || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "تعذر تحميل بيانات المتجر");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [storeId]);

  const openProductModal = (product: StoreProduct) => {
    setSelectedProduct(product);
    setModalQty(1);
    setModalError(null);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setModalQty(1);
    setModalError(null);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !store) return;
    if (modalQty <= 0) {
      setModalError("الكمية يجب أن تكون 1 على الأقل");
      return;
    }
    addItem(
      store.id,
      store.name,
      {
        productId: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        imageUrl: selectedProduct.image_url,
      },
      modalQty
    );
    closeProductModal();
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        {/* Header / store info */}
        {isLoading ? (
          <p className="text-sm text-[var(--text-muted)]">
            جاري تحميل بيانات المتجر...
          </p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !store ? (
          <p className="text-sm text-[var(--text-muted)]">
            المتجر غير متاح.
          </p>
        ) : (
          <>
            <div className="flex gap-3 items-start">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0">
                {store.profile_image_url ? (
                  <img
                    src={store.profile_image_url}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    لا صورة
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold mb-1">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="text-sm text-[var(--text-muted)] mb-1">
                    {store.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-[var(--text-muted)]">
                  <span>
                    الحد الأدنى للطلب: {store.min_order_amount} ج
                  </span>
                  <span>•</span>
                  <span>التوصيل: {store.delivery_fee} ج</span>
                  {typeof store.avg_rating === "number" &&
                    store.reviews_count !== undefined && (
                      <>
                        <span>•</span>
                        <span>
                          ⭐ {store.avg_rating} ({store.reviews_count} تقييم)
                        </span>
                      </>
                    )}
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div>
              <h2 className="text-sm font-semibold mb-2">
                قائمة المنتجات
              </h2>
              {products.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">
                  لا توجد منتجات متاحة حاليًا في هذا المتجر.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => openProductModal(p)}
                      className="text-right bg-white rounded-2xl border border-gray-100 shadow-sm p-3 hover:shadow-md transition flex flex-col gap-2"
                    >
                      <div className="w-full h-32 rounded-xl bg-gray-100 overflow-hidden">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] text-gray-400">
                            لا صورة
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between">
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
                        <span className="text-[11px] text-[var(--text-muted)]">
                          الكمية المتاحة: {p.stock}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Floating Product Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end md:items-center justify-center"
          onClick={closeProductModal}
        >
          <div
            className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl p-4 space-y-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-1">
              <h2 className="text-base font-semibold">
                {selectedProduct.name}
              </h2>
              <button
                className="text-xs text-[var(--text-muted)]"
                onClick={closeProductModal}
              >
                إغلاق ✕
              </button>
            </div>

            <div className="w-full h-48 rounded-2xl bg-gray-100 overflow-hidden">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                  لا صورة
                </div>
              )}
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {selectedProduct.price} ج
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  الكمية المتاحة: {selectedProduct.stock}
                </span>
              </div>
              {selectedProduct.description && (
                <p className="text-xs text-[var(--text-muted)]">
                  {selectedProduct.description}
                </p>
              )}
            </div>

            {/* Quantity selector (+ on right, - on left) */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-[var(--text-muted)]">
                الكمية
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setModalQty((q) => (q > 1 ? q - 1 : 1))
                  }
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-base"
                >
                  -
                </button>
                <span className="min-w-[24px] text-center text-sm font-semibold">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setModalQty((q) =>
                      q < selectedProduct.stock ? q + 1 : q
                    )
                  }
                  className="w-8 h-8 rounded-full border flex items-center justify-center text-base"
                >
                  +
                </button>
              </div>
            </div>

            {modalError && (
              <p className="text-xs text-red-600">{modalError}</p>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full mt-2 rounded-2xl bg-[var(--primary)] text-white text-sm py-2.5 hover:bg-[var(--primary-dark)]"
            >
              إضافة إلى السلة
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
