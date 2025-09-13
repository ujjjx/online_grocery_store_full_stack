from backend.utils.exceptions import DatabaseException,DuplicateEmailException,ServiceException
import re
import random
from entities.customer import Customer
from backend.DAO.customer_dao import CustomerDAO
from backend.DAO.db_connection import DBConnection
from backend.DAO.db_init import DBInitializer
from entities.unverified_user import UnverifiedUser
from flask_mail import Mail, Message
from flask import current_app as app
class CustomerService:
    def __init__(self,mail:Mail):
        conn = DBConnection().get_connection()
        DBInitializer(conn).create_tables()
        self.dao = CustomerDAO(conn)
        self.current_customer_id = None
        self.mail = mail
    def send_verification_email(self, data):
        try:
            otp = str(random.randint(100000, 999999))

            user = UnverifiedUser(
                email=data['email'],
                name=data['name'],
                password=data['password'],
                address=data['address'],
                contact=data['contact'],
                otp_code=otp
            )
            self.dao.insert_or_update(user)

            # Send email
            msg = Message("Verify your email",
                        sender= app.config['MAIL_USERNAME'],
                        recipients=[data['email']])
            msg.body = f"Hello {data['name']},\n\nYour verification code is: {otp}\n\nThanks!"
            self.mail.send(msg)

            return {"message": "Verification code sent to your email."}
        except Exception as e:
            raise ServiceException("Failed to send verification email: " + str(e))
    def verify_code(self, email, otp):
        try:
            user = self.dao.get_user(email)
            if not user:
                raise ServiceException("Email not found or already verified.")

            if user.otp_code != otp:
                raise ServiceException("Invalid verification code.")

            # Move to Customer table
            customer_id = self.generate_customer_id()
            customer = Customer(
                customer_id,
                user.name,
                user.email,
                user.password,
                user.address,
                user.contact
            )
            self.dao.insert_customer(customer)
            # Remove from UnverifiedUsers
            self.dao.delete_user(email)

            return customer_id
        except Exception as e:
            raise ServiceException("Verification failed: " + str(e))
    def generate_customer_id(self):
        while True:
            new_id = random.randint(10000, 99999)
            if not self.dao.is_customer_id_exists(new_id):
                return new_id
    def validate_email(self, email, errors):
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            errors.append("Invalid email format")
    def validate_password(self, password, errors):
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", password):
            errors.append("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", password):
            errors.append("Password must contain at least one lowercase letter.")
        if not re.search(r"[0-9]", password):
            errors.append("Password must contain at least one digit.")
        if not re.search(r"[@$!%*?&]", password):
            errors.append("Password must contain at least one special character (@$!%*?&).")
    def validate_address(self, address, errors):
        if not address or len(address) < 5:
            errors.append("Address must be at least 5 characters long.")
        if len(address) > 100:
            errors.append("Address should not be more than 100 characters.")
    def register_customer(self, name, email, password, address, contact_number):
        errors = []
        try:
            if not name:
                errors.append("Name is required.")
            if not email:
                errors.append("Email is required.")
            else:
                self.validate_email(email,errors)
            if not password:
                errors.append("Password is required.")
            else:
                self.validate_password(password,errors)
            if not address:
                errors.append("Address is required.")
            else:
                self.validate_address(address,errors)
            if errors:
                raise ServiceException("\n".join(errors))
            customer_id = self.generate_customer_id()
            customer = Customer(customer_id, name, email, password, address, contact_number)
            self.dao.insert_customer(customer)
            print("Customer registered successfully! Your ID:",customer_id)
            return customer_id
        except (DuplicateEmailException, DatabaseException, ServiceException) as e:
            raise ServiceException(str(e))
    def login(self, email, password):
        try:
            customer_id, name = self.dao.login_customer(email, password)
            return customer_id, name
        except DatabaseException as e:
            raise ServiceException(str(e))
    def logout(self, customer_id):
        if not customer_id:
            raise ServiceException("No customer is logged in.")
        try:
            self.dao.logout_customer(customer_id)
        except DatabaseException as e:
            raise ServiceException(str(e))
    def email_exists(self, email: str) -> bool:
        """
        Service wrapper to check if an email exists.
        """
        try:
            return self.dao.email_exists(email)
        except DatabaseException as e:
            raise ServiceException(str(e))
    def login_with_google(self, email, name, google_id, picture_url=None):
        try:
            customer_id = self.generate_customer_id()
            return self.dao.login_with_google(customer_id,email, name, google_id, picture_url)
        except DatabaseException as e:
            raise ServiceException(str(e))
    def force_logout_everywhere(self, email: str):
        try:
            self.dao.force_logout_everywhere(email)
        except DatabaseException as e:
            raise ServiceException(str(e))
    def get_customer_details(self, customer_id):
        try:
            customer = self.dao.get_customer_by_id(customer_id)
            if customer:
                return customer
            else:
                return "Customer not found."
        except DatabaseException as e:
            raise ServiceException(str(e))
        except Exception as e:
            raise ServiceException("Unexpected error occurred: " + str(e))
    def get_product_details_by_name(self, name: str):
        try:
            product = self.dao.get_product_by_name(name)
            if not product:
                raise ServiceException(f"Product with name '{name}' not found")
            return product
        except DatabaseException as e:
            return {"message": f"Failed to fetch product catalog: {e}", "data": []}
        except ServiceException as e:
            return {"message": f"Unexpected error occurred: {e}", "data": []}
    def get_product_catalog(self):
        try:
            products = self.dao.view_product_catalog()
            if not products:
                return {"message": "No products available at the moment.", "data": []}
            return {"message": "Product catalog fetched successfully.", "data": products}
        except DatabaseException as e:
            return {"message": f"Failed to fetch product catalog: {e}", "data": []}
        except ServiceException as e:
            return {"message": f"Unexpected error occurred: {e}", "data": []}
    def add_to_cart(self, customer_id, product_name, quantity):
        try:
            message = self.dao.add_product_to_cart(customer_id, product_name, quantity)
            return {"status": "success", "message": message}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def update_cart(self, customer_id, product_name, new_quantity):
        try:
            message = self.dao.update_cart_item(customer_id, product_name, new_quantity)
            return {"status": "success", "message": message}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def delete_cart_item(self, customer_id, product_name):
        try:
            message = self.dao.delete_cart_item(customer_id, product_name)
            return {"status": "success", "message": message}
        except DatabaseException as e:
            raise ServiceException(str(e))
    def place_order(self, customer_id):
        try:
            invoice = self.dao.place_order(customer_id)
            return {"status": "success", "message": "Order placed successfully.", "invoice": invoice}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def view_order_history(self, customer_id):
        try:
            history = self.dao.view_order_history(customer_id)
            if isinstance(history, str):
                return {"status": "info", "message": history}
            return {"status": "success", "orders": history}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def update_customer_details(self, customer_id, name=None, email=None, password=None, address=None, contact_number=None):
        try:
            
            errors = []
            if email:
                self.validate_email(email,errors)
            if password:
                self.validate_password(password,errors)
            if address:
                self.validate_address(address,errors)
            if contact_number:
                self.validate_contact_number(contact_number,errors)
            if errors:
                raise ServiceException("\n".join(errors))
            result = self.dao.update_customer_details(
                customer_id,
                name=name,
                email=email,
                password=password,
                address=address,
                contact_number=contact_number
            )
            return {"status": "success", "message": result}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except ServiceException as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def soft_delete_customer(self, customer_id):
        try:
            result = self.dao.soft_delete_customer(customer_id)
            return {"status": "success", "message": result}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}
    def restore_customer(self, email):
        try:
            result = self.dao.restore_customer(email)
            return {"status": "success", "message": result}
        except DatabaseException as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            return {"status": "error", "message": f"Unexpected error: {str(e)}"}