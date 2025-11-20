async function uploadProductImage(token: string, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api"}/uploads/product-image`,
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
    throw new Error(data.message || "فشل رفع الصورة");
  }
  return data.url as string;
}
