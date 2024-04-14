from common_mysql import connection

def search_content(query, cursor):
    # SQL query string
    sql_search_query = """SELECT `key`, MATCH(content) AGAINST(%s IN NATURAL LANGUAGE MODE) AS score 
                            FROM research_papers 
                            WHERE MATCH(content) AGAINST(%s IN NATURAL LANGUAGE MODE) 
                            ORDER BY score DESC"""
    cursor.execute(sql_search_query, (query,query))

    # fetch all the matching rows
    records = cursor.fetchall()

    return records


def main():
    cursor = connection.cursor()

    content = search_content("gay", cursor)

    print(content)


if __name__ == "__main__":
    main()
