import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, Sparkles, Info } from "lucide-react";
import { apiPost } from "../api";
import StrengthBar from "../components/StrengthBar";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    masterPassword: "",
    confirmMaster: "",
    recoveryPin: "",
    confirmPin: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    if (form.masterPassword !== form.confirmMaster) {
      setStatus({ type: "error", message: "Master passwords do not match." });
      return;
    }
    if (form.recoveryPin !== form.confirmPin) {
      setStatus({ type: "error", message: "Recovery PINs do not match." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        master_password: form.masterPassword,
        recovery_pin: form.recoveryPin,
      };
      const res = await apiPost("/register", payload, { authRequired: false });
      setStatus({ type: "success", message: res.message || "Account created. You can now log in." });
      setTimeout(() => navigate("/login"), 500);
    } catch (err) {
      setStatus({ type: "error", message: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid">
      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="card-title">Create account</h2>
            <p className="card-subtitle">Master password + recovery PIN (for deletion/reset)</p>
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
              autoComplete="new-password"
            />
            <StrengthBar password={form.masterPassword} />
          </label>
          <label>
            Confirm master password
            <input required type="password" value={form.confirmMaster} onChange={update("confirmMaster")} />
          </label>
          <label>
            Recovery PIN
            <input
              required
              type="password"
              inputMode="numeric"
              value={form.recoveryPin}
              onChange={update("recoveryPin")}
              placeholder="6 digits"
            />
          </label>
          <label>
            Confirm recovery PIN
            <input
              required
              type="password"
              inputMode="numeric"
              value={form.confirmPin}
              onChange={update("confirmPin")}
            />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        {status && <div className={`alert ${status.type || ""}`}>{status.message}</div>}
        <div className="inline" style={{ marginTop: 10 }}>
          <span className="muted">Already have an account?</span>
          <Link className="pill" to="/login">
            Back to login
          </Link>
        </div>
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="card-title">Tips</h2>
            <p className="card-subtitle">Stay safe with a strong master secret</p>
          </div>
        </div>
        <ul className="tag-list">
          <li>Use a long, unique master password</li>
          <li>Keep the recovery PIN handy for account deletion and resets</li>
          <li>Enable 2FA after creating your account</li>
        </ul>
        <p className="muted">
          The React client mirrors the Python CLI: it calls <code>/register</code> with your username, master password,
          and recovery PIN.
        </p>
      </div>
    </div>
  );
}
