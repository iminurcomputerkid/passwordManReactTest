from auth import login, register_account
from credentials import credentials_menu
from documents import documents_menu
from account_settings import account_settings_menu

def main_menu():
    while True:
        print("\n=== SECURE ASF CLIENT ===")
        print("1. Login")
        print("2. Register")
        print("3. Exit")
        choice = input("Choice: ")
        if choice == "1":
            res = login()
            if res and res[0]:
                sess, _ = res
                user_menu(sess)
        elif choice == "2":
            register_account()
        elif choice == "3":
            print("Goodbye.")
            break

def user_menu(sess):
    while True:
        print(f"\n=== USER MENU (logged in as {sess.username}) ===")
        print("1. Credentials")
        print("2. Documents")
        print("3. Account Settings")
        print("4. Logout")
        choice = input("Choice: ")
        if choice == "1":
            credentials_menu(sess)
        elif choice == "2":
            documents_menu(sess)
        elif choice == "3":
            account_settings_menu(sess)
        elif choice == "4":
            break

if __name__ == "__main__":
    main_menu()
