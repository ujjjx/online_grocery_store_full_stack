import sqlite3

def get_customer_id_by_email(db_name, email):
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # SQL query to get customer_id by email
    cursor.execute("SELECT customer_id FROM Customer WHERE email = ?", (email,))
    customer_id = cursor.fetchone()

    conn.close()

    if customer_id:
        return customer_id[0]  # Return the customer_id (first element)
    else:
        return None

# Example usage
db_name = 'grocery_store.db'  # Your database file
email = 'Kum@gmail.com'
customer_id = get_customer_id_by_email(db_name, email)

if customer_id:
    print(f"The customer ID for {email} is {customer_id}")
else:
    print(f"No customer found with the email {email}")