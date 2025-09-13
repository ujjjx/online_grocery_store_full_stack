import sqlite3
from backend.utils.exceptions import DatabaseException
class DBInitializer:
    def __init__(self, conn):
        self.conn = conn

    def create_tables(self):
        try:
            cursor = self.conn.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS UnverifiedUsers (
                email TEXT PRIMARY KEY,
                name TEXT,
                password TEXT,
                address TEXT,
                contact TEXT,
                otp_code TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )''')
            cursor.execute('''CREATE TABLE IF NOT EXISTS Customer (
                customer_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT,
                address TEXT,
                contact_number TEXT,
                is_active INTEGER DEFAULT 1
            )''')
            # Login table
            cursor.execute('''CREATE TABLE IF NOT EXISTS Login (
                id INTEGER NOT NULL,
                last_login TEXT,
                last_logout TEXT,
                updated_password TEXT,
                old_password TEXT,
                is_now_logged_in TEXT NOT NULL CHECK(is_now_logged_in IN ('Y','N')),
                userType TEXT NOT NULL CHECK(userType IN ('Customer','Admin')),
                status TEXT NOT NULL CHECK(status IN ('Active','Inactive'))
                )''')
            # Product table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Product (
                product_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                company_name TEXT,
                price REAL NOT NULL,
                quantity INTEGER NOT NULL,
                reserved INTEGER DEFAULT 0,
                customer_id INTEGER,
                image_path TEXT,
                FOREIGN KEY(customer_id) REFERENCES Customer(customer_id)
            )""")
            # Order table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS "Order" (
                    order_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER NOT NULL,
                    product_id TEXT NOT NULL,
                    quantity INTEGER NOT NULL,
                    status TEXT DEFAULT 'IN_CART',
                    FOREIGN KEY(customer_id) REFERENCES Customer(customer_id),
                    FOREIGN KEY(product_id) REFERENCES Product(product_id)
                )
            """)
            # Transaction Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Transactions (
                transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                no_of_items INTEGER NOT NULL,
                FOREIGN KEY(customer_id) REFERENCES Customer(customer_id),
                FOREIGN KEY(product_id) REFERENCES Product(product_id)
            )
            """)
            # Admin table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS Admin (
                admin_id INTEGER PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                customer_id INTEGER,
                product_id INTEGER,
                transaction_id INTEGER,
                FOREIGN KEY(customer_id) REFERENCES Customer(customer_id),
                FOREIGN KEY(product_id) REFERENCES Product(product_id),
                FOREIGN KEY(transaction_id) REFERENCES Transactions(transaction_id)
            )
            """)

            self.conn.commit()
        except sqlite3.Error as e:
            raise DatabaseException("Table creation failed: " + str(e))