
from flask import Blueprint, jsonify, request

from app.services.screening_service import create_screening
from app.services.gemini_service import GeminiServiceError
from app.extensions import db


screening_bp = Blueprint("screening", __name__)


@screening_bp.route("/analyze", methods=["POST"])
def analyze_candidate():
    try:
        if request.is_json:
            data = request.get_json(silent=True) or {}

            candidate_name = data.get("candidate_name")
            job_title = data.get("job_title")
            job_description = data.get("job_description")
            job_file = None

            resume_text = data.get("resume_text")
            uploaded_file = None

        else:
            candidate_name = request.form.get("candidate_name")
            job_title = request.form.get("job_title")
            job_description = request.form.get("job_description")
            job_file = request.files.get("job_file")

            resume_text = request.form.get("resume_text")
            uploaded_file = request.files.get("resume_file")

        # Validate job description input method.
        has_job_text = bool(job_description and job_description.strip())
        has_job_file = job_file is not None and bool(job_file.filename)

        if has_job_text and has_job_file:
            return jsonify({
                "status": "error",
                "message": "Provide the job description as text or a file, not both."
            }), 400

        if not has_job_text and not has_job_file:
            return jsonify({
                "status": "error",
                "message": "Please provide a job description or upload a job description file."
            }), 400

        # Validate resume input method.
        has_resume_text = bool(resume_text and resume_text.strip())
        has_resume_file = uploaded_file is not None and bool(uploaded_file.filename)

        if has_resume_text and has_resume_file:
            return jsonify({
                "status": "error",
                "message": "Provide the candidate resume as text or a file, not both."
            }), 400

        if not has_resume_text and not has_resume_file:
            return jsonify({
                "status": "error",
                "message": "Please provide the candidate resume or upload a resume file."
            }), 400

        analysis = create_screening(
            candidate_name=candidate_name,
            job_title=job_title,
            job_description=job_description if has_job_text else None,
            job_file=job_file if has_job_file else None,
            resume_text=resume_text if has_resume_text else None,
            uploaded_file=uploaded_file if has_resume_file else None
        )

        return jsonify({
            "status": "success",
            "message": "Resume screening completed successfully.",
            "data": {
                "id": analysis.id,
                "candidate_name": analysis.candidate_name,
                "match_score": analysis.match_score,
                "matching_skills": analysis.matching_skills,
                "skill_gaps": analysis.skill_gaps,
                "interview_questions": analysis.interview_questions,
                "created_at": analysis.created_at.isoformat()
            }
        }), 201

    except ValueError as error:
        return jsonify({
            "status": "error",
            "message": str(error)
        }), 400

    except GeminiServiceError:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "AI analysis is temporarily unavailable. Please try again."
        }), 502

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "An unexpected error occurred while screening the resume."
        }), 500
