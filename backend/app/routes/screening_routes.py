
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
            job_description = data.get("job_description")
            resume_text = data.get("resume_text")
            uploaded_file = None

        else:
            candidate_name = request.form.get("candidate_name")
            job_description = request.form.get("job_description")
            resume_text = request.form.get("resume_text")

            uploaded_file = request.files.get("resume_file")

        if resume_text and uploaded_file:
            return jsonify({
                "status": "error",
                "message": "Provide pasted resume text or a file, not both."
            }), 400

        analysis = create_screening(
            candidate_name=candidate_name,
            job_description=job_description,
            resume_text=resume_text,
            uploaded_file=uploaded_file
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
