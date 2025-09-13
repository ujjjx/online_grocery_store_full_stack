from backend.utils.exceptions import DatabaseException,DuplicateEmailException,ServiceException
from backend.DAO.admin_dao import AdminDAO
from backend.DAO.db_connection import DBConnection
from backend.DAO.db_init import DBInitializer
from entities import product
from entities.admin import Admin
from entities.product import Product
import random
import re
import os
class AdminService:
    def __init__(self):
        conn = DBConnection().get_connection()
        DBInitializer(conn).create_tables()
        self.dao = AdminDAO(conn)
        self.current_admin_id = None
    def generate_admin_id(self):
        while True:
            admin_id = random.randint(10000, 99999)  
            if not self.dao.is_admin_id_exists(admin_id): 
                return admin_id
    def validate_email(self, email, errors):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors.append("Invalid email format")
    def validate_password(self, password, errors):
        if len(password) < 6 or len(password) > 12:
            errors.append("Password must be between 6 and 12 characters long.")
        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", password):
            errors.append("Password must contain at least one digit.")
        if not re.search(r"[@$!%*?&]", password):
            errors.append("Password must contain at least one special character (@$!%*?&).")

    def register_admin(self, email, password, status="Active"):
        errors = []
        try:
            self.validate_email(email,errors)
            self.validate_password(password,errors)
            if errors:
                raise ServiceException("\n".join(errors))
            admin_id=self.generate_admin_id()
            admin = Admin(admin_id,email,password)
            self.dao.register_admin(admin)
            print("Admin registered successfully! Your ID:",admin_id)
        except (DuplicateEmailException, DatabaseException, ServiceException) as e:
            raise ServiceException(str(e))
    def login_admin(self, email, password):
        try:
            admin_id = self.dao.login_admin(email, password)
            self.current_admin_id = admin_id
        except (DatabaseException, ServiceException) as e:
            raise ServiceException(str(e))
    def logout_admin(self):
        if not self.current_admin_id:
            raise ServiceException("No admin is logged in.")
        try:
            self.dao.logout_admin(self.current_admin_id)
            self.current_admin_id = None
        except DatabaseException as e:
            raise ServiceException(str(e))
    def force_logout_all_admins(self):
        try:
            self.dao.force_logout_all_admins()
            self.current_admin_id = None
            return "All admins have been forcefully logged out."
        except Exception as e:
            raise ServiceException(str(e))
    def get_first_half_logged_in(self):
        try:
            return self.dao.get_first_half_logged_in_customers()
        except DatabaseException as e:
            raise ServiceException(str(e))

    def update_customer_names(self):
        try:
            self.dao.update_customer_names_by_country()
        except DatabaseException as e:
            raise ServiceException(str(e))
    def view_all_customers(self):
        try:
            customers = self.dao.get_all_customers()
            return customers
        except DatabaseException as e:
            raise ServiceException(str(e))
    def get_customer_by_email(self, email: str):
        try:
            customer = self.dao.get_customer_by_email(email)
            if not customer:
                return "No Such Customer Exist with the Given Email."
            return customer
        except Exception as e:
            raise ServiceException("Error in fetching customer by email: " + str(e))
    def generate_product_id(self):
        digits = [str(random.randint(0, 9)) for _ in range(10)]
        return f"{digits[0]}-{''.join(digits[1:5])}-{''.join(digits[5:9])}-{digits[9]}"
    def add_product(self, name, description, price, quantity, company_name=None):
        try:
            product = Product(
                product_id=self.generate_product_id(),
                name=name[:50],
                description=description[:100],
                company_name= company_name[:50] if company_name else None,
                price=round(float(price), 2),
                quantity=int(quantity)
            )
            return self.dao.add_product(product)
        except DatabaseException as e:
            raise ServiceException(str(e))
        except Exception as e:
            raise ServiceException("Unexpected error while adding product: " + str(e))
    def update_product(self, current_name, new_name=None, description=None, company_name=None, price=None, quantity=None):
        try:
            return self.dao.update_product(
                current_name=current_name,
                new_name=new_name,
                description=description,
                company_name=company_name,
                price=price,
                quantity=quantity
            )
        except DatabaseException as e:
            raise ServiceException(str(e))
    def bulk_upload_products(self, csv_file):
        try:
            if not os.path.exists(csv_file):
                raise ServiceException(f"CSV file '{csv_file}' not found.")
            self.dao.bulk_upload_products(csv_file)
            return f"Bulk upload completed successfully from {csv_file}."

        except DatabaseException as e:
            raise ServiceException(str(e))
        except Exception as e:
            raise ServiceException("Unexpected error in bulk upload: " + str(e))
    def display_all_products(self):
        try:
            products = self.dao.display_all_products()
            if not products:
                return "Product List is Empty."
            return products
        except Exception as e:
            raise ServiceException("Error in fetching all products: " + str(e))
    def get_highest_priced_product(self):
        try:
            product = self.dao.get_highest_priced_product()
            if not product:
                return "Product List is Empty."
            return product
        except Exception as e:
            raise ServiceException("Error in fetching highest priced product: " + str(e))
    def view_all_transactions(self):
        try:
            return self.dao.get_all_transactions()
        except DatabaseException as e:
            raise ServiceException(str(e))

    def view_second_highest_transaction(self):
        try:
            transactions = self.dao.get_all_transactions()
            if len(transactions) < 2:
                return "Not enough transactions to find second highest."
            return transactions[1]  
        except DatabaseException as e:
            raise ServiceException(str(e))
        except Exception as e:
            raise ServiceException("Unexpected error while fetching second highest transaction: " + str(e))
    def get_successful_orders_with_transactions(self):
        try:
            rows = self.dao.get_successful_orders_with_transactions()
            if not rows:
                return "No successful placed orders found."

            result = []
            for row in rows:
                result.append({
                    "customer_id":     row[0],
                    "customer_name":   row[1],
                    "email":           row[2],
                    "address":         row[3],
                    "contact_number":  row[4],
                    "transaction_id":  row[5],
                    "product_name":    row[6],
                    "no_of_items":     row[7],
                    "status":          "PLACED"
                })
            return result
        except DatabaseException as e:
            raise ServiceException(str(e))
    