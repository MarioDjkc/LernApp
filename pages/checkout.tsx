export default function CheckoutPage() {
  async function handleCheckout() {
    const res = await fetch("/api/stripe/webhook/create-checkout-session", {
      method: "POST",
    });

    const data = await res.json();
    window.location.href = data.url;
  }

  return (
    <button onClick={handleCheckout}>
      Jetzt bezahlen
    </button>
  );
}