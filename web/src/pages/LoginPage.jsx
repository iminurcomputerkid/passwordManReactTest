import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { apiBase, apiPost } from "../api";
import { useSession } from "../session";

export default function LoginPage() {
  const { sessionToken, login } = useSession();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    masterPassword: "",
    totpCode: "",
    recoveryPin: "",
  });
  const [loading, setLoading] = useState(false);
  const [needsTotp, setNeedsTotp] = useState(false);
  const [needsRecoveryPin, setNeedsRecoveryPin] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (sessionToken) {
      navigate("/vault/credentials");
    }
  }, [sessionToken, navigate]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = {
      username: form.username.trim(),
      master_password: form.masterPassword,
    };
    if (form.totpCode) payload.totp_code = form.totpCode.trim();
    if (form.recoveryPin) payload.recovery_pin = form.recoveryPin.trim();

    try {
      const res = await apiPost("/login", payload, { authRequired: false });
      login(res.session_token, res.username || form.username.trim());
      setStatus({ type: "success", message: res.message || "Logged in" });
      navigate("/vault/credentials");
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("2fa required") && !form.totpCode) {
        setNeedsTotp(true);
        setStatus({ type: "warning", message: "2FA required. Enter the authenticator code." });
      } else if (msg.includes("recovery pin required") && !form.recoveryPin) {
        setNeedsRecoveryPin(true);
        setStatus({ type: "warning", message: "Recovery PIN required. Please provide it to continue." });
      } else {
        setStatus({ type: "error", message: err.message || "Login failed" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <LockKeyhole size={18} />
          </div>
          <div>
            <h2 className="card-title">Login</h2>
            <p className="card-subtitle">Master password first; TOTP and PIN show only when required.</p>
          </div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Username
            <input required value={form.username} onChange={update("username")} autoComplete="username" />
          </label>
          <label>
            Master password
            <input
              required
              type="password"
              value={form.masterPassword}
              onChange={update("masterPassword")}
              autoComplete="current-password"
            />
          </label>

          {(needsTotp || form.totpCode) && (
            <label>
              2FA code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={form.totpCode}
                onChange={update("totpCode")}
                placeholder="6 digits"
              />
            </label>
          )}

          {(needsRecoveryPin || form.recoveryPin) && (
            <label>
              Recovery PIN
              <input
                type="password"
                inputMode="numeric"
                value={form.recoveryPin}
                onChange={update("recoveryPin")}
                placeholder="Required after repeated failures"
              />
            </label>
          )}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {status && <div className={`alert ${status.type || ""}`}>{status.message}</div>}
        <div className="inline" style={{ marginTop: 10 }}>
          <span className="muted">No account?</span>
          <Link className="pill" to="/register">
            Create one
          </Link>
        </div>
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="card-title">How login works</h2>
            <p className="card-subtitle">Stepwise auth with conditional prompts</p>
          </div>
        </div>
        <ul className="tag-list">
          <li>Step 1: Username + master password</li>
          <li>Step 2: Enter 2FA if the server requests it</li>
          <li>Step 3: Prompt for recovery PIN if too many bad attempts</li>
        </ul>
        <div className="result">
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
        </p>
      </div>
    </div>
  );
}
