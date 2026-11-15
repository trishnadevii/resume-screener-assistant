
from io import BytesIO

from app.services.document_service import extract_resume_text


# Test 1: Pasted resume text
text = extract_resume_text(
    resume_text="John Doe\nPython Developer\nSkills: Python, Flask, SQL"
)
assert "Python Developer" in text
print("Test 1 passed: Pasted text")


# Test 2: Empty resume
try:
    extract_resume_text(resume_text="   ")
except ValueError:
    print("Test 2 passed: Empty text rejected")


# Test 3: Unsupported file
fake_file = BytesIO(b"sample content")
fake_file.filename = "resume.txt"

try:
    extract_resume_text(uploaded_file=fake_file)
except ValueError:
    print("Test 3 passed: Unsupported file rejected")
