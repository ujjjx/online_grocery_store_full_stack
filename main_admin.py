from backend.service.admin_service import AdminService
from backend.utils.exceptions import ServiceException

def main():
    service = AdminService()
    logged_in = False
    while True:
        if not logged_in:
            print("\n==== Online Grocery Store (Admin UI - Backend Only) ====")
            print("1. Register Admin")
            print("2. Login Admin")
            print("3. Exit")
            try:
                choice = int(input("Enter choice: "))

                if choice == 1:
                    try:
                        email = input("Enter Admin Email: ")
                        password = input("Enter Admin Password: ")
                        service.register_admin(email, password)
                    except ServiceException as e:
                        print(e)
                elif choice == 2:
                    try:
                        email = input("Enter Admin Email: ")
                        password = input("Enter Admin Password: ")
                        service.force_logout_all_admins()
                        service.login_admin(email, password)
                        print("Login successful!")
                        logged_in = True
                    except ServiceException as e:
                        print(e)
                elif choice == 3:
                    print("Exiting...")
                    break
                else:
                    print("Invalid choice. Try again.")

            except ValueError:
                print("Invalid input. Please enter a number.")
            except Exception as e:
                print("Unexpected error: " + str(e))
        else:
            print("\n==== Online Grocery Store (Admin UI) ====")
            print("1. View First Half Logged-in Customers")
            print("2. Update Customer Names by Country")
            print("3. View All Customers")
            print("4. Get Customer by Email")
            print("5. Add Product")
            print("6. Update Product")
            print("7. Bulk Upload Products")
            print("8. Display All Products")  # Moved here
            print("9. View Highest Priced Product")
            print("10. View All Transactions")
            print("11. View Second Highest Transaction")
            print("12. View Successful Orders with Transactions")
            print("13. Logout Admin")
            print("14. Exit")
            try:
                choice = int(input("Enter choice: "))
                if choice == 1:
                    try:
                        result = service.get_first_half_logged_in()
                        print("First half logged-in customers:", result)
                    except ServiceException as e:
                        print(e)

                elif choice == 2:
                    try:
                        service.update_customer_names()
                        print("Customer names updated based on country!")
                    except ServiceException as e:
                        print(e)
                elif choice == 3:
                    try:
                        customers = service.view_all_customers()
                        if not customers:
                            print("No customers found.")
                        else:
                            print("\n--- All Customers ---")
                            for cust in customers:
                                print(f"\nCustomer ID   : {cust['customer_id']}")
                                print(f"Name          : {cust['name']}")
                                print(f"Email         : {cust['email']}")
                                print(f"Address       : {cust['address']}")
                                print(f"Contact Number: {cust['contact_number']}")
                    except ServiceException as e:
                        print(e)
                elif choice == 4:
                    try:
                        email = input("Enter Customer Email: ").strip()
                        result = service.get_customer_by_email(email)
                        if isinstance(result, str):
                            print(result)
                        else:
                            print("\n--- Customer Details ---")
                            print(f"Customer ID   : {result['customer_id']}")
                            print(f"Name          : {result['name']}")
                            print(f"Email         : {result['email']}")
                            print(f"Address       : {result['address']}")
                            print(f"Contact Number: {result['contact_number']}")
                    except ServiceException as e:
                        print(e)
                elif choice == 5:
                    try:
                        name = input("Enter Product Name (max 50 chars): ")
                        desc = input("Enter Product Description (max 100 chars): ")
                        qty = int(input("Enter Available Quantity: "))
                        comp = input("Enter Company Name (max 50 chars): ")
                        price = float(input("Enter Price (up to 2 decimals): "))
                        msg = service.add_product(name, desc, price, qty, comp)
                        print(msg)
                    except ServiceException as e:
                        print(e)
                elif choice == 6:
                    try:
                        current_name = input("Enter Current Product Name: ").strip()
                        new_name = input("Enter New Product Name (max 50 chars, leave blank to keep): ").strip() or None
                        desc = input("Enter Product Description (max 100 chars, leave blank to keep): ").strip() or None
                        company = input("Enter Company Name (max 50 chars, leave blank to keep): ").strip() or None
                        qty_input = input("Enter Available Quantity (leave blank to keep): ").strip()
                        qty = int(qty_input) if qty_input else None
                        price_input = input("Enter Price (up to 2 decimals, leave blank to keep): ").strip()
                        price = round(float(price_input), 2) if price_input else None
                        msg = service.update_product(
                            current_name,
                            new_name=new_name,
                            description=desc,
                            company_name=company,
                            price=price,
                            quantity=qty
                        )
                        print(msg)
                    except Exception as e:
                        print("Error: " + str(e))
                elif choice == 7:
                    try:
                        csv_file = input("Enter CSV file path: ")
                        result = service.bulk_upload_products(csv_file)
                        print(result)
                    except ServiceException as e:
                        print(e)
                elif choice == 8:
                    try:
                        # Call service to get the list of all products
                        products = service.display_all_products()
                        if isinstance(products, str):  # Check if the response is an error message (string)
                            print(products)
                        else:
                            print("\n--- All Products ---")
                            # Iterate over products and display them
                            for product in products:
                                print(f"Product ID: {product['product_id']}")
                                print(f"Name: {product['name']}")
                                print(f"Description: {product['description']}")
                                print(f"Company Name: {product['company_name']}")
                                print(f"Price: {product['price']}")
                                print(f"Quantity: {product['quantity']}")
                                print(f"Reserved: {product['reserved']}")
                                print(f"Image Path: {product['image_path']}")
                                print("-" * 40)  # Separator between products
                    except ServiceException as e:
                        print(e)
                elif choice == 9:
                    try:
                        result = service.get_highest_priced_product()
                        if isinstance(result, str):
                            print(result)
                        else:
                            print("\n--- Highest Priced Product ---")
                            print(f"Product ID: {result['product_id']}")
                            print(f"Name: {result['name']}")
                            print(f"Description: {result['description']}")
                            print(f"Company: {result['company_name']}")
                            print(f"Price: {result['price']}")
                            print(f"Quantity: {result['quantity']}")
                    except ServiceException as e:
                        print(e)
                elif choice == 10:
                    try:
                        transactions = service.view_all_transactions()
                        if not transactions:
                            print("No transactions found.")
                        else:
                            print("\n--- All Transactions ---")
                            for t in transactions:
                                print(f"Transaction {t['transaction_id']} | Customer {t['customer_id']} "
                                    f"({t['customer_name']}) | Product {t['product_id']} "
                                    f"| Items: {t['no_of_items']} → Total: {t['total_amount']}")
                    except ServiceException as e:
                        print(e)
                elif choice == 11:
                    try:
                        second = service.view_second_highest_transaction()
                        if isinstance(second, str):
                            print(second)
                        else:
                            print("\n--- Second Highest Transaction ---")
                            print(f"Transaction {second['transaction_id']} | Customer {second['customer_id']} "
                                f"({second['customer_name']}) | Product {second['product_id']} "
                                f"| Items: {second['no_of_items']} → Total: {second['total_amount']}")
                    except ServiceException as e:
                        print(e)
                elif choice == 12:
                    try:
                        results = service.get_successful_orders_with_transactions()
                        if isinstance(results, str):
                            print(results)
                        else:
                            print("\n--- Successful Orders with Transactions ---")
                            for row in results:
                                print(
                                    f"Customer: {row['customer_name']} ({row['email']}) | "
                                    f"Txn ID: {row['transaction_id']} | "
                                    f"Product: {row['product_name']} | "
                                    f"Items: {row['no_of_items']} | "
                                    f"Status: {row['status']}"
                                )
                    except ServiceException as e:
                        print(e)
                elif choice == 13:
                    try:
                        service.logout_admin()
                        print("Logged out successfully.")
                        logged_in = False
                    except ServiceException as e:
                        print(e)
                elif choice == 14:
                    print("Exiting Admin UI...")
                    break
                else:
                    print("Invalid choice. Try again.")
            except ValueError:
                print("Invalid input. Please enter a number.")
            except Exception as e:
                print("Unexpected error: " + str(e))

if __name__ == "__main__":
    main()