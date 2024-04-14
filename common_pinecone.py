import pinecone

from os import environ as env

if all([env.get("PINECONE_API_KEY"), env.get("PINECONE_REGION")]) is False:
    raise Exception("Please set PINECONE_API_KEY and PINECONE_REGION environment variables.")

pinecone.init(api_key=env.get("PINECONE_API"), environment=env.get("PINECONE_REGION"))
index = pinecone.Index(env.get("PINECONE_INDEX"))
