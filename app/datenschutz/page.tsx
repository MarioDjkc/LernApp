import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung – LernApp",
};

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← Zurück zur Startseite
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Datenschutzerklärung</h1>

        <div className="space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Verantwortlicher</h2>
            <p>
              Verantwortlicher im Sinne der DSGVO für den Betrieb dieser Plattform ist:<br />
              <strong>LernApp</strong><br />
              E-Mail: support@lernapp.example<br />
              Österreich
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Welche Daten wir erheben</h2>
            <p>Wir erheben und verarbeiten folgende personenbezogene Daten:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Registrierungsdaten:</strong> Name, E-Mail-Adresse, Passwort (verschlüsselt), Schulinformationen (Schultyp, Schulform, Stufe, Klasse)</li>
              <li><strong>Buchungsdaten:</strong> Terminangaben, gebuchte Lehrkraft, Zahlungsstatus</li>
              <li><strong>Zahlungsdaten:</strong> Werden über Stripe verarbeitet. Wir speichern lediglich Referenz-IDs, keine vollständigen Kartendaten.</li>
              <li><strong>Kommunikationsdaten:</strong> Nachrichten im Chat zwischen Schüler und Lehrkraft</li>
              <li><strong>Technische Daten:</strong> Session-Cookies für den sicheren Login</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Cookies</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies, die für den Betrieb
              der Plattform erforderlich sind:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>
                <strong>Session-Cookie (next-auth.session-token):</strong> Speichert deine Login-Sitzung
                sicher als verschlüsseltes JWT. Wird beim Abmelden gelöscht.
              </li>
              <li>
                <strong>Cookie-Einwilligung (cookie_consent):</strong> Speichert deine Entscheidung zur
                Cookie-Nutzung lokal in deinem Browser (localStorage). Kein Server-Zugriff.
              </li>
            </ul>
            <p className="mt-2">
              Wir verwenden keine Tracking-, Analyse- oder Werbe-Cookies. Du kannst deine
              Cookie-Einstellungen jederzeit über das Cookie-Symbol unten rechts ändern.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Zweck der Verarbeitung</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>Bereitstellung und Betrieb der Nachhilfeplattform</li>
              <li>Durchführung und Abrechnung von Buchungen</li>
              <li>Sichere Authentifizierung (Login/Logout)</li>
              <li>Kommunikation zwischen Schüler und Lehrkraft</li>
              <li>Versand von Buchungsbestätigungen und Benachrichtigungen per E-Mail</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Rechtsgrundlage</h2>
            <p>
              Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am
              sicheren Betrieb der Plattform). Für technisch notwendige Cookies gilt
              § 165 Abs. 3 TKG 2021 (Österreich).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Drittanbieter – Stripe</h2>
            <p>
              Für die Zahlungsabwicklung verwenden wir{" "}
              <strong>Stripe Payments Europe, Ltd.</strong> (1 Grand Canal Street Lower, Dublin 2,
              Irland). Stripe verarbeitet Zahlungsdaten gemäß eigener Datenschutzerklärung unter{" "}
              <a
                href="https://stripe.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                stripe.com/de/privacy
              </a>
              . Eine Datenübermittlung erfolgt nur soweit zur Zahlungsabwicklung notwendig.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für die genannten
              Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Nach
              Löschung deines Kontos werden deine Daten vollständig entfernt.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Deine Rechte</h2>
            <p>Du hast folgende Rechte gemäß DSGVO:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              <li>Beschwerde bei der österreichischen Datenschutzbehörde (dsb.gv.at)</li>
            </ul>
            <p className="mt-2">
              Für Anfragen wende dich an: <strong>support@lernapp.example</strong>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Änderungen</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren.
              Die aktuelle Version ist stets auf dieser Seite abrufbar.
            </p>
            <p className="mt-1 text-gray-500">Stand: März 2026</p>
          </section>

        </div>
      </div>
    </main>
  );
}
