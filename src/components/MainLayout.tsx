import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        
        {/* Left — App Name */}
        <Link href="/" className="text-lg font-semibold">
          سوق الكمبوند
        </Link>

        {/* Right — Icons */}
        <div className="flex items-center gap-4 text-xl">
          
          {/* Home */}
          <Link href="/" className="hover:text-[var(--primary)] transition">
            🏠
          </Link>

          {/* Profile */}
          <Link href="/me" className="hover:text-[var(--primary)] transition">
            👤
          </Link>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
