"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "cookie_consent";

export default function CookieBanner({ onAccept }: { onAccept: () => void }) {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // Show banner on first visit (no decision stored yet)
    if (!localStorage.getItem(CONSENT_KEY)) {
      setBannerVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setBannerVisible(false);
    onAccept();
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, "declined");
    setBannerVisible(false);
  }

  return (
    <>
      {/* Banner */}
      {bannerVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-gray-200 shadow-lg px-4 py-5 sm:px-8">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 text-sm text-gray-700">
              <p className="font-semibold text-gray-900 mb-1">Wir verwenden Cookies</p>
              <p>
                Diese Website verwendet notwendige Cookies für den Login und die sichere
                Zahlungsabwicklung über Stripe. Ohne diese Cookies kann die Plattform nicht
                genutzt werden. Weitere Informationen findest du in unserer{" "}
                <a href="/datenschutz" className="underline text-blue-600 hover:text-blue-800">
                  Datenschutzerklärung
                </a>
                .
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 font-medium"
              >
                Ablehnen
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
              >
                Akzeptieren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent floating cookie settings button — always visible */}
      {!bannerVisible && (
        <button
          onClick={() => setBannerVisible(true)}
          title="Cookie-Einstellungen ändern"
          aria-label="Cookie-Einstellungen ändern"
          className="fixed bottom-5 right-5 z-[9998] w-11 h-11 rounded-full bg-white border border-gray-300 shadow-md flex items-center justify-center text-xl hover:bg-gray-50 hover:shadow-lg transition-shadow"
        >
          🍪
        </button>
      )}
    </>
  );
}
