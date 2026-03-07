// app/teacher/layout.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
    if (status === "authenticated" && (session.user as any)?.role !== "teacher") {
      router.replace("/");
    }
  }, [status, session]);

  // Fetch pending booking count + unread chat count whenever the route changes
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.email) return;
    const email = encodeURIComponent(session.user.email);

    fetch(`/api/bookings/teacher?email=${email}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const count = (data.bookings ?? []).filter(
          (b: { status: string }) => b.status === "payment_method_saved"
        ).length;
        setPendingCount(count);
      })
      .catch(() => {});

    fetch(`/api/teacher/unread-chats-count?email=${email}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => setUnreadChatCount(data.count ?? 0))
      .catch(() => {});
  }, [pathname, status, session]);

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-blue-600 font-semibold"
      : "text-gray-700 hover:text-blue-600";

  if (status === "loading" || status === "unauthenticated") return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation oben */}
      <nav className="w-full bg-white shadow px-6 py-4 flex items-center gap-6 text-base">
        <Link href="/teacher/dashboard" className={isActive("/teacher/dashboard")}>
          Dashboard
        </Link>
        <Link href="/teacher/subjects" className={isActive("/teacher/subjects")}>
          Meine Fächer
        </Link>
        <Link href="/teacher/chat" className={`relative ${isActive("/teacher/chat")}`}>
          Chat
          {unreadChatCount > 0 && (
            <span className="absolute -bottom-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {unreadChatCount}
            </span>
          )}
        </Link>
        <Link href="/teacher/availability" className={isActive("/teacher/availability")}>
          Verfügbarkeit
        </Link>
        <Link href="/teacher/payments" className={isActive("/teacher/payments")}>
          Payments
        </Link>
        <Link href="/teacher/profile" className={isActive("/teacher/profile")}>
          Profil
        </Link>

        <Link href="/teacher/bookings" className={`relative ${isActive("/teacher/bookings")}`}>
          Buchungen
          {pendingCount > 0 && (
            <span className="absolute -bottom-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center leading-none">
              {pendingCount}
            </span>
          )}
        </Link>

        <div className="ml-auto flex items-center gap-3 text-sm text-gray-500">
          <span>{session?.user?.name || session?.user?.email}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
          >
            Abmelden
          </button>
        </div>
      </nav>

      {/* Seiteninhalt */}
      <main className="p-6">{children}</main>
    </div>
  );
}
