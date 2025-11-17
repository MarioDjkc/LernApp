import CheckoutButton from "../src/components/CheckoutButton";

export default function CheckoutTestPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Checkout Test</h1>

      <p>Dies ist eine Testseite, um den Stripe Checkout (mode=setup) zu testen.</p>

      <CheckoutButton
        teacherId="0ede85ea-72fb-45a3-a34a-0b573b3fbfc0"
        studentName="Max Mustermann"
        studentEmail="max@example.com"
        start={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()}
        end={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString()}
        priceCents={3000}
      />
    </div>
  );
}