from datetime import datetime
import sqlite3
from entities.customer import Customer
from entities.product import Product
from entities.unverified_user import UnverifiedUser
from backend.utils.exceptions import DuplicateEmailException, DatabaseException
class CustomerDAO:
    def __init__(self,conn):
        self.conn=conn
    def is_customer_id_exists(self, customer_id: int) -> bool:
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM Customer WHERE customer_id=?", (customer_id,))
            return cursor.fetchone() is not None
        
        except sqlite3.Error as e:
            raise DatabaseException("Database error while checking customer ID: " + str(e))
    def insert_or_update(self, user: UnverifiedUser):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO UnverifiedUsers (email, name, password, address, contact, otp_code)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user.email, user.name, user.password, user.address, user.contact, user.otp_code))
            self.conn.commit()
        except sqlite3.Error as e:
            raise DatabaseException("Error inserting unverified user: " + str(e))
        finally:
            cursor.close()
    def get_user(self, email):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT email, name, password, address, contact, otp_code FROM UnverifiedUsers WHERE email=?", (email,))
            row = cursor.fetchone()
            if not row:
                return None
            return UnverifiedUser(*row)
        except sqlite3.Error as e:
            raise DatabaseException("Error fetching unverified user: " + str(e))
        finally:
            cursor.close()
    def delete_user(self, email):
        try:
            cursor = self.conn.cursor()
            cursor.execute("DELETE FROM UnverifiedUsers WHERE email=?", (email,))
            self.conn.commit()
        except sqlite3.Error as e:
            raise DatabaseException("Error deleting unverified user: " + str(e))
        finally:
            cursor.close()
    def insert_customer(self,customer:Customer):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
            INSERT INTO Customer (customer_id, name, email, password, address, contact_number)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (customer.customer_id, customer.name, customer.email, customer.password, customer.address, customer.contact_number))
            cursor.execute("INSERT INTO Login VALUES (?,?,?,?,?,?,?,?)",
            (customer.customer_id, None, None, None,customer.password, 'N', 'Customer', 'Active'))
            self.conn.commit()
            cursor.close()
        except sqlite3.IntegrityError:
            raise DuplicateEmailException("Email already exists in the system.")
        except sqlite3.Error as e:
            raise DatabaseException("Database error while inserting customer: " + str(e))
    def login_customer(self, email, password):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT customer_id,name, password FROM Customer WHERE email = ?", (email,))
            row = cursor.fetchone()
            if not row:
                raise DatabaseException("Invalid email or password.")

            customer_id, name, stored_password = row
            if stored_password != password:
                raise DatabaseException("Invalid email or password.")
            cursor.execute("SELECT status, is_now_logged_in FROM Login WHERE id=?", (customer_id,))
            login_row = cursor.fetchone()
            if not login_row:
                raise DatabaseException("Login record missing for customer.")
            status, is_logged_in = login_row
            if status != "Active":
                raise DatabaseException("Account is inactive. Please restore your account before logging in.")
            if is_logged_in == "Y":
                raise DatabaseException("This customer is already logged in.")
            now = datetime.now().isoformat()
            cursor.execute(
                "UPDATE Login SET last_login=?, is_now_logged_in='Y' WHERE id=?",
                (now, customer_id)
            )
            self.conn.commit()
            return customer_id, name

        except sqlite3.Error as e:
            raise DatabaseException("Login failed: " + str(e))
        finally:
            cursor.close()
    def email_exists(self, email: str) -> bool:
        """
        Check if a customer email already exists in the Customer table.
        """
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM Customer WHERE email=?", (email,))
            return cursor.fetchone() is not None
        except sqlite3.Error as e:
            raise DatabaseException("Database error while checking email existence: " + str(e))
        finally:
            cursor.close()
    def login_with_google(self, id, email, name, google_id, picture_url=None):
        """
        Insert or update a customer when they log in with Google.
        """
        try:
            cursor = self.conn.cursor()

            # Check if customer already exists
            cursor.execute("SELECT customer_id FROM Customer WHERE email = ?", (email,))
            row = cursor.fetchone()

            if row:
                customer_id = row[0]
                # Update login info
                now = datetime.now().isoformat()
                cursor.execute("""
                    UPDATE Login
                    SET last_login=?, is_now_logged_in='Y'
                    WHERE id=? AND userType='Customer'
                """, (now, customer_id))
            else:
                # Create new customer
                cursor.execute("""
                    INSERT INTO Customer (customer_id,name, email, password, address, contact_number)
                    VALUES (?,?, ?, NULL, NULL, NULL)
                """, (id, name, email))
                
                customer_id = id
                # Insert login record
                now = datetime.now().isoformat()
                cursor.execute("""
                    INSERT INTO Login (id, last_login, is_now_logged_in, userType, status)
                    VALUES (?, ?, 'Y', 'Customer', 'Active')
                """, (customer_id, now))

            self.conn.commit()
            cursor.close()
            return customer_id
        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Google login failed: " + str(e))
    def logout_customer(self, customer_id: int):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT is_now_logged_in FROM Login WHERE id=?", (customer_id,))
            login_row = cursor.fetchone()
            if not login_row or login_row[0] != "Y":
                raise DatabaseException("Customer is not logged in.")

            now = datetime.now().isoformat()
            cursor.execute(
                "UPDATE Login SET last_logout=?, is_now_logged_in='N' WHERE id=?",
                (now, customer_id),
            )
            self.conn.commit()
            cursor.close()
        except sqlite3.Error as e:
            raise DatabaseException("Logout failed: " + str(e))
    def force_logout_everywhere(self, email: str):
        try:
            cur = self.conn.cursor()
            cur.execute("SELECT customer_id FROM Customer WHERE email=?", (email,))
            row = cur.fetchone()
            if not row:
                raise DatabaseException("Email does not exist.")
            customer_id = row[0]

            now = datetime.now().isoformat()
            cur.execute(
                "UPDATE Login SET last_logout=?, is_now_logged_in='N' WHERE id=?",
                (now, customer_id)
            )
            self.conn.commit()
        except sqlite3.Error as e:
            raise DatabaseException("Force logout failed: " + str(e))
        finally:
            cur.close()  
    def get_customer_by_id(self, customer_id):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT * FROM Customer WHERE customer_id = ?", (customer_id,))
            customer_data = cursor.fetchone()
            if not customer_data:
                return None
            return {
                'customer_id': customer_data[0],
                'name': customer_data[1],
                'email': customer_data[2],
                'password': customer_data[3],
                'address': customer_data[4],
                'contact_number': customer_data[5]
            }
        except sqlite3.Error as e:
            raise DatabaseException("Error fetching customer details: " + str(e))
        finally:
            cursor.close()
    def get_product_by_name(self, name):
        """Fetch product details by product name."""
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT product_id, name, description, company_name, price, quantity, reserved, customer_id, image_path
                FROM Product
                WHERE name = ?
            """, (name,))
            row = cursor.fetchone()
            if row:
                return {
                    "product_id": row[0],
                    "name": row[1],
                    "description": row[2],
                    "company_name": row[3],
                    "price": row[4],
                    "quantity": row[5],
                    "reserved": row[6],
                    "customer_id": row[7],
                    "image_path": row[8],
                }
            return None
        except sqlite3.Error as e:
            raise DatabaseException(f"Database error: {str(e)}")
        except DatabaseException as e:
            raise DatabaseException(f"Unexpected error in DAO: {str(e)}")
        finally:
            cursor.close()
    def view_product_catalog(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT * FROM Product WHERE quantity > 0
            """)
            rows = cursor.fetchall()

            products = [
                Product(
                    product_id=row[0],
                    name=row[1],
                    description=row[2],
                    company_name=row[3],
                    price=row[4],
                    quantity=row[5],
                    reserved=row[6],
                    customer_id=row[7],
                    image_path=row[8]
                )
                for row in rows
            ]
            cursor.close()
            return products

        except sqlite3.Error as e:
            raise DatabaseException("Error fetching product catalog: " + str(e))
    def add_product_to_cart(self, customer_id, product_name, quantity):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT product_id, quantity FROM Product WHERE name = ?", (product_name,))
            result = cursor.fetchone()
            if not result:
                raise DatabaseException(f"Product '{product_name}' not found.")
            product_id, available_quantity = result

            if available_quantity < quantity:
                raise DatabaseException(f"Not enough stock available for {product_name}.")
            cursor.execute("""
                SELECT order_id FROM "Order"
                WHERE customer_id = ? AND product_id = ? AND status = 'IN_CART'
            """, (customer_id, product_id))
            order = cursor.fetchone()

            if order:
                raise DatabaseException(
                    f"Product '{product_name}' already exists in your cart. "
                    f"Please use the 'Update Cart' option instead."
                )
            cursor.execute("""
                INSERT INTO "Order" (customer_id, product_id, quantity, status)
                VALUES (?, ?, ?, 'IN_CART')
            """, (customer_id, product_id, quantity))
            cursor.execute("""
                UPDATE Product
                SET quantity = quantity - ?, reserved = reserved + ?
                WHERE product_id = ?
            """, (quantity, quantity, product_id))

            self.conn.commit()
            cursor.close()
            return f"Product '{product_name}' added to cart successfully."

        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Error adding product to cart: " + str(e))    
    def update_cart_item(self, customer_id, product_name, new_quantity):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT product_id, quantity, reserved FROM Product WHERE name = ?", (product_name,))
            product = cursor.fetchone()
            if not product:
                raise DatabaseException(f"Product '{product_name}' not found")
            product_id, available_quantity, reserved_quantity = product
            cursor.execute("""
                SELECT order_id, quantity
                FROM "Order"
                WHERE customer_id = ? AND product_id = ? AND status = 'IN_CART'
            """, (customer_id, product_id))
            order = cursor.fetchone()
            if not order:
                raise DatabaseException(f"Product '{product_name}' not found in cart for customer {customer_id}")
            order_id, old_quantity = order
            diff = new_quantity - old_quantity   
            if diff > 0 and available_quantity < diff:
                raise DatabaseException(f"Not enough stock available to increase {product_name} to {new_quantity}")

            cursor.execute("""
                UPDATE "Order"
                SET quantity = ?
                WHERE order_id = ?
            """, (new_quantity, order_id))
            cursor.execute("""
                UPDATE Product
                SET quantity = quantity - ?,
                    reserved = reserved + ?
                WHERE product_id = ?
            """, (diff, diff, product_id))

            self.conn.commit()
            return f"Cart updated: {product_name} → quantity {new_quantity}"

        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to update cart item: " + str(e))

        finally:
            cursor.close()
    def delete_cart_item(self, customer_id, product_name):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT product_id FROM Product WHERE name = ?", (product_name,))
            product = cursor.fetchone()
            if not product:
                raise DatabaseException(f"Product '{product_name}' not found.")
            product_id = product[0]
            cursor.execute("""
                SELECT order_id, quantity FROM "Order"
                WHERE customer_id = ? AND product_id = ? AND status = 'IN_CART'
            """, (customer_id, product_id))
            order = cursor.fetchone()
            if not order:
                raise DatabaseException(f"Product '{product_name}' not found in cart.")
            order_id, qty_in_cart = order
            cursor.execute("DELETE FROM 'Order' WHERE order_id = ?", (order_id,))
            cursor.execute("""
                UPDATE Product
                SET quantity = quantity + ?, reserved = reserved - ?
                WHERE product_id = ?
            """, (qty_in_cart, qty_in_cart, product_id))
            self.conn.commit()
            cursor.close()
            return f"Product '{product_name}' removed from cart. Stock updated."
        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to delete cart item: " + str(e))
    def place_order(self, customer_id):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT o.order_id, o.product_id, o.quantity,
                    p.name, p.price, p.company_name, p.description
            FROM "Order" o
            JOIN Product p ON o.product_id = p.product_id
            WHERE o.customer_id = ? AND o.status = 'IN_CART'
            """, (customer_id,))
            cart_items = cursor.fetchall()

            if not cart_items:
                raise DatabaseException("Cart is empty. Cannot place order.")

            total_amount = 0
            total_items = 0
            for _, _, qty_in_cart, _, price, _, _ in cart_items:
                total_amount += qty_in_cart * price
                total_items += qty_in_cart
            for order_id, product_id, qty_in_cart, product_name, price, company, desc in cart_items:
                cursor.execute("""
                    UPDATE "Order"
                    SET status = 'PLACED'
                    WHERE order_id = ?
                """, (order_id,))

                cursor.execute("""
                    UPDATE Product
                    SET reserved = reserved - ?
                    WHERE product_id = ?
                """, (qty_in_cart, product_id))

                cursor.execute("""
                    INSERT INTO Transactions (customer_id, product_id, total_amount, no_of_items)
                    VALUES (?, ?, ?, ?)
                """, (customer_id, product_id, qty_in_cart * price, qty_in_cart))

            self.conn.commit()
            cursor.close()

            invoice = {
                "customer_id": customer_id,
                "items": [
                    {
                        "order_id": order_id,
                        "product_name": product_name,
                        "company": company,
                        "description": desc,
                        "price": price,
                        "quantity": qty_in_cart,
                        "total": qty_in_cart * price
                    }
                    for order_id, _, qty_in_cart, product_name, price, company, desc in cart_items
                ],
                "grand_total": total_amount,
                "total_items": total_items
            }
            return invoice

        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to place order: " + str(e))
    def view_order_history(self, customer_id):
        try:
            cursor = self.conn.cursor()

            cursor.execute("""
            SELECT t.transaction_id, t.total_amount, t.no_of_items,
                o.order_id, p.name, o.quantity, o.status, p.price
            FROM Transactions t
            JOIN "Order" o ON o.product_id = t.product_id AND o.customer_id = t.customer_id
            JOIN Product p ON o.product_id = p.product_id
            WHERE o.customer_id = ? AND o.status = 'PLACED'
            ORDER BY t.transaction_id, o.order_id 
            """, (customer_id,))

            rows = cursor.fetchall()
            if not rows:
                return f"No order history found for customer {customer_id}."

            history = {}
            for txn_id, total_amount, no_of_items, order_id, product_name, quantity, status, price in rows:
                if txn_id not in history:
                    history[txn_id] = {
                        "transaction_id": txn_id,
                        "total_amount": total_amount,
                        "no_of_items": no_of_items,
                        "orders": []
                    }
                history[txn_id]["orders"].append({
                    "order_id": order_id,
                    "product_name": product_name,
                    "quantity": quantity,
                    "price": price,
                    "status": status,
                    "line_total": quantity * price
                })
            cursor.close()
            return list(history.values())

        except sqlite3.Error as e:
            raise DatabaseException("Failed to fetch order history: " + str(e))
    def emailExists(self,email):
        try:
            cursor = self.conn.cursor()
            cursor.execute("SELECT 1 FROM Customer WHERE email=?", (email,))
            return cursor.fetchone() is not None
        except sqlite3.Error as e:
            raise DatabaseException("Database error while checking email existence: " + str(e))
      
    def update_customer_details(self, customer_id, name=None, email=None, password=None, address=None, contact_number=None):
        try:
            cursor = self.conn.cursor()
            updates = []
            params = []
            if name:
                updates.append("name = ?")
                params.append(name)
            if email:
                if self.emailExists(email):
                    raise DuplicateEmailException(f"Email {email} is already in use.")
                updates.append("email = ?")
                params.append(email)
            if password:
                cursor.execute("SELECT password FROM Customer WHERE customer_id = ?", (customer_id,))
                row = cursor.fetchone()
                current_password = row[0]
                updates.append("password = ?")
                params.append(password)

            if address:
                updates.append("address = ?")
                params.append(address)
            if contact_number:
                updates.append("contact_number = ?")
                params.append(contact_number)

            if not updates:
                return "No details provided to update."

            query = f"UPDATE Customer SET {', '.join(updates)} WHERE customer_id = ?"
            params.append(customer_id)
            cursor.execute(query, tuple(params))

            if cursor.rowcount == 0:
                return f"Customer {customer_id} not found."
            if password:
                cursor.execute("""
                    UPDATE Login
                    SET old_password = ?,
                        updated_password = ?
                    WHERE id = ?
                """, (current_password, password, customer_id))

            self.conn.commit()
            cursor.close()
            return f"Customer {customer_id} details updated successfully."
        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to update customer details: " + str(e))
    def soft_delete_customer(self, customer_id):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                UPDATE Login
                SET status = 'Inactive'
                WHERE id = ? AND userType = 'Customer'
            """, (customer_id,))

            self.conn.commit()

            if cursor.rowcount == 0:
                return f"No active customer found with ID {customer_id}."
            cursor.close()
            return f"Customer {customer_id} account has been deactivated (soft delete)."
        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to soft delete customer account: " + str(e))
    def restore_customer(self, email):
        try:
            cursor = self.conn.cursor()
            cursor.execute("""
                SELECT l.status, c.customer_id
                FROM Login l
                JOIN Customer c ON l.id = c.customer_id
                WHERE c.email = ? AND l.userType = 'Customer'
            """, (email,))
            row = cursor.fetchone()

            if not row:
                return f"No customer account found with email {email}."

            current_status, customer_id = row
            if current_status == "Active":
                raise DatabaseException(f"Customer {email} account is already active.")
            cursor.execute("""
                UPDATE Login
                SET status = 'Active'
                WHERE id = ? AND userType = 'Customer'
            """, (customer_id,))

            self.conn.commit()
            cursor.close()
            return "Customer account has been restored successfully."
        except sqlite3.Error as e:
            self.conn.rollback()
            raise DatabaseException("Failed to restore customer account: " + str(e))