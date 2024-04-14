"""
Create database (manual)

CREATE TABLE research_papers (
    id INT AUTO_INCREMENT,
    `key` VARCHAR(1000) NOT NULL,
    content TEXT NOT NULL,
    FULLTEXT(content),
    PRIMARY KEY (id)
) ENGINE=InnoDB;
"""
import pickle

import pymysql
import pypdf

from typing import List

from loguru import logger as log
from common_mysql import connection

def extract_text_from_pdf(pdf_path):
    pdf_reader = pypdf.PdfReader(pdf_path)
    pages = len(pdf_reader.pages)

    page_content = []
    log.info("Extracting text from PDF")

    for page_idx, page in enumerate(pdf_reader.pages):
        log.debug(f'Extracting text from page {page_idx}')
        page_content.append(page.extract_text())

    return page_content

def insert_record(key: str, content: List[str], connection, cursor):
    # SQL query string
    sql_insert_query = """INSERT INTO research_papers (`key`, content) VALUES (%s, %s) ON DUPLICATE KEY UPDATE content = VALUES(content)"""
    record_to_insert = (key, " ".join(content))

    # execute the query
    cursor.execute(sql_insert_query, record_to_insert)

    # get the generated id back
    last_row_id = cursor.lastrowid
    if not last_row_id: # on updates
        last_row_id = cursor.execute(f"SELECT id FROM research_papers WHERE `key` = '{key}'")
        last_row_id = cursor.fetchone()[0]
        log.debug("last row id " + str(last_row_id))

    # insert pages
    log.debug("inserting pages")
    for page_idx, page in enumerate(content):
        sql_insert_page_query = """INSERT INTO research_papers_pages (paper_id, page_number, content) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE content = VALUES(content)"""
        record_to_insert = (last_row_id, page_idx, page)
        try:
            cursor.execute(sql_insert_page_query, record_to_insert)
        except pymysql.Error as error:
            log.warning(f"Failed to insert page {page_idx} into research_papers_pages table {error}")
    log.debug("pages inserted")

    # commit
    connection.commit()

def main():
    # read the dumped pickle file
    with open("all_pdfs.pickle", "rb") as handle:
        all_pdfs = pickle.load(handle)
            
    # create a new cursor
    cursor = connection.cursor()

    try:
        for key, value in all_pdfs.items():
            # insert record
            log.info(f'Inserting {key}')
            try:
                insert_record(key, value, connection, cursor)
            except pymysql.Error as error:
                print(f"Failed to insert record into research_papers table {error}")
    except KeyboardInterrupt:
        log.info("Keyboard interrupt detected, exiting")
    finally:
        # cleanup
        log.info("Closing cursor and connection")
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main()