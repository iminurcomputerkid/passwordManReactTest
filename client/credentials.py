from client.utils import get_secure_input, generate_password
from client.api_client import post, delete, get

def credentials_menu(sess):
    while True:
        print("\n=== CREDENTIALS VAULT ===")
        print("1. Add Site Credentials")
        print("2. View Site Credentials")
        print("3. List All Sites")
        print("4. Delete Site")
        print("5. Return to Main Menu")
        choice = input("Choice: ")

        if choice == "1":
            site = get_secure_input("Site name:")
            s_username = get_secure_input("Site username:")
            s_password = get_secure_input("Site password (or 'gen'):", is_password=True)
            if s_password.lower() == "gen":
                s_password = generate_password()
            payload = {
                "site": site,
                "s_username": s_username,
                "s_password": s_password,
            }
            try:
                res = post("/vault/site", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "2":
            site = get_secure_input("Site:")
            try:
                res = get(f"/vault/site/{site}")
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "3":
            try:
                res = get("/vault/sites")
                print("Sites:", res)
            except Exception as e:
                print("Error:", e)

        elif choice == "4":
            site = get_secure_input("Site to delete:")
            pin = get_secure_input("Recovery PIN:", is_password=True)
            payload = {"recovery_pin": pin, "site": site}
            try:
                res = delete("/vault/site", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "5":
            break