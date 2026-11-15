
from io import BytesIO

import fitz  # PyMuPDF
from docx import Document


MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
MAX_TEXT_LENGTH = 50_000


def extract_resume_text(resume_text=None, uploaded_file=None):
    """
    Extract resume text from pasted text, PDF, or DOCX.
    Original resume content is processed in memory only.
    """

    if resume_text and uploaded_file:
        raise ValueError("Provide either pasted resume text or a file, not both.")

    if resume_text is not None:
        text = resume_text.strip()

        if not text:
            raise ValueError("Resume text cannot be empty.")

        if len(text) > MAX_TEXT_LENGTH:
            raise ValueError("Resume text is too long. Maximum is 50,000 characters.")

        return text

    if uploaded_file is None:
        raise ValueError("Please provide resume text or upload a PDF/DOCX file.")

    file_bytes = uploaded_file.read()

    if not file_bytes:
        raise ValueError("The uploaded file is empty.")

    if len(file_bytes) > MAX_FILE_SIZE:
        raise ValueError("File is too large. Maximum upload size is 5 MB.")

    filename = uploaded_file.filename or ""
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if extension == "pdf":
        text = _extract_pdf_text(file_bytes)
    elif extension == "docx":
        text = _extract_docx_text(file_bytes)
    else:
        raise ValueError("Unsupported file type. Please upload a PDF or DOCX.")

    text = text.strip()

    if not text:
        raise ValueError(
            "No readable text found. The PDF may be scanned. "
            "Please upload a text-based PDF or paste the resume text."
        )

    if len(text) > MAX_TEXT_LENGTH:
        raise ValueError("Extracted resume text is too long.")

    return text


def _extract_pdf_text(file_bytes):
    try:
        with fitz.open(stream=file_bytes, filetype="pdf") as pdf:
            if pdf.is_encrypted:
                raise ValueError("Password-protected PDFs are not supported.")

            pages = [page.get_text() for page in pdf]
            return "\n".join(pages)

    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("Unable to read the PDF file. It may be corrupted.") from exc


def _extract_docx_text(file_bytes):
    try:
        document = Document(BytesIO(file_bytes))

        paragraphs = [
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text.strip()
        ]

        return "\n".join(paragraphs)

    except Exception as exc:
        raise ValueError("Unable to read the DOCX file. It may be corrupted.") from exc
