// app/teacher/layout.tsx
import Link from "next/link";
import "../globals.css";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navigation oben */}
      <nav className="w-full bg-white shadow px-6 py-4 flex gap-6 text-lg font-medium">
        <Link href="/teacher/dashboard" className="hover:text-blue-600">
          Dashboard
        </Link>
        <Link href="/teacher/chat" className="hover:text-blue-600">
          Chat
        </Link>
      </nav>

      {/* Seiteninhalt */}
      <div className="p-6">{children}</div>
    </div>
  );
}
