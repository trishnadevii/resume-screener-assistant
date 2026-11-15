
from flask import Blueprint, jsonify, request
from sqlalchemy import func

from app.extensions import db
from app.models.analysis import Analysis

history_bp = Blueprint("history", __name__)


def extract_job_title(job_description):
    """Extract the job title stored at the beginning of the job description."""
    if not job_description:
        return "Untitled Position"

    first_line = job_description.splitlines()[0].strip()

    if first_line.startswith("Job Title:"):
        title = first_line.replace("Job Title:", "", 1).strip()
        return title if title else "Untitled Position"

    # Supports older screening records without a stored job title.
    return "Untitled Position"


def serialize_analysis(analysis):
    return {
        "id": analysis.id,
        "candidate_name": analysis.candidate_name,
        "job_title": extract_job_title(analysis.job_description),
        "match_score": analysis.match_score,
        "matching_skills": analysis.matching_skills,
        "skill_gaps": analysis.skill_gaps,
        "interview_questions": analysis.interview_questions,
        "created_at": analysis.created_at.isoformat()
    }


@history_bp.route("/analyses", methods=["GET"])
def get_analyses():
    try:
        page = request.args.get("page", 1, type=int)
        min_score = request.args.get("min_score", type=int)
        max_score = request.args.get("max_score", type=int)
        candidate_name = request.args.get("candidate_name", "").strip()

        if page < 1:
            return jsonify({
                "status": "error",
                "message": "Page must be 1 or greater."
            }), 400

        if min_score is not None and not 0 <= min_score <= 100:
            return jsonify({
                "status": "error",
                "message": "Minimum score must be between 0 and 100."
            }), 400

        if max_score is not None and not 0 <= max_score <= 100:
            return jsonify({
                "status": "error",
                "message": "Maximum score must be between 0 and 100."
            }), 400

        if min_score is not None and max_score is not None:
            if min_score > max_score:
                return jsonify({
                    "status": "error",
                    "message": "Minimum score cannot exceed maximum score."
                }), 400

        query = Analysis.query

        if candidate_name:
            query = query.filter(
                Analysis.candidate_name.ilike(f"%{candidate_name}%")
            )

        if min_score is not None:
            query = query.filter(
                Analysis.match_score >= min_score
            )

        if max_score is not None:
            query = query.filter(
                Analysis.match_score <= max_score
            )

        pagination = query.order_by(
            Analysis.created_at.desc()
        ).paginate(
            page=page,
            per_page=10,
            error_out=False
        )

        return jsonify({
            "status": "success",
            "data": [
                serialize_analysis(item)
                for item in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total_records": pagination.total,
                "total_pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_previous": pagination.has_prev
            }
        }), 200

    except Exception:
        return jsonify({
            "status": "error",
            "message": "Unable to retrieve screening history."
        }), 500


@history_bp.route("/analyses/<int:analysis_id>", methods=["GET"])
def get_analysis(analysis_id):
    analysis = db.session.get(Analysis, analysis_id)

    if analysis is None:
        return jsonify({
            "status": "error",
            "message": "Screening record not found."
        }), 404

    return jsonify({
        "status": "success",
        "data": {
            **serialize_analysis(analysis),
            "job_description": analysis.job_description
        }
    }), 200


@history_bp.route("/analyses/<int:analysis_id>", methods=["DELETE"])
def delete_analysis(analysis_id):
    analysis = db.session.get(Analysis, analysis_id)

    if analysis is None:
        return jsonify({
            "status": "error",
            "message": "Screening record not found."
        }), 404

    try:
        db.session.delete(analysis)
        db.session.commit()

        return jsonify({
            "status": "success",
            "message": "Screening record deleted successfully."
        }), 200

    except Exception:
        db.session.rollback()
        return jsonify({
            "status": "error",
            "message": "Unable to delete screening record."
        }), 500


@history_bp.route("/dashboard", methods=["GET"])
def get_dashboard():
    try:
        total_screenings = db.session.query(
            func.count(Analysis.id)
        ).scalar() or 0

        average_score = db.session.query(
            func.avg(Analysis.match_score)
        ).scalar()

        recent_records = Analysis.query.order_by(
            Analysis.created_at.desc()
        ).limit(5).all()

        return jsonify({
            "status": "success",
            "data": {
                "total_screenings": total_screenings,
                "average_score": round(float(average_score), 1)
                if average_score is not None else 0,
                "recent_activity": [
                    serialize_analysis(item)
                    for item in recent_records
                ]
            }
        }), 200

    except Exception:
        return jsonify({
            "status": "error",
            "message": "Unable to retrieve dashboard data."
        }), 500
