# LernApp – Projektübersicht für Claude

## Tech-Stack
- **Framework:** Next.js (App Router + Pages Router gemischt)
- **Datenbank:** SQLite via Prisma ORM (`prisma/dev.db`)
- **Auth:** NextAuth mit JWT (Credentials Provider) – getrennt für Lehrer und Schüler
- **E-Mail:** Nodemailer (Gmail SMTP)
- **Zahlungen:** Stripe (teilweise implementiert, kein STRIPE_SECRET_KEY gesetzt)
- **UI:** Tailwind CSS
- **Kalender:** FullCalendar (Lehrer-Dashboard)

## Projektstruktur

```
app/
  admin/           → Admin-Panel (Login, Dashboard, Lehrer, Schüler, Buchungen, Bewerbungen)
  api/
    admin/         → stats, teachers (GET+POST), teachers/[id] (DELETE), students, bookings, applications
    bookings/      → route.ts (POST), student/, teacher/, update-status/, student (POST via availabilityId)
    student/       → bookings (GET), checkout (POST), availability (GET), chat (GET)
    teacher/       → me, profile, offers, availability, payments, chat, set-password
    teachers/      → route.ts (GET+POST), apply, list, [id]
    admin/         → login, logout
    auth/          → [...nextauth] in pages/api/auth/
  student/         → layout.tsx (nav: Dashboard, Chat, Payments), dashboard/, chat/, payments/
  teacher/         → layout.tsx (nav: Dashboard, Meine Fächer, Chat, Verfügbarkeit, Payments)
                     dashboard/, subjects/, chat/, availability/, payments/, set-password/
  auth/            → login (Schüler), teacher/login, error/
  book/[teacherId] → Buchungsseite für Schüler
  admin/           → login, page (Dashboard), teachers/, students/, bookings/, applications/
  components/      → ChatWidget, ContactForm, SessionProviderWrapper, TeacherApplySection, TeacherGrid
src/components/    → TeacherCard, TeacherCarousel, TeacherCarouselWrapper
pages/api/
  auth/[...nextauth].ts  → NextAuth Konfiguration (authOptions exportiert)
  teacher/               → onboarding-link, create-test
  bookings/confirm.ts    → Stripe Charge Endpoint (für später)
prisma/
  schema.prisma    → Datenbankschema
  dev.db           → SQLite Datenbank
```

## Datenbankmodelle (Prisma)
- **User** – Schüler (email, password, name, role, schoolTrack, schoolForm, schoolName, level, grade, stripeCustomerId)
- **Teacher** – Lehrer (name, email, subject, password, mustChangePassword, unterstufeOnly)
- **TeachingOffer** – Angebot pro Lehrer/Fach/Schulstufe (schoolTrack, schoolForm, level, minGrade, maxGrade)
- **Availability** – Verfügbare Zeitslots (teacherId, date, start, end, offerId)
- **Booking** – Buchungen (studentId, teacherId, start, end, priceCents, currency, status, note, availabilityId, Stripe-Felder)
- **TeacherApplication** – Bewerbungen (name, email, subject, letter, filePath)
- **Chat / ChatMessage** – Chat-System
- **PasswordResetToken** – Token für Lehrer Passwort-Reset

## Booking-Flow
1. Schüler geht auf `/book/[teacherId]`
2. Gibt Name, Email, Fach ein → lädt Slots via `GET /api/student/availability?teacherId=&subject=&studentEmail=`
3. Wählt Slot → `POST /api/bookings` mit `{teacherId, studentName, studentEmail, start, end, availabilityId}`
4. Lehrer sieht Buchung im Kalender (`/teacher/dashboard`) → klickt → Annehmen/Ablehnen
5. `POST /api/bookings/update-status` mit `{bookingId, status: "accepted"|"declined"}`
6. Bei accepted: Slot wird gelöscht + Chat wird automatisch erstellt
7. Schüler sieht Buchung in `/student/payments`

## Auth
- NextAuth in `pages/api/auth/[...nextauth].ts`
- `authOptions` wird aus dieser Datei importiert: `import { authOptions } from "@/pages/api/auth/[...nextauth]"`
- Zwei Provider: `teacher-credentials` und `student-credentials`
- Session enthält: `user.id`, `user.email`, `user.name`, `user.role` ("teacher" oder "student")

## Admin Panel
- Login via `POST /api/admin/login` → setzt Cookie `admin_auth=1`
- URL: `/admin/login` → `/admin` (Dashboard)
- Admin-Key in `.env`: `ADMIN_KEY=mario2812`
- HINWEIS: Cookie-Auth-Checks in den Admin-APIs wurden entfernt weil sie nicht funktionierten
  → Admin-Panel ist aktuell ohne Auth zugänglich (muss vor Produktion gefixt werden)

## Payments (Stripe)
- `lib/stripe.ts` – Stripe Client (braucht `STRIPE_SECRET_KEY` in .env)
- `app/api/student/checkout/route.ts` – Erstellt Stripe Checkout Session (SetupIntent)
- `pages/api/bookings/confirm.ts` – Belastet gespeicherte Karte (für später)
- Noch nicht produktionsbereit: kein Webhook, kein STRIPE_SECRET_KEY

## Zwei Prisma-Instanzen (bekanntes Problem)
- `app/lib/prisma.ts` – Default Export (wird von App Router APIs verwendet)
- `lib/prisma.ts` – Named Export `{ prisma }` (wird von pages/api verwendet)

## Was noch fehlt vor Produktion
1. Admin-Panel Auth reparieren (Cookie-Check funktioniert nicht)
2. Stripe vollständig implementieren (Key, Webhook, echte Abbuchung)
3. SQLite → PostgreSQL für Produktion
4. `middleware.off.ts` – Middleware ist deaktiviert (umbenennen zu `middleware.ts` wenn bereit)

## Bekannte Eigenheiten
- `app/aplly/` – Tippfehler im Ordnernamen (Testseite, irrelevant)
- `app/apply-test/` – Testseite
- Zwei postcss configs (`postcss.config.js` + `postcss.config.mjs`)
- `node` und `npm` Dateien im Root (ungewöhnlich, nicht löschen ohne zu prüfen)
