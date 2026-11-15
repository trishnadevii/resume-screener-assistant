
from pydantic import BaseModel, ConfigDict, Field


class AnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    match_score: int = Field(
        ge=0,
        le=100,
        description="Overall job-resume match score from 0 to 100."
    )

    matching_skills: list[str] = Field(
        max_length=5,
        description="Up to five skills supported by resume evidence."
    )

    skill_gaps: list[str] = Field(
        max_length=3,
        description="Up to three important job requirements not evidenced in the resume."
    )

    interview_questions: list[str] = Field(
        min_length=3,
        max_length=3,
        description="Exactly three role-specific interview questions."
    )
