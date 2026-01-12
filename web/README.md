# React client for pwManAPI

Modern React UI that mirrors the Python CLI flows for login/registration, credential vault, secure docs, 2FA, and account deletion against the Azure-hosted API.

## Quick start
1) `cd web`
2) Copy env: `cp .env.example .env` (defaults to `VITE_API_BASE` pointing at your Azure API)
3) Install deps: `npm install`
4) Run dev server: `npm run dev` (defaults to http://localhost:5173)

## What it covers
- Login with master password, plus conditional prompts for 2FA and recovery PIN when the API demands them.
- Registration with local confirmation checks for master password and recovery PIN.
- Credential vault: add/update (with strong password generator), view by site, list sites, delete (recovery PIN).
- Secure docs: add/update, view, list, delete (recovery PIN).
- Account settings: enable 2FA (QR + secret shown), disable 2FA (master password and/or recovery PIN), delete account.
- Logout posts to `/logout` when possible and clears the session token stored in `sessionStorage`.

## Configuration
- Default `VITE_API_BASE` now points directly at the Azure API (`https://secashpwman-hndhdeeca4b6bqb3.canadacentral-01.azurewebsites.net/api`) for production deployment.
- If you run locally against a different base, override `VITE_API_BASE` in `.env.local`.
- Session token is sent via `X-Session-Token` header and stored in tab-scoped `sessionStorage` for convenience.

## Notes
- The app uses fetch; errors from the API surface directly so you can see server messages.
- 2FA enable builds an otpauth URI locally if the server only returns the secret.
