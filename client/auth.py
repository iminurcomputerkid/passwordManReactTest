from client.utils import get_secure_input, prompt_totp_visible
from client.api_client import post, set_session_token


class Session:
    def __init__(self, username: str):
        self.username = username

def register_account():
    print("\n=== REGISTER ACCOUNT ===")
    username = get_secure_input("Username:")
    if username is None:
        return
    master_password = get_secure_input("Master password:", is_password=True)
    confirm_master = get_secure_input("Confirm master password:", is_password=True)
    if master_password != confirm_master:
        print("Passwords don't match.")
        return
    recovery_pin = get_secure_input("6-digit recovery PIN:", is_password=True)
    confirm_pin = get_secure_input("Confirm recovery PIN:", is_password=True)
    if recovery_pin != confirm_pin:
        print("PINs don't match.")
        return
    payload = {
        "username": username,
        "master_password": master_password,
        "confirm_master_password": confirm_master,
        "recovery_pin": recovery_pin,
        "confirm_recovery_pin": confirm_pin,
    }
    try:
        res = post("/register", payload, auth_required=False)
        print(res.get("message"))
    except Exception as e:
        print("Error:", e)

def login():
    print("\n=== LOGIN ===")
    username = get_secure_input("Username:")
    if username is None:
        return None, None
    master_password = get_secure_input("Master password:", is_password=True)
    if master_password is None:
        return None, None

    # First attempt: no TOTP / PIN (most users)
    payload = {"username": username, "master_password": master_password}
    try:
        res = post("/login", payload, auth_required=False)
        print(res.get("message"))
        set_session_token(res.get("session_token"))
        return Session(username), res
    except Exception as e:
        # Pull a lowercase message for routing decisions
        msg = str(e).lower()

        # If server says 2FA is required, prompt and retry with totp_code
        if "2fa required" in msg:
            totp = prompt_totp_visible()
            if totp is None:
                return None, None
            payload |= {"totp_code": totp}
            try:
                res = post("/login", payload, auth_required=False)
                print(res.get("message"))
                set_session_token(res.get("session_token"))
                return Session(username), res
            except Exception as e2:
                print("Login failed:", e2)
                return None, None

        # If server escalated to require recovery PIN (too many bad attempts)
        if "recovery pin required" in msg:
            pin = get_secure_input("Recovery PIN:", is_password=True)
            if pin is None:
                return None, None
            payload |= {"recovery_pin": pin}
            try:
                res = post("/login", payload, auth_required=False)
                print(res.get("message"))
                set_session_token(res.get("session_token"))
                return Session(username), res
            except Exception as e2:
                print("Login failed:", e2)
                return None, None

        # Otherwise it's a real failure (bad username/pw, locked, etc.)
        print("Login failed:", e)
        return None, None
