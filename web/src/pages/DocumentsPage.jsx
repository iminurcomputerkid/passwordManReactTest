import { useState } from "react";
import { apiDelete, apiGet, apiPost } from "../api";
import { FileText, Search, List, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const [docForm, setDocForm] = useState({ doc_name: "", contents: "" });
  const [docStatus, setDocStatus] = useState(null);

  const [viewName, setViewName] = useState("");
  const [viewResult, setViewResult] = useState(null);
  const [viewStatus, setViewStatus] = useState(null);

  const [docs, setDocs] = useState([]);
  const [listStatus, setListStatus] = useState(null);

  const [deleteForm, setDeleteForm] = useState({ doc_name: "", recovery_pin: "" });
  const [deleteStatus, setDeleteStatus] = useState(null);

  const updateDocForm = (field) => (e) => setDocForm({ ...docForm, [field]: e.target.value });

  async function handleUpsert(e) {
    e.preventDefault();
    setDocStatus(null);
    try {
      const res = await apiPost("/secure-docs", docForm);
      setDocStatus({ type: "success", message: res?.message || "Document saved." });
    } catch (err) {
      setDocStatus({ type: "error", message: err.message || "Failed to save document" });
    }
  }

  async function handleView(e) {
    e.preventDefault();
    setViewStatus(null);
    setViewResult(null);
    try {
      const res = await apiGet(`/secure-docs/${encodeURIComponent(viewName)}`);
      setViewResult(res);
    } catch (err) {
      setViewStatus({ type: "error", message: err.message || "Lookup failed" });
    }
  }

  async function handleList() {
    setListStatus(null);
    try {
      const res = await apiGet("/secure-docs");
      setDocs(Array.isArray(res) ? res : Object.values(res || {}));
      if (!res || (Array.isArray(res) && res.length === 0)) {
        setListStatus({ type: "warning", message: "No documents yet." });
      }
    } catch (err) {
      setListStatus({ type: "error", message: err.message || "Failed to list documents" });
    }
  }

  const updateDeleteForm = (field) => (e) => setDeleteForm({ ...deleteForm, [field]: e.target.value });

  async function handleDelete(e) {
    e.preventDefault();
    setDeleteStatus(null);
    try {
      const res = await apiDelete("/secure-docs", deleteForm);
      setDeleteStatus({ type: "success", message: res?.message || "Deleted document." });
    } catch (err) {
      setDeleteStatus({ type: "error", message: err.message || "Delete failed" });
    }
  }

  return (
    <div className="grid">
      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <FileText size={18} />
          </div>
          <div>
            <h2 className="card-title">Add / Update document</h2>
            <p className="card-subtitle">Store notes or secrets securely</p>
          </div>
        </div>
        <form className="form" onSubmit={handleUpsert}>
          <label>
            Document name
            <input required value={docForm.doc_name} onChange={updateDocForm("doc_name")} />
          </label>
          <label>
            Contents
            <textarea required value={docForm.contents} onChange={updateDocForm("contents")} />
          </label>
          <button className="btn" type="submit">
            Save document
          </button>
        </form>
        {docStatus && <div className={`alert ${docStatus.type || ""}`}>{docStatus.message}</div>}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <Search size={18} />
          </div>
          <div>
            <h2 className="card-title">View document</h2>
            <p className="card-subtitle">Retrieve contents by name</p>
          </div>
        </div>
        <form className="form" onSubmit={handleView}>
          <label>
            Document name
            <input required value={viewName} onChange={(e) => setViewName(e.target.value)} />
          </label>
          <button className="btn" type="submit">
            Fetch
          </button>
        </form>
        {viewResult && (
          <div className="result">
            <div>
              <strong>Name:</strong> {viewResult.doc_name || viewName}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Contents:</strong>
              <div>{viewResult.contents || JSON.stringify(viewResult)}</div>
            </div>
          </div>
        )}
        {viewStatus && <div className={`alert ${viewStatus.type || ""}`}>{viewStatus.message}</div>}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <List size={18} />
          </div>
          <div>
            <h2 className="card-title">List documents</h2>
            <p className="card-subtitle">All stored secure docs</p>
          </div>
        </div>
        <button className="btn" onClick={handleList}>
          Refresh list
        </button>
        {listStatus && <div className={`alert ${listStatus.type || ""}`}>{listStatus.message}</div>}
        {docs && docs.length > 0 && (
          <ul className="tag-list" style={{ marginTop: 12 }}>
            {docs.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="card fade">
        <div className="card-header">
          <div className="icon-box">
            <Trash2 size={18} />
          </div>
          <div>
            <h2 className="card-title">Delete document</h2>
            <p className="card-subtitle">Requires recovery PIN</p>
          </div>
        </div>
        <form className="form" onSubmit={handleDelete}>
          <label>
            Document name
            <input required value={deleteForm.doc_name} onChange={updateDeleteForm("doc_name")} />
          </label>
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
            Delete
          </button>
        </form>
        {deleteStatus && <div className={`alert ${deleteStatus.type || ""}`}>{deleteStatus.message}</div>}
      </div>
    </div>
  );
}
