import pickle
import mysql.connector

# import time

def create_database_and_table():
    conn = mysql.connector.connect(
        host="localhost",
        user="yourusername",
        password="yourpassword",
        database="yourdatabase"
    )
    c = conn.cursor()

    # Check if table exists and if not, create it
    c.execute('''CREATE TABLE IF NOT EXISTS file_contents (filename VARCHAR(255) PRIMARY KEY, content TEXT)''')
    c.execute('''CREATE TABLE IF NOT EXISTS file_contents_fts (filename VARCHAR(255) PRIMARY KEY, content TEXT)''')
    c.execute('''ALTER TABLE file_contents_fts ADD FULLTEXT(content)''')

    conn.commit()
    conn.close()

def insert_into_database(key, value):
    conn = mysql.connector.connect(
        host="localhost",
        user="yourusername",
        password="yourpassword",
        database="yourdatabase"
    )
    c = conn.cursor()

    # Check if key exists, if not, insert data
    c.execute("INSERT IGNORE INTO file_contents (filename, content) VALUES (%s, %s)", (key, value))
    c.execute("INSERT IGNORE INTO file_contents_fts (filename, content) VALUES (%s, %s)", (key, value))

    conn.commit()
    conn.close()

def search_database(query):
    conn = mysql.connector.connect(
        host="localhost",
        user="yourusername",
        password="yourpassword",
        database="yourdatabase"
    )
    c = conn.cursor()

    # Perform natural language search using MATCH and AGAINST
    c.execute("""
        SELECT filename, MATCH(content) AGAINST (%s IN NATURAL LANGUAGE MODE) AS score
        FROM file_contents_fts
        WHERE MATCH(content) AGAINST (%s IN NATURAL LANGUAGE MODE)
        ORDER BY score DESC
    """, (query, query))

    results = c.fetchall()
    conn.close()

    return results


def main():
    create_database_and_table()

    with open("all_pdfs.pickle", "rb") as handle:
        all_pdfs = pickle.load(handle)

    for filename, pages in all_pdfs.items():
        all_text = " ".join(pages)
        insert_into_database(filename, all_text)

if __name__ == "__main__":
    main()
