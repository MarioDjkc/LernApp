// app/teacher/layout.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation oben */}
      <nav className="w-full bg-white shadow px-6 py-4 flex gap-6 text-base">
        <Link
          href="/teacher/dashboard"
          className={isActive("/teacher/dashboard")}
        >
          Dashboard
        </Link>

        <Link
          href="/teacher/subjects"
          className={isActive("/teacher/subjects")}
        >
          Meine Fächer
        </Link>

        <Link
          href="/teacher/chat"
          className={isActive("/teacher/chat")}
        >
          Chat
        </Link>

        <Link
          href="/teacher/availability"
          className={isActive("/teacher/availability")}
        >
          Verfügbarkeit
        </Link>

        <Link
          href="/teacher/payments"
          className={isActive("/teacher/payments")}
        >
          Payments
        </Link>
      </nav>

      {/* Seiteninhalt */}
      <main className="p-6">{children}</main>
    </div>
  );
}
