
from app.extensions import db
from app.models.analysis import Analysis
from app.services.document_service import extract_resume_text
from app.services.gemini_service import analyze_resume


def create_screening(
    candidate_name,
    job_title,
    job_description=None,
    job_file=None,
    resume_text=None,
    uploaded_file=None
):
    candidate_name = (candidate_name or "").strip()
    job_title = (job_title or "").strip()

    if not candidate_name:
        raise ValueError("Candidate name is required.")

    if len(candidate_name) > 150:
        raise ValueError("Candidate name cannot exceed 150 characters.")

    if not job_title:
        raise ValueError("Job title is required.")

    # Extract job description from pasted text or uploaded file.
    extracted_job_description = extract_resume_text(
        resume_text=job_description,
        uploaded_file=job_file
    )

    # Extract candidate resume from pasted text or uploaded file.
    extracted_resume = extract_resume_text(
        resume_text=resume_text,
        uploaded_file=uploaded_file
    )

    # Include the job title in the content sent to Gemini.
    job_content_for_analysis = (
        f"Job Title: {job_title}\n\n"
        f"Job Description:\n{extracted_job_description}"
    )

    result = analyze_resume(
        job_content_for_analysis,
        extracted_resume
    )

    # Store the report and job description, but never the original resume.
    stored_job_description = (
        f"Job Title: {job_title}\n\n"
        f"Job Description:\n{extracted_job_description}"
    )

    analysis = Analysis(
        candidate_name=candidate_name,
        job_description=stored_job_description,
        match_score=result.match_score,
        matching_skills=result.matching_skills,
        skill_gaps=result.skill_gaps,
        interview_questions=result.interview_questions
    )

    db.session.add(analysis)
    db.session.commit()

    return analysis
