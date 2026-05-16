export function formatPrice(cents: number, currency = "USD", locale = "en") {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
