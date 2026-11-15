
from dotenv import load_dotenv
import traceback

load_dotenv()

from app.services.gemini_service import analyze_resume

job_description = """
We need a Python developer with Flask, REST API,
SQL and experience building backend applications.
"""

resume_text = """
Candidate: John Doe

Experience:
2 years as a Python Developer.

Skills:
Python, Flask, REST APIs, SQL, Git.

Education:
B.Tech in Computer Science.
"""

try:
    result = analyze_resume(job_description, resume_text)

    print("\nGemini analysis successful!")
    print("Match score:", result.match_score)
    print("Matching skills:", result.matching_skills)
    print("Skill gaps:", result.skill_gaps)
    print("Interview questions:", result.interview_questions)

except Exception as error:
    print("\n--- ACTUAL ERROR DETAILS ---")
    traceback.print_exception(type(error), error, error.__traceback__)
