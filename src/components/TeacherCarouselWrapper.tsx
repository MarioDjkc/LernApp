"use client";

import type { Teacher } from "@/app/lib/types";

type Props = {
  teachers: Teacher[];
};

export default function TeacherCarouselWrapper({ teachers }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {teachers.map((t) => (
        <div
          key={t.id}
          className="min-w-[220px] rounded-2xl border shadow-sm bg-white p-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div>
              <div className="font-semibold">{t.name}</div>
              <div className="text-sm text-gray-600">{t.subject}</div>
            </div>
          </div>
          <div className="text-sm text-yellow-400">
            {"★".repeat(t.rating ?? 5)}
            {"☆".repeat(5 - (t.rating ?? 5))}
          </div>
        </div>
      ))}
    </div>
  );
}
