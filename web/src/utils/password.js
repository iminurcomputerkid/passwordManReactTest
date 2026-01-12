const AMBIGUOUS = new Set("O0oIl1|`'\";:.,{}[]()\\/");

function randomChoice(str) {
  return str[Math.floor(Math.random() * str.length)];
}

export function generatePassword(length = 20, useSymbols = true, avoidAmbiguous = true) {
  if (length < 8) length = 8;

  let lowers = "abcdefghijklmnopqrstuvwxyz";
  let uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let digits = "0123456789";
  let symbols = "!@#$%^&*()-_=+[]{}<>?~";

  if (avoidAmbiguous) {
    const strip = (s) =>
      s
        .split("")
        .filter((ch) => !AMBIGUOUS.has(ch))
        .join("");
    lowers = strip(lowers);
    uppers = strip(uppers);
    digits = strip(digits);
    symbols = strip(symbols);
  }

  const pools = [lowers, uppers, digits, ...(useSymbols ? [symbols] : [])];
  const allChars = pools.join("");

  // guarantee at least one from each pool
  const pwd = pools.map(randomChoice);
  for (let i = pwd.length; i < length; i += 1) {
    pwd.push(randomChoice(allChars));
  }

  // Fisher-Yates shuffle
  for (let i = pwd.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }

  return pwd.join("");
}

export function passwordStrength(password = "") {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasDigit) score += 1;
  if (hasSymbol) score += 1;

  // Normalize to 0-4
  const normalized = Math.min(4, Math.max(0, score));
  const labels = ["Very weak", "Weak", "Okay", "Strong", "Very strong"];
  const colors = ["var(--destructive)", "var(--warning)", "var(--primary)", "var(--success)", "var(--success)"];

  return {
    score: normalized,
    label: labels[normalized],
    color: colors[normalized],
  };
}
