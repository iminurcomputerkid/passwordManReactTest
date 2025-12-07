# api_client.py
import requests

# === CHANGE THIS to your real Azure App URL ===
API_BASE = "https://pwmanapi-ekc3g3g6gcfwfxgr.canadacentral-01.azurewebsites.net/api"



SESSION_TOKEN = None

def set_session_token(token: str | None):
    global SESSION_TOKEN
    SESSION_TOKEN = token

def _headers(auth_required: bool = True):
    h = {"Content-Type": "application/json"}
    if auth_required and SESSION_TOKEN:
        h["X-Session-Token"] = SESSION_TOKEN
    return h

def post(path: str, json: dict, auth_required: bool = True):
    url = f"{API_BASE}{path}"
    r = requests.post(url, json=json, headers=_headers(auth_required), timeout=20)
    if r.status_code >= 400:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"{r.status_code}: {detail}")
    return r.json()


def get(path: str, params: dict | None = None, auth_required: bool = True):
    url = f"{API_BASE}{path}"
    r = requests.get(url, params=params, headers=_headers(auth_required), timeout=20)
    if r.status_code >= 400:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"{r.status_code}: {detail}")
    return r.json()


def delete(path: str, json: dict | None = None, auth_required: bool = True):
    url = f"{API_BASE}{path}"
    r = requests.delete(url, json=json, headers=_headers(auth_required), timeout=20)
    if r.status_code >= 400:
        try:
            detail = r.json().get("detail", r.text)
        except Exception:
            detail = r.text
        raise RuntimeError(f"{r.status_code}: {detail}")
    return r.json()
