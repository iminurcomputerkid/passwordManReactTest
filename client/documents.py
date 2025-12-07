from utils import get_secure_input
from api_client import post, delete, get

def documents_menu(sess):
    while True:
        print("\n=== DOCUMENTS VAULT ===")
        print("1. Add Document")
        print("2. View Document")
        print("3. List Documents")
        print("4. Update Document")
        print("5. Delete Document")
        print("6. Return")
        choice = input("Choice: ")

        if choice == "1":
            doc_name = get_secure_input("Document name:")
            doc_contents = get_secure_input("Contents:")
            payload = {"doc_name": doc_name, "contents": doc_contents}
            try:
                res = post("/secure-docs", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "2":
            doc_name = get_secure_input("Document name:")
            try:
                res = get(f"/secure-docs/{doc_name}")
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "3":
            try:
                res = get("/secure-docs")
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "4":
            doc_name = get_secure_input("Document name to update:")
            new_contents = get_secure_input("New contents:")
            payload = {"doc_name": doc_name, "contents": new_contents}
            try:
                res = post("/secure-docs", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "5":
            doc_name = get_secure_input("Document name to delete:")
            pin = get_secure_input("Recovery PIN:", is_password=True)
            payload = {"doc_name": doc_name, "recovery_pin": pin}
            try:
                res = delete("/secure-docs", payload)
                print(res)
            except Exception as e:
                print("Error:", e)

        elif choice == "6":
            break
