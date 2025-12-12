// app/teacher/layout.tsx
"use client";

import Link from "next/link";
import "../globals.css";
import { usePathname } from "next/navigation";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "hover:text-blue-600";

  return (
    <div className="bg-gray-50 min-h-screen">

      {/* Navigation oben */}
      <nav className="w-full bg-white shadow px-6 py-4 flex gap-6 text-lg font-medium">

        <Link href="/teacher/dashboard" className={isActive("/teacher/dashboard")}>
          Dashboard
        </Link>

        <Link href="/teacher/chat" className={isActive("/teacher/chat")}>
          Chat
        </Link>

        <Link href="/teacher/availability" className={isActive("/teacher/availability")}>
          Verfügbarkeit
        </Link>
      </nav>

      {/* Seiteninhalt */}
      <div className="p-6">{children}</div>
    </div>
  );
}
