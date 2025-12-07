from utils import get_secure_input
from api_client import post
from urllib.parse import quote, urlencode
import qrcode  # pip install qrcode

##FOR PRINTING OUT QR CODE
def otpauth_uri(secret_b32: str, account: str, issuer: str = "P1PasswordManager",
                digits: int = 6, period: int = 30, algorithm: str = "SHA1") -> str:
    """Build a standard otpauth:// URI that authenticator apps understand."""
    label = quote(f"{issuer}:{account}")
    qs = urlencode({
        "secret": secret_b32,
        "issuer": issuer,
        "algorithm": algorithm,
        "digits": str(digits),
        "period": str(period),
    })
    return f"otpauth://totp/{label}?{qs}"

def print_qr_to_terminal(data: str) -> None:
    """Render a scannable QR to the terminal (no images needed)."""
    qr = qrcode.QRCode(border=1, box_size=1)
    qr.add_data(data)
    qr.make(fit=True)
    for row in qr.get_matrix():
        print("".join("██" if cell else "  " for cell in row))
##############################################################



def account_settings_menu(sess):
    while True:
        print("\n=== ACCOUNT SETTINGS ===")
        print("1. Enable 2FA")
        print("2. Disable 2FA")
        print("3. Delete Account")
        print("4. Return")
        choice = input("Choice: ")

        if choice == "1":
            try:
                res = post("/2fa/enable", {})  # uses api_client.post
                secret = res.get("totp_secret")
                uri = res.get("provisioning_uri")

    # If server didn't send a provisioning URI, build one locally
                if not uri and secret:
                    uri = otpauth_uri(secret, account=sess.username, issuer="SecureASF")

                if secret:
                    print("TOTP secret:", secret)
                if uri:
                    print("\nScan this QR with your authenticator app:\n")
                    print_qr_to_terminal(uri)
                    print("\n(If you can’t scan, add account manually with the secret above.)")
                else:
                    print("Server did not return a provisioning URI or secret.")
            except Exception as e:
                print("Error:", e)

        elif choice == "2":
            master_password = get_secure_input(
                "Master password: ", is_password=True
            )

            if not master_password:
                print("Cancelled.")
                continue

            payload = {}
            if master_password:
                payload["master_password"] = master_password
            

            try:
                res = post("/2fa/disable", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "3":
            print("THIS DELETES THE ENTIRE USER FROM THE DATABASE")
            pin = get_secure_input("Confirm deletion — Recovery PIN:", is_password=True)
            try:
                res = post("/account/delete", {"recovery_pin": pin})
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "4":
            break
