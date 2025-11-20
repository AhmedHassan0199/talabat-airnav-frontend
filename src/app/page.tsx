"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function HomePage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (token) router.replace("/me");
    else router.replace("/login");
  }, [token, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-muted)]">
      جاري التوجيه...
    </div>
  );
}
