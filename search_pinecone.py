from common_pinecone import index

from store_embeddings import len_safe_get_embedding

def main():
    query_embedding = len_safe_get_embedding("lesbain islamaphobic", average=True)

    query_response = index.query(
        top_k=10,
        include_values=False,
        include_metadata=True,
        vector=query_embedding,
    )

    print(query_response)

if __name__ == "__main__":
    main()

