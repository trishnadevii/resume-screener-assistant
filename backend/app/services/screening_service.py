
from app.extensions import db
from app.models.analysis import Analysis
from app.services.document_service import extract_resume_text
from app.services.gemini_service import analyze_resume


def create_screening(candidate_name, job_description, resume_text=None,
                     uploaded_file=None):

    candidate_name = (candidate_name or "").strip()
    job_description = (job_description or "").strip()

    if not candidate_name:
        raise ValueError("Candidate name is required.")

    if len(candidate_name) > 150:
        raise ValueError("Candidate name cannot exceed 150 characters.")

    if not job_description:
        raise ValueError("Job description is required.")

    resume_content = extract_resume_text(
        resume_text=resume_text,
        uploaded_file=uploaded_file
    )

    # Generate and validate the AI report.
    result = analyze_resume(job_description, resume_content)

    # Save only the screening report, never the original resume.
    analysis = Analysis(
        candidate_name=candidate_name,
        job_description=job_description,
        match_score=result.match_score,
        matching_skills=result.matching_skills,
        skill_gaps=result.skill_gaps,
        interview_questions=result.interview_questions
    )

    db.session.add(analysis)
    db.session.commit()

    return analysis
