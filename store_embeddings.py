import pickle
from itertools import islice

import numpy as np
import openai
import tiktoken

from loguru import logger as log
from tenacity import retry, wait_random_exponential, stop_after_attempt, retry_if_not_exception_type

EMBEDDING_MODEL = 'text-embedding-ada-002'
EMBEDDING_CTX_LENGTH = 8191
EMBEDDING_ENCODING = 'cl100k_base'

# let's make sure to not retry on an invalid request, because that is what we want to demonstrate
@retry(wait=wait_random_exponential(min=1, max=20), stop=stop_after_attempt(6), retry=retry_if_not_exception_type(openai.InvalidRequestError))
def get_embedding(text_or_tokens, model=EMBEDDING_MODEL):
    return openai.Embedding.create(input=text_or_tokens, model=model)["data"][0]["embedding"]



def batched(iterable, n):
    """Batch data into tuples of length n. The last batch may be shorter."""
    # batched('ABCDEFG', 3) --> ABC DEF G
    if n < 1:
        raise ValueError('n must be at least one')
    it = iter(iterable)
    while (batch := tuple(islice(it, n))):
        yield batch

def chunked_tokens(text, encoding_name, chunk_length):
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(text)
    chunks_iterator = batched(tokens, chunk_length)
    yield from chunks_iterator

def len_safe_get_embedding(text, model=EMBEDDING_MODEL, max_tokens=EMBEDDING_CTX_LENGTH, encoding_name=EMBEDDING_ENCODING, average=True):
    chunk_embeddings = []
    chunk_lens = []
    for chunk in chunked_tokens(text, encoding_name=encoding_name, chunk_length=max_tokens):
        chunk_embeddings.append(get_embedding(chunk, model=model))
        chunk_lens.append(len(chunk))

    if average:
        chunk_embeddings = np.average(chunk_embeddings, axis=0, weights=chunk_lens)
        chunk_embeddings = chunk_embeddings / np.linalg.norm(chunk_embeddings)  # normalizes length to 1
        chunk_embeddings = chunk_embeddings.tolist()
    return chunk_embeddings

if __name__ == "__main__":
    with open("all_pdfs.pickle", "rb") as handle:
        all_pdfs = pickle.load(handle)

    try:
        with open("embeddings.pickle", "rb") as handle:
            all_embeddings = pickle.load(handle)
    except FileNotFoundError:
        all_embeddings = {}
    
    try:
        with open("embeddings_pages.pickle", "rb") as handle:
            all_embeddings_pages = pickle.load(handle)
    except FileNotFoundError:
        all_embeddings_pages = {}

    # Store general embeddings
    try:
        for filename, pages in all_pdfs.items():
            if filename in all_embeddings:
                log.info(f"Skipping already processed file: {filename}")
                continue

            log.info(f"Processing file: {filename}")
            all_text = " ".join(pages)

            embedding = len_safe_get_embedding(all_text, average=True)
            
            all_embeddings[filename] = embedding
            
        # Store page embeddings
        for filename, pages in all_pdfs.items():
            if filename in all_embeddings_pages:
                log.info(f"Skipping already processed pages: {filename}")
                continue

            log.debug("loaded " + filename)
            all_embeddings_pages[filename] = []
            for page_idx, page in enumerate(pages):
                log.debug("Processing page " + str(page_idx))

                try:
                    page_embedding = len_safe_get_embedding(page, average=True)
                    all_embeddings_pages[filename].append(page_embedding)
                except Exception as e:
                    log.error("Exception caught: " + str(e))
                    continue

    except Exception as e:
        log.error("Exception caught: " + str(e))
        log.error("Saving embeddings to file")
    finally:
        with open("embeddings.pickle", "wb") as handle:
            pickle.dump(all_embeddings, handle)
            log.info("Embeddings stored")
        with open("embeddings_pages.pickle", "wb") as handle:
            pickle.dump(all_embeddings_pages, handle)
            log.info("Page embeddings stored")

