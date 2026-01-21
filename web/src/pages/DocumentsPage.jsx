import { useState } from "react";
import { apiDelete, apiGet, apiPost } from "../api";
import { FileText, List, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const [docForm, setDocForm] = useState({ doc_name: "", contents: "" });
  const [docStatus, setDocStatus] = useState(null);

  const [viewResult, setViewResult] = useState(null);
  const [viewStatus, setViewStatus] = useState(null);
  const [viewName, setViewName] = useState("");

  const [docs, setDocs] = useState([]);
  const [listStatus, setListStatus] = useState(null);

  const [deleteForm, setDeleteForm] = useState({ doc_name: "", recovery_pin: "" });
  const [deleteStatus, setDeleteStatus] = useState(null);

  const updateDocForm = (field) => (e) => setDocForm({ ...docForm, [field]: e.target.value });

  function normalizeDocResult(res, fallbackName) {
    if (!res) return null;
    if (typeof res === "string") {
      return normalizeDocResult({ contents: res }, fallbackName);
    }
    let docName = res.doc_name ?? res.docName ?? null;
    let contents = res.contents ?? res.doc_contents ?? null;

    if (typeof contents === "string") {
      const trimmed = contents.trim();
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          docName = docName ?? parsed.doc_name ?? parsed.docName ?? parsed.name ?? null;
          const parsedContents =
            parsed.doc_contents ?? parsed.contents ?? parsed.content ?? parsed.body ?? parsed.text ?? null;
          if (parsedContents != null) contents = parsedContents;
        }
      } catch {
        const nameMatch = trimmed.match(/doc[_\s]?name["']?\s*[:=]\s*["']?([^"'\n}]+)["']?/i);
        const contentsMatch = trimmed.match(/doc[_\s]?contents?["']?\s*[:=]\s*["']?([^"'}]+)["']?/i);
        if (!docName && nameMatch) docName = nameMatch[1].trim();
        if (contentsMatch) contents = contentsMatch[1].trim();
      }
    }

    return {
      doc_name: docName ?? fallbackName ?? "",
      contents: contents ?? "",
    };
  }
  function normalizeList(res) {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === "string") {
      const cleaned = res.replace(/^\s*Documents:\s*/i, "").trim();
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

  async function handleView(name) {
    setViewStatus(null);
    setViewResult(null);
    try {
      const res = await apiGet(`/secure-docs/${encodeURIComponent(name)}`);
      setViewResult(normalizeDocResult(res, name));
      setViewName(name);
    } catch (err) {
      setViewStatus({ type: "error", message: err.message || "Lookup failed" });
    }
  }

  async function handleList() {
    setListStatus(null);
    try {
      const res = await apiGet("/secure-docs");
      const normalized = normalizeList(res);
      setDocs(normalized);
      if (normalized.length === 0) {
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
            <List size={18} />
          </div>
          <div>
            <h2 className="card-title">List documents</h2>
            <p className="card-subtitle">Click a document to view contents</p>
          </div>
        </div>
        <button className="btn" onClick={handleList}>
          Refresh list
        </button>
        {listStatus && <div className={`alert ${listStatus.type || ""}`}>{listStatus.message}</div>}
        {docs && docs.length > 0 && (
          <ul className="tag-list" style={{ marginTop: 12 }}>
            {docs.map((name) => (
              <li key={name}>
                <button className="tag-button" type="button" onClick={() => handleView(name)}>
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {viewResult && (
          <div className="result" style={{ marginTop: 12 }}>
            <div>
              <strong>Name:</strong> {viewResult.doc_name || viewName}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>Contents:</strong> {viewResult.contents || "No contents returned."}
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
