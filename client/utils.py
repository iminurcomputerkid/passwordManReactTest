# utils.py
import getpass
import secrets
import string

# Characters that are easy to confuse visually
AMBIGUOUS = set("O0oIl1|`'\";:.,{}[]()\\/")

def get_secure_input(prompt: str, is_password: bool = False):
    """
    Get input safely; masks passwords, allows ESC to cancel.
    Returns None if user types 'esc'.
    """
    while True:
        try:
            if is_password:
                val = getpass.getpass(f"{prompt} (Type 'esc' to go back): ")
            else:
                val = input(f"{prompt} (Type 'esc' to go back): ")
        except (EOFError, KeyboardInterrupt):
            print()
            return None

        if val.lower() == "esc":
            return None
        if val.strip():
            return val.strip()

def generate_password(length: int = 20, use_symbols: bool = True, avoid_ambiguous: bool = True) -> str:
    """
    Generates a cryptographically strong password with at least one lower,
    one upper, one digit, and (optionally) one symbol.
    """
    if length < 8:
        length = 8

    lowers  = string.ascii_lowercase
    uppers  = string.ascii_uppercase
    digits  = string.digits
    symbols = "!@#$%^&*()-_=+[]{}<>?~"

    # Optionally remove look-alike characters
    if avoid_ambiguous:
        def strip(s): return "".join(ch for ch in s if ch not in AMBIGUOUS)
        lowers, uppers, digits, symbols = map(strip, (lowers, uppers, digits, symbols))

    pools = [lowers, uppers, digits] + ([symbols] if use_symbols else [])
    all_chars = "".join(pools)

    # Guarantee at least one from each pool
    pwd_chars = [secrets.choice(p) for p in pools]
    pwd_chars += [secrets.choice(all_chars) for _ in range(length - len(pwd_chars))]

    # Secure Fisher–Yates shuffle
    for i in range(len(pwd_chars) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        pwd_chars[i], pwd_chars[j] = pwd_chars[j], pwd_chars[i]

    return "".join(pwd_chars)

def prompt_totp_visible() -> str | None:
    """Read a visible TOTP, echo it back, and validate shape."""
    while True:
        raw = input("2FA code (visible, 6 digits; type 'esc' to cancel): ").strip()
        if raw.lower() == "esc":
            return None
        code = "".join(ch for ch in raw if ch.isdigit())
        if 6 <= len(code) <= 8:   # most apps use 6; some use 7–8, allow lenience
            print(f"Using TOTP: {code}")
            return code
        print("Invalid TOTP. Enter 6 digits (numbers only).")

