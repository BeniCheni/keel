export function cusipCheckDigit(body: string): number | null {
  const chars = body.toUpperCase();
  if (chars.length !== 8) return null;
  let sum = 0;
  for (let i = 0; i < 8; i += 1) {
    const char = chars[i];
    if (char === undefined) return null;
    let value: number;
    if (char >= "0" && char <= "9") value = char.charCodeAt(0) - 48;
    else if (char >= "A" && char <= "Z") value = char.charCodeAt(0) - 55;
    else return null;
    if (i % 2 === 1) value *= 2;
    sum += Math.floor(value / 10) + (value % 10);
  }
  return (10 - (sum % 10)) % 10;
}

export function cusipCheckDigitFails(value: string): boolean {
  if (!/^[0-9A-Z]{9}$/.test(value)) return false;
  const digit = cusipCheckDigit(value.slice(0, 8));
  return digit === null || value[8] !== String(digit);
}
