"use client";

import { SessionProvider } from "next-auth/react";
import CookieBanner from "./CookieBanner";

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // SessionProvider itself sets no cookies — it only reads an existing session.
  // Cookies are only written when signIn() is called, which is blocked by
  // CookieBanner until the user explicitly accepts.
  return (
    <SessionProvider>
      {children}
      <CookieBanner onAccept={() => {}} />
    </SessionProvider>
  );
}
