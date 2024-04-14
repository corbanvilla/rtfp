import pickle

# import data science libraries


from common_pinecone import index

def main():
    with open("embeddings.pickle", "rb") as handle:
        all_embeddings = pickle.load(handle)
    

    # key,value = next(iter(all_embeddings.items()))

    for key, value in all_embeddings.items():
        upsert_response = index.upsert(
            vectors=[
                (key, value, {"type": "paper"}),
            ],
            namespace="papers",
        )
        # print response
        print('upsert: ', key)

    with open("embeddings_pages.pickle", "rb") as handle:
        all_embeddings_pages = pickle.load(handle)

    for key, value in all_embeddings_pages.items():
        for page_idx, page in enumerate(value):
            upsert_response = index.upsert(
                vectors=[
                    (key + "____" + str(page_idx), page, {"type": "page", "page_idx": page_idx, "paper": key}),
                ],
                namespace="pages",
            )
            # print response
            print('upsert: ', key + "____" + str(page_idx))


if __name__ == "__main__":
    main()