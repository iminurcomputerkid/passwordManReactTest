import { passwordStrength } from "../utils/password";

export default function StrengthBar({ password }) {
  if (!password) {
    return <div className="strength-muted">Enter a password to see strength</div>;
  }

  const { score, label, color } = passwordStrength(password);
  const segments = Array.from({ length: 4 }).map((_, idx) => idx < score);

  return (
    <div className="strength">
      <div className="strength-bar">
        {segments.map((active, idx) => (
          <span
            key={idx}
            className={`strength-segment ${active ? "active" : ""}`}
            style={active ? { background: `hsl(${color})` } : undefined}
          />
        ))}
      </div>
      <div className="strength-label">{label}</div>
    </div>
  );
}
