import os
import pickle

import pypdf

from loguru import logger as log

from upload_s3 import upload_to_aws

def extract_text_from_pdf(pdf_path):
    pdf_reader = pypdf.PdfReader(pdf_path)
    pages = len(pdf_reader.pages)

    page_content = []
    log.info("Extracting text from PDF: " + pdf_path + " with " + str(pages) + " pages.")

    for page_idx, page in enumerate(pdf_reader.pages):
        # log.debug(f'Extracting text from page {page_idx}')
        try:
            page_content.append(page.extract_text())
        except:
            log.warning(f'Could not extract text from page {page_idx}')
            page_content.append('')

    return page_content

# specify the directory you want to scan for PDF files
directory = './papers'
all_pdfs = {}
for filename in os.listdir(directory):
    if filename.endswith(".pdf"):
        pdf_path = os.path.join(directory, filename)
        log.debug('Scanning: {filename} ---')
        text = extract_text_from_pdf(pdf_path)
        log.info('Uploading to S3')
        print(f'{pdf_path=}, {filename=}')
        upload_to_aws(pdf_path, 'rtfp-papers', filename)

        all_pdfs[filename] = text

# pickle the dict
with open('all_pdfs.pickle', 'wb') as handle:
    pickle.dump(all_pdfs, handle)
