import sqlite3
from entities.admin import Admin
from entities.product import Product
from datetime import datetime
import csv
import random
from backend.utils.exceptions import DuplicateEmailException, DatabaseException
class AdminDAO:
    def __init__(self, conn):
        self.conn = conn
    def is_admin_id_exists(self, admin_id: int) -> bool:
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM Admin WHERE admin_id=?", (admin_id,))
            return cursor.fetchone() is not None
        except sqlite3.Error as e:
            raise DatabaseException("Database error while checking admin ID: " + str(e))
    def register_admin(self, admin: Admin):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM Customer WHERE email=?", (admin.email,))
            if cursor.fetchone():
                cursor.close()
                raise DuplicateEmailException("Admin email already exists in Customer records.")
            cursor.execute("""
                INSERT INTO Admin (admin_id, email, password)
                VALUES (?, ?, ?)
                """, (admin.admin_id, admin.email, admin.password))
            cursor.execute("INSERT INTO Login VALUES (?,?,?,?,?,?,?,?)", 
                (admin.admin_id, None, None, None, admin.password, 'N', 'Admin', 'Active'))
            self.conn.commit()
            cursor.close()
        except sqlite3.IntegrityError:
            raise DuplicateEmailException("Admin email already exists.")
        except sqlite3.Error as e:
            raise DatabaseException("Database error while creating admin: " + str(e))
    def login_admin(self, email, password):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT admin_id, password FROM Admin WHERE email=?", (email,))
            row = cursor.fetchone()
            if not row:
                raise DatabaseException("Invalid email or password.")
            admin_id, stored_password = row
            if stored_password != password:
                raise DatabaseException("Invalid email or password.")
            now = datetime.now().isoformat()
            cursor.execute("UPDATE Login SET last_login=?, is_now_logged_in='Y' WHERE id=?", (now, admin_id))
            self.conn.commit()
            return admin_id
        except sqlite3.Error as e:
            raise DatabaseException("Login failed: " + str(e))
        finally:
            cursor.close()
    def logout_admin(self, admin_id: int):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT is_now_logged_in FROM Login WHERE id=?", (admin_id,))
            row = cursor.fetchone()
            if not row or row[0] != "Y":
                cursor.close()
                raise DatabaseException("Admin is not logged in.")

            now = datetime.now().isoformat()
            cursor.execute(
                "UPDATE Login SET last_logout=?, is_now_logged_in='N' WHERE id=?",
                (now, admin_id),
            )
            self.conn.commit()
            cursor.close()
        except sqlite3.Error as e:
            raise DatabaseException("Logout failed: " + str(e))
    def force_logout_all_admins(self):
        try:
            cursor = self.conn.cursor()
            now = datetime.now().isoformat()
            cursor.execute(
                "UPDATE Login SET last_logout=?, is_now_logged_in='N' WHERE is_now_logged_in='Y'",
                (now,)
            )
            self.conn.commit()
            cursor.close()
        except sqlite3.Error as e:
            raise DatabaseException("Failed to force logout admins: " + str(e))
    def get_first_half_logged_in_customers(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT id FROM Login WHERE is_now_logged_in = 'Y' AND userType='Customer'")
            all_logged_in = [row[0] for row in cursor.fetchall()]
            if len(all_logged_in) <= 1:
                return all_logged_in
            half_count = len(all_logged_in) // 2
            cursor.close()
            return all_logged_in[:half_count]
        except sqlite3.Error as e:
            raise DatabaseException("Error fetching logged-in customers: " + str(e))
    def update_customer_names_by_country(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                UPDATE Customer
                SET name = 'US_' || name
                WHERE LOWER(address) LIKE '%us%' AND name NOT LIKE 'US_%'
            """)
            cursor.execute("""
                UPDATE Customer
                SET name = 'IN_' || name
                WHERE LOWER(address) LIKE '%india%' AND name NOT LIKE 'IN_%'
            """)
            self.conn.commit()
            cursor.close()
        except sqlite3.Error as e:
            raise DatabaseException("Database update error: " + str(e))
    def get_all_customers(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT customer_id, name, email, address, contact_number FROM Customer")
            rows = cursor.fetchall()
            cursor.close()
            customers = [
                {
                    "customer_id": row[0],
                    "name": row[1],
                    "email": row[2],
                    "address": row[3],
                    "contact_number": row[4],
                }
                for row in rows
            ]
            return customers
        except sqlite3.Error as e:
            raise DatabaseException("Error fetching customers: " + str(e))
    def get_customer_by_email(self, email: str):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT customer_id, name, email, address, contact_number
                FROM Customer
                WHERE email = ?
            """, (email,))
            customer = cursor.fetchone()
            cursor.close()

            if not customer:
                return None

            return {
                "customer_id": customer[0],
                "name": customer[1],
                "email": customer[2],
                "address": customer[3],
                "contact_number": customer[4]
            }

        except sqlite3.Error as e:
            raise DatabaseException("Failed to fetch customer by email: " + str(e))
    def add_product(self, product: Product):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT INTO Product (product_id, name, description, company_name, price, quantity)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (product.product_id, product.name, product.description, product.company_name, product.price, product.quantity))
            self.conn.commit()
            cursor.close()
            return "Product added successfully."
        except sqlite3.Error as e:
            raise DatabaseException("Failed to add product: " + str(e))
    def update_product(self, current_name, new_name=None, description=None, company_name=None, price=None, quantity=None):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM Product WHERE name = ?", (current_name,))
            row = cursor.fetchone()
            if not row:
                cursor.close()
                return f"No product found with name '{current_name}'."

            existing = {
                "product_id": row[0],
                "name": row[1],
                "description": row[2],
                "company_name": row[3],
                "price": row[4],
                "quantity": row[5]
            }
            final_name = new_name if new_name else existing["name"]
            final_description = description if description else existing["description"]
            final_company = company_name if company_name else existing["company_name"]
            final_price = price if price is not None else existing["price"]
            final_qty = quantity if quantity is not None else existing["quantity"]

            cursor.execute("""
                UPDATE Product
                SET name = ?, description = ?, company_name = ?, price = ?, quantity = ?
                WHERE product_id = ?
            """, (final_name, final_description, final_company, final_price, final_qty, existing["product_id"]))

            self.conn.commit()
            cursor.close()

            return "Product updated successfully."
        except sqlite3.Error as e:
            raise DatabaseException("Failed to update product: " + str(e))
    def generate_product_id(self):
        digits = [str(random.randint(0, 9)) for _ in range(10)]
        return f"{digits[0]}-{''.join(digits[1:5])}-{''.join(digits[5:9])}-{digits[9]}"
    def bulk_upload_products(self, csv_file):
        try:
            cursor = self.conn.cursor()
            with open(csv_file, newline='', encoding="utf-8") as file:
                reader = csv.DictReader(file)
                for row in reader:
                    product_id = self.generate_product_id()
                    cursor.execute("""
                        INSERT INTO Product (product_id, name, description, company_name, price, quantity, reserved, image_path)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        product_id,
                        row["name"],
                        row["description"],
                        row["company_name"],
                        float(row["price"]),
                        int(row["quantity"]),
                        row.get("reserved", 0),
                        row["image_path"]
                    ))
            self.conn.commit()
            cursor.close()
            print("Bulk product upload successful")
        except (sqlite3.Error, FileNotFoundError, KeyError, ValueError) as e:
            raise DatabaseException("Bulk upload failed: " + str(e))
    def get_highest_priced_product(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT product_id, name, description, company_name, price, quantity, reserved
                FROM Product
                ORDER BY price DESC
                LIMIT 1
            """)
            product = cursor.fetchone()
            cursor.close()

            if not product:
                return None  

            return {
                "product_id": product[0],
                "name": product[1],
                "description": product[2],
                "company_name": product[3],
                "price": product[4],
                "quantity": product[5],
            }
        except sqlite3.Error as e:
            raise DatabaseException("Failed to fetch highest priced product: " + str(e))
    def display_all_products(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM Product")
            products = cursor.fetchall()
            cursor.close()

            # Convert the results to a list of dictionaries
            product_list = []
            for product in products:
                product_dict = {
                    "product_id": product[0],
                    "name": product[1],
                    "description": product[2],
                    "company_name": product[3],
                    "price": product[4],
                    "quantity": product[5],
                    "reserved": product[6],
                    "image_path": product[8]
                }
                product_list.append(product_dict)

            return product_list if product_list else None
        except sqlite3.Error as e:
            raise Exception(f"Error fetching products: {str(e)}")
    def get_all_transactions(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT t.transaction_id, t.customer_id, c.name,
                    t.product_id, t.no_of_items, t.total_amount
                FROM Transactions t
                JOIN Customer c ON t.customer_id = c.customer_id
                ORDER BY t.total_amount DESC
                """)
            rows = cursor.fetchall()
            cursor.close()

            transactions = []
            for row in rows:
                transactions.append({
                    "transaction_id": row[0],
                    "customer_id": row[1],
                    "customer_name": row[2],
                    "product_id": row[3],
                    "no_of_items": row[4],
                    "total_amount": row[5],
                })
            return transactions
        except sqlite3.Error as e:
            raise DatabaseException("Failed to fetch transactions: " + str(e))

    def get_successful_orders_with_transactions(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT DISTINCT
                    c.customer_id,
                    c.name        AS customer_name,
                    c.email,
                    c.address,
                    c.contact_number,
                    t.transaction_id,
                    p.name        AS product_name,
                    t.no_of_items
                    FROM Transactions t
                    JOIN Customer c
                    ON c.customer_id = t.customer_id
                    JOIN Product p
                    ON p.product_id = t.product_id
                    JOIN "Order" o
                    ON o.customer_id = t.customer_id
                    AND o.product_id  = t.product_id
                    AND o.status = 'PLACED'
                    ORDER BY t.transaction_id DESC
                """)
            rows = cursor.fetchall()
            cursor.close()
            return rows
        except sqlite3.Error as e:
            raise DatabaseException("Failed to fetch successful orders: " + str(e))
    