import sqlite3

def display_table_content(db_path, table_name):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        col_names = [description[0] for description in cursor.description]
        print(" | ".join(col_names))
        print("-" * 40)
        for row in rows:
            print(" | ".join(str(item) for item in row))
    except sqlite3.Error as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":

    display_table_content('grocery_store.db', '"Login"')