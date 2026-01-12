import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiPost } from "../api";
import { useSession } from "../session";
import { QrCode, Shield, ShieldOff, Trash2 } from "lucide-react";

function buildOtpauth(secret, account, issuer = "SecureASF") {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const qs = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${qs.toString()}`;
}

export default function AccountSettingsPage() {
  const { username, logout } = useSession();

  const [enableInfo, setEnableInfo] = useState(null);
  const [enableStatus, setEnableStatus] = useState(null);

  const [disableForm, setDisableForm] = useState({ master_password: "", recovery_pin: "" });
  const [disableStatus, setDisableStatus] = useState(null);

  const [deleteForm, setDeleteForm] = useState({ recovery_pin: "" });
  const [deleteStatus, setDeleteStatus] = useState(null);

  async function handleEnable() {
    setEnableStatus(null);
    try {
      const res = await apiPost("/2fa/enable", {});
      const secret = res?.totp_secret || res?.secret;
      const uri =
        res?.provisioning_uri ||
        res?.otpauth_uri ||
        (secret ? buildOtpauth(secret, username || "user", "SecureASF") : null);
      setEnableInfo({ secret, uri });
      setEnableStatus({ type: "success", message: "2FA enabled. Scan or enter the secret in your authenticator app." });
    } catch (err) {
      setEnableStatus({ type: "error", message: err.message || "Failed to enable 2FA" });
    }
  }

  const updateDisableForm = (field) => (e) => setDisableForm({ ...disableForm, [field]: e.target.value });

  async function handleDisable(e) {
    e.preventDefault();
    setDisableStatus(null);
    try {
      const payload = {};
      if (disableForm.master_password) payload.master_password = disableForm.master_password;
      if (disableForm.recovery_pin) payload.recovery_pin = disableForm.recovery_pin;
      const res = await apiPost("/2fa/disable", payload);
      setDisableStatus({ type: "success", message: res?.message || "2FA disabled." });
    } catch (err) {
      setDisableStatus({ type: "error", message: err.message || "Failed to disable 2FA" });
    }
  }

  const updateDeleteForm = (field) => (e) => setDeleteForm({ ...deleteForm, [field]: e.target.value });

  async function handleDelete(e) {
    e.preventDefault();
    setDeleteStatus(null);
    try {
      const res = await apiPost("/account/delete", deleteForm);
      setDeleteStatus({ type: "success", message: res?.message || "Account deleted. Logging out..." });
      logout();
    } catch (err) {
      setDeleteStatus({ type: "error", message: err.message || "Failed to delete account" });
    }
  }

  return (
    <div className="grid">
      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <QrCode size={18} />
          </div>
          <div>
            <h2 className="card-title">Two-factor authentication</h2>
            <p className="card-subtitle">Enable TOTP (Google Authenticator, Authy, etc.)</p>
          </div>
        </div>
        <div className="inline" style={{ marginBottom: 12 }}>
          <button className="btn" onClick={handleEnable}>
            Enable 2FA
          </button>
          {enableStatus && <span className={`pill ${enableStatus.type || ""}`}>{enableStatus.message}</span>}
        </div>

        {enableInfo?.secret && (
          <div className="stack">
            <div className="muted">Secret:</div>
            <code>{enableInfo.secret}</code>
          </div>
        )}
        {enableInfo?.uri && (
          <div className="stack" style={{ marginTop: 12 }}>
            <div className="muted">Scan QR:</div>
            <div className="qr-box">
              <QRCodeSVG value={enableInfo.uri} size={160} bgColor="transparent" fgColor="#e2e8f0" />
            </div>
            <div className="muted">If scanning fails, add manually with the secret above.</div>
          </div>
        )}

        {enableStatus && enableStatus.type === "error" && (
          <div className={`alert ${enableStatus.type}`}>{enableStatus.message}</div>
        )}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <ShieldOff size={18} />
          </div>
          <div>
            <h2 className="card-title">Disable 2FA</h2>
            <p className="card-subtitle">Provide master password and/or recovery PIN</p>
          </div>
        </div>
        <form className="form" onSubmit={handleDisable}>
          <label>
            Master password
            <input
              type="password"
              value={disableForm.master_password}
              onChange={updateDisableForm("master_password")}
            />
          </label>
          <label>
            Recovery PIN
            <input
              type="password"
              inputMode="numeric"
              value={disableForm.recovery_pin}
              onChange={updateDisableForm("recovery_pin")}
            />
          </label>
          <button className="btn" type="submit">
            Disable 2FA
          </button>
        </form>
        {disableStatus && <div className={`alert ${disableStatus.type || ""}`}>{disableStatus.message}</div>}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="card-title">Delete account</h2>
            <p className="card-subtitle">Deletes all stored data (requires recovery PIN)</p>
          </div>
        </div>
        <form className="form" onSubmit={handleDelete}>
          <label>
            Recovery PIN
            <input
              required
              type="password"
              inputMode="numeric"
              value={deleteForm.recovery_pin}
              onChange={updateDeleteForm("recovery_pin")}
            />
          </label>
          <button className="btn" type="submit">
            Delete my account
          </button>
        </form>
        {deleteStatus && <div className={`alert ${deleteStatus.type || ""}`}>{deleteStatus.message}</div>}
      </div>
    </div>
  );
}
