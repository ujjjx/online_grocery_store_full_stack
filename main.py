from backend.service.cust_service import CustomerService
from backend.utils.exceptions import ServiceException

def main():
    service = CustomerService()
    logged_in = False   

    while True:
        if not logged_in:
            print("\n==== Online Grocery Store (Customer UI) ====")
            print("1. Register Customer")
            print("2. Login")
            print("3. Restore Customer Account")
            print("4. Exit")
            try:
                choice = int(input("Enter choice: "))

                if choice == 1:
                    try:
                        name = input("Enter Name: ")
                        email = input("Enter Email: ")
                        password = input("Enter Password: ")
                        address = input("Enter Address: ")
                        contact = input("Enter Contact Number: ")
                        service.register_customer(name, email, password, address, contact)
                    except ServiceException as e:
                        print(e)
                elif choice == 2:
                    try:
                        email = input("Enter Email: ")
                        password = input("Enter Password: ")
                        service.force_logout_everywhere(email)
                        service.login(email, password)
                        logged_in = True
                        print("Login successful!")
                    except ServiceException as e:
                        print(e)
                elif choice == 3:
                    try:
                        email = input("Enter your registered email to restore your account: ").strip()
                        result = service.restore_customer(email)
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 4:
                    print("Exiting...")
                    break
                else:
                    print("Invalid choice. Try again.")

            except ValueError:
                print("Invalid input. Please enter a number.")
            except Exception as e:
                print("Unexpected error: " + str(e))

        else:
            print("\n==== Online Grocery Store (Customer UI) ====")
            print("1. View Product Catalog")
            print("2. Add Product to Cart")
            print("3. Update Cart Item Quantity")
            print("4. Delete Item from Cart")
            print("5. Place Order")
            print("6. View Order History")
            print("7. Update Customer Details")
            print("8. Soft Delete Customer Account")
            print("9. Logout")
            print("10. Exit")
            try:
                choice = int(input("Enter choice: "))

                if choice == 1:
                    try:
                        result = service.get_product_catalog()
                        print(result["message"])
                        products = result["data"]

                        if products:
                            print("\n--- Product Catalog ---")
                            for p in products:
                                print(f"{p.product_id} | {p.name} | {p.description} | "
                                    f"{p.company_name} | ${p.price:.2f} | Stock: {p.quantity}")
                    except ServiceException as e:
                        print(e)
                elif choice == 2:
                    try:
                        product_name = input("Enter Product Name: ")
                        qty = int(input("Enter Quantity: "))
                        result = service.add_to_cart(product_name, qty)
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 3:
                    try:
                        product_name = input("Enter Product Name to Update: ").strip()
                        qty = int(input("Enter New Quantity: "))
                        result = service.update_cart(product_name, qty)
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 4:
                    try:
                        product_name = input("Enter product name to remove from cart: ")
                        result = service.delete_cart_item(product_name)
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 5:
                    try:
                        result = service.place_order()
                        print(result["message"])
                        invoice = result.get("invoice")
                        if invoice:
                            print("\n========== INVOICE ==========")
                            print(f"Customer ID: {invoice['customer_id']}")
                            print("----------------------------")
                            for item in invoice["items"]:
                                print(f"Order ID: {item['order_id']} | {item['product_name']} ({item['company']})")
                                print(f"   Description: {item['description']}")
                                print(f"   Qty: {item['quantity']} | Price: ${item['price']} | Total: ${item['total']}")
                                print("----------------------------")
                            print(f"TOTAL ITEMS: {invoice['total_items']}")
                            print(f"GRAND TOTAL: ${invoice['grand_total']}")
                            print("=============================\n")
                    except ServiceException as e:
                        print(e)
                elif choice == 6:
                    try:
                        result = service.view_order_history()
                        if result["status"] == "success":
                            for txn in result["orders"]:
                                print(f"\n=== Transaction {txn['transaction_id']} | Total: ${txn['total_amount']} | Items: {txn['no_of_items']} ===")
                                for order in txn["orders"]:
                                    print(f"Order {order['order_id']} | {order['product_name']} | Qty: {order['quantity']} | Price: ${order['price']} | Status: {order['status']} | Line Total: ${order['line_total']}")
                                print("--------------------------------------------------")
                        else:
                            print(result["message"])
                    except ServiceException as e:
                        print(e)                
                elif choice == 7:
                    try:
                        name = input("Enter new name (leave blank to skip): ").strip() or None
                        email = input("Enter new email (leave blank to skip): ").strip() or None
                        password = input("Enter new password (leave blank to skip): ").strip() or None
                        address = input("Enter new address (leave blank to skip): ").strip() or None
                        contact = input("Enter new contact (leave blank to skip): ").strip() or None

                        result = service.update_customer_details(
                            name=name,
                            email=email,
                            password=password,
                            address=address,
                            contact_number=contact
                        )
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 8:
                    try:
                        result = service.soft_delete_customer()
                        logged_in = False
                        print(result["message"])
                    except ServiceException as e:
                        print(e)
                elif choice == 9: 
                    try:
                        service.logout()
                        logged_in = False
                        print("Logged out successfully!")
                    except ServiceException as e:
                        print(e)
                elif choice == 10:
                    print("Exiting...")
                    break
                else:
                    print("Invalid choice. Try again.")

            except ValueError:
                print("Invalid input. Please enter a number.")
            except Exception as e:
                print("Unexpected error: " + str(e))


if __name__ == "__main__":
    main()