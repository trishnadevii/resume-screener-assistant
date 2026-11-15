
from datetime import datetime

from app.extensions import db


class Analysis(db.Model):
    __tablename__ = "analyses"

    id = db.Column(db.Integer, primary_key=True)

    candidate_name = db.Column(
        db.String(150),
        nullable=False
    )

    job_description = db.Column(
        db.Text,
        nullable=False
    )

    match_score = db.Column(
        db.Integer,
        nullable=False
    )

    matching_skills = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    skill_gaps = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    interview_questions = db.Column(
        db.JSON,
        nullable=False,
        default=list
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )
