import { useState } from "react";
import { apiDelete, apiGet, apiPost } from "../api";
import { generatePassword } from "../utils/password";
import { KeyRound, List, Trash2, Sparkles } from "lucide-react";
import StrengthBar from "../components/StrengthBar";

export default function CredentialsPage() {
  const [addForm, setAddForm] = useState({ site: "", s_username: "", s_password: "" });
  const [addStatus, setAddStatus] = useState(null);

  const [viewResult, setViewResult] = useState(null);
  const [viewStatus, setViewStatus] = useState(null);
  const [viewSite, setViewSite] = useState("");

  const [sites, setSites] = useState([]);
  const [sitesStatus, setSitesStatus] = useState(null);

  const [deleteForm, setDeleteForm] = useState({ site: "", recovery_pin: "" });
  const [deleteStatus, setDeleteStatus] = useState(null);

  const handleAddChange = (field) => (e) => setAddForm({ ...addForm, [field]: e.target.value });

  function normalizeList(res) {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === "string") {
      const cleaned = res.replace(/^\s*Sites:\s*/i, "").trim();
      const withoutBrackets = cleaned.replace(/^\[/, "").replace(/\]$/, "");
      const splitByComma = withoutBrackets
        .split(/[\n,]+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.replace(/^['"]|['"]$/g, ""));
      if (splitByComma.length > 1) return splitByComma;
      const splitBySpace = withoutBrackets
        .split(/\s+/)
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.replace(/^['"]|['"]$/g, ""));
      return splitBySpace.length > 1 ? splitBySpace : [withoutBrackets].filter(Boolean);
    }
    if (typeof res === "object") {
      const values = Object.values(res).flatMap((value) => (Array.isArray(value) ? value : [value]));
      if (values.length === 1 && typeof values[0] === "string") {
        return normalizeList(values[0]);
      }
      return values.map((value) => (typeof value === "string" ? value : JSON.stringify(value)));
    }
    return [];
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAddStatus(null);
    try {
      const res = await apiPost("/vault/site", addForm);
      setAddStatus({ type: "success", message: "Stored credentials." });
      if (res) setAddStatus({ type: "success", message: JSON.stringify(res) });
      await handleListSites();
    } catch (err) {
      setAddStatus({ type: "error", message: err.message || "Failed to store credentials" });
    }
  }

  async function handleView(site) {
    setViewStatus(null);
    setViewResult(null);
    try {
      const res = await apiGet(`/vault/site/${encodeURIComponent(site)}`);
      setViewResult(res);
      setViewSite(site);
    } catch (err) {
      setViewStatus({ type: "error", message: err.message || "Lookup failed" });
    }
  }

  async function handleListSites() {
    setSitesStatus(null);
    try {
      const res = await apiGet("/vault/sites");
      const normalized = normalizeList(res);
      setSites(normalized);
      if (normalized.length === 0) {
        setSitesStatus({ type: "warning", message: "No sites stored yet." });
      }
    } catch (err) {
      setSitesStatus({ type: "error", message: err.message || "Failed to list sites" });
    }
  }

  const handleDeleteChange = (field) => (e) => setDeleteForm({ ...deleteForm, [field]: e.target.value });

  async function handleDelete(e) {
    e.preventDefault();
    setDeleteStatus(null);
    try {
      const res = await apiDelete("/vault/site", deleteForm);
      setDeleteStatus({ type: "success", message: res?.message || "Deleted." });
      await handleListSites();
    } catch (err) {
      setDeleteStatus({ type: "error", message: err.message || "Delete failed" });
    }
  }

  function fillGenerated() {
    setAddForm((prev) => ({ ...prev, s_password: generatePassword() }));
  }

  return (
    <div className="grid">
      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <KeyRound size={18} />
          </div>
          <div>
            <h2 className="card-title">Add credentials</h2>
            <p className="card-subtitle">Create or overwrite a site login</p>
          </div>
        </div>
        <form className="form" onSubmit={handleAdd}>
          <label>
            Site
            <input required value={addForm.site} onChange={handleAddChange("site")} placeholder="example.com" />
          </label>
          <label>
            Site username
            <input required value={addForm.s_username} onChange={handleAddChange("s_username")} />
          </label>
          <label>
            Site password
            <div className="input-row">
              <input
                required
                type="text"
                value={addForm.s_password}
                onChange={handleAddChange("s_password")}
                placeholder="•••••••"
              />
              <button className="btn secondary" type="button" onClick={fillGenerated}>
                <Sparkles size={16} />
                Generate strong password
              </button>
            </div>
            <StrengthBar password={addForm.s_password} />
          </label>
          <button className="btn" type="submit">
            Save credentials
          </button>
        </form>
        {addStatus && <div className={`alert ${addStatus.type || ""}`}>{addStatus.message}</div>}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <List size={18} />
          </div>
          <div>
            <h2 className="card-title">List sites</h2>
            <p className="card-subtitle">Click a site to view credentials</p>
          </div>
        </div>
        <button className="btn" onClick={handleListSites}>
          Refresh list
        </button>
        {sitesStatus && <div className={`alert ${sitesStatus.type || ""}`}>{sitesStatus.message}</div>}
        {sites && sites.length > 0 && (
          <ul className="tag-list" style={{ marginTop: 12 }}>
            {sites.map((site) => (
              <li key={site}>
                <button className="tag-button" type="button" onClick={() => handleView(site)}>
                  {site}
                </button>
              </li>
            ))}
          </ul>
        )}
        {viewResult && (
          <div className="result" style={{ marginTop: 12 }}>
            <div>
              <strong>Site:</strong> {viewResult.site || viewSite}
            </div>
            <div>
              <strong>Username:</strong> {viewResult.s_username}
            </div>
            <div>
              <strong>Password:</strong> {viewResult.s_password}
            </div>
          </div>
        )}
        {viewStatus && <div className={`alert ${viewStatus.type || ""}`}>{viewStatus.message}</div>}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="card-title">Delete credentials</h2>
            <p className="card-subtitle">Requires your recovery PIN</p>
          </div>
        </div>
        <form className="form" onSubmit={handleDelete}>
          <label>
            Site
            <input required value={deleteForm.site} onChange={handleDeleteChange("site")} />
          </label>
          <label>
            Recovery PIN
            <input
              required
              type="password"
              inputMode="numeric"
              value={deleteForm.recovery_pin}
              onChange={handleDeleteChange("recovery_pin")}
            />
          </label>
          <button className="btn" type="submit">
            Delete
          </button>
        </form>
        {deleteStatus && <div className={`alert ${deleteStatus.type || ""}`}>{deleteStatus.message}</div>}
      </div>
    </div>
  );
}
