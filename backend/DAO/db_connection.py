import sqlite3

from backend.utils.exceptions import DatabaseException
class DBConnection:
    def __init__(self, db_name="grocery_store.db"):
        try:
            self.conn = sqlite3.connect(db_name,check_same_thread=False)
        except sqlite3.Error as e:
            raise DatabaseException("Database connection failed: " + str(e))

    def get_connection(self):
        return self.conn