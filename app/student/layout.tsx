"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "text-gray-600 hover:text-blue-600";

  return (
    <div className="min-h-screen bg-gray-100">

      {/* NAVIGATION */}
      <nav className="w-full bg-white border-b shadow-sm px-6 py-4 flex gap-6 text-lg">
        <Link href="/student/dashboard" className={isActive("/student/dashboard")}>
          Dashboard
        </Link>

        <Link href="/student/chat" className={isActive("/student/chat")}>
          Chat
        </Link>
      </nav>

      {/* SEITEN-INHALT */}
      <div className="px-6 py-4">
        {children}
      </div>
    </div>
  );
}
