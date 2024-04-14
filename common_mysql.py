import pymysql

from os import environ as env

if all([env.get("DATABASE_HOST"), env.get("DATABASE_NAME"), env.get("DATABASE_USERNAME"), env.get("DATABASE_PASSWORD")]) is False:
    raise ValueError("Please set the environment variables DATABASE_HOST, DATABASE_NAME, DATABASE_USERNAME, and DATABASE_PASSWORD")


# create connection
connection = pymysql.connect(
    host=env.get("DATABASE_HOST"),       # or your host
    database=env.get("DATABASE_NAME"), # name of your database
    user=env.get("DATABASE_USERNAME"),   # your username
    password=env.get("DATABASE_PASSWORD"), # your password
    ssl={"skip_tls_check":True}, # implicitly accept self-signed certificates
)
