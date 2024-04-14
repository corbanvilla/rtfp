import pickle

from openai.embeddings_utils import get_embedding, cosine_similarity
from store_embeddings import len_safe_get_embedding

def search_embeddings(query, all_embeddings):
    query_embedding = len_safe_get_embedding(query, average=True)
    results = []
    for filename, embedding in all_embeddings.items():
        similarity = cosine_similarity(query_embedding, embedding)
        results.append((filename, similarity))
    results = sorted(results, key=lambda x: x[1], reverse=True)
    return results

def main():
    with open("embeddings.pickle", "rb") as handle:
        all_embeddings = pickle.load(handle)

    # query = "gender bias"
    print(len(list(all_embeddings.values())[0]))

    # print(search_embeddings(query, all_embeddings))

if __name__ == "__main__":
    main()