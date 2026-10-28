export function toCents(amount: string | number | undefined) {
  const source = amount == null ? "0" : String(amount);
  const [whole = "0", fraction = "00"] = source.split(".");
  const dollars = Number(whole);
  const cents = Number(fraction.padEnd(2, "0").slice(0, 2));
  if (!Number.isFinite(dollars) || !Number.isFinite(cents)) return 0;
  return dollars * 100 + cents;
}

export function fromCents(cents: number) {
  const whole = Math.floor(cents / 100);
  const fraction = String(cents % 100).padStart(2, "0");
  return `${whole}.${fraction}`;
}
