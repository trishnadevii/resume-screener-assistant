# Product Requirements Document (PRD)

## Resume Screener Assistant

**Organization:** Synthweb\
**Product type:** Internal HR web application\
**Status:** Draft based on the Synthweb AI Product Engineer assessment
and approved project decisions\
**Version:** 1.0\
**Date:** 15 November 2026

------------------------------------------------------------------------

## 1. Product Overview

Resume Screener Assistant is a small internal web application for the
Synthweb HR team. It helps HR users compare a candidate's resume with a
job description and review a structured, AI-generated match report.

The application accepts a job description and a candidate resume as
pasted text or an uploaded document. It uses a Large Language Model
(LLM) to produce a match score, matching skills, skill gaps, and
suggested interview questions. Each successful report is stored in a
database so HR can review previous screenings.

The tool supports HR review; it does not make hiring decisions
autonomously.

## 2. Problem Statement

HR needs a consistent and efficient way to review how closely a
candidate's stated experience and skills align with a job description.
Manually comparing documents can take time and may lead to inconsistent
notes. This product provides a structured comparison and preserves
screening reports for later reference.

## 3. Goals and Success Criteria

### Goals

-   Provide a simple input workflow for a job description and resume.
-   Generate a structured candidate-to-role match report using an LLM.
-   Validate AI output before showing it to the user.
-   Store completed screening reports in SQLite.
-   Allow HR users to search, filter, view, and delete saved reports.
-   Handle common input, document-processing, and AI-service failures
    gracefully.
-   Protect API credentials and minimize retention of candidate data.

### Success criteria

An HR user can enter a candidate name and job description, paste resume
text or upload a supported PDF/DOCX, receive a validated report, view
its score/skills/gaps/questions, find it in History, open it, and delete
it after confirmation. Failures produce clear messages rather than
crashing the application.

## 4. Target Users

**Primary user:** Synthweb HR team member screening candidates against
open roles.

**User needs:** enter candidate and job information quickly; understand
evidence of role fit; identify areas for follow-up; prepare interview
questions; and revisit prior reports.

## 5. Scope

### In scope for MVP

-   Dashboard with screening summary and recent activity.
-   New Screening page.
-   Required candidate name and job description.
-   Resume pasted as text or uploaded as PDF/DOCX.
-   AI-generated match score from 0 to 100.
-   Up to five matching skills.
-   Up to three skill gaps.
-   Exactly three suggested interview questions.
-   Structured JSON validated before display.
-   Persistence of reports in SQLite.
-   History page with candidate-name search and score-range filtering.
-   Pagination of 10 records per page.
-   Report detail view.
-   Delete action with confirmation.
-   Basic API error handling and input validation.
-   Backend-only Gemini API key configuration.
-   Resume content processed in memory and not retained after analysis.
-   README and AI usage documentation.

### Out of scope for MVP

-   User accounts, authentication, and role-based access control.
-   Multi-user collaboration and approval workflows.
-   OCR for scanned/image-only resumes.
-   Bulk resume screening.
-   Email notifications.
-   External ATS integrations.
-   Automated hiring, rejection, or ranking decisions.
-   Advanced analytics and reporting.
-   Production deployment (optional assessment bonus).

## 6. User Workflow

1.  HR opens the Dashboard and navigates to New Screening.
2.  HR enters the candidate's name and job description.
3.  HR pastes resume text or uploads a PDF/DOCX file.
4.  The backend validates the request and extracts text from an uploaded
    document when needed.
5.  The backend sends the job description and resume content to Gemini
    for analysis.
6.  The backend validates the structured response.
7.  If valid, the report is saved in SQLite and returned to the
    frontend.
8.  HR reviews the report and can later find it in History, open it, or
    delete it after confirmation.

## 7. Functional Requirements

### FR-01: Dashboard

The Dashboard shall display a summary of saved screenings, recent
screening activity, and navigation to New Screening and History.

### FR-02: Candidate information

-   Candidate name is required because it identifies reports in History.
-   If the resume does not contain a candidate name, HR enters it
    manually.
-   Candidate name is limited to 150 characters.

### FR-03: Job description

-   The job description is required.
-   Empty or whitespace-only input is rejected.
-   The backend validates input length and handles very long input
    safely.

### FR-04: Resume input and extraction

-   Accept pasted text, PDF, or DOCX.
-   Require resume input.
-   Validate supported file types and reasonable file-size limits.
-   Extract PDF text using PyMuPDF.
-   Extract DOCX text using python-docx.
-   Handle corrupt, encrypted, empty, and scanned/image-only PDFs with a
    clear error.
-   OCR is not included in the MVP.
-   Process resume content in memory and discard it after processing.

### FR-05: AI analysis

The system shall use the Google Gemini API to compare the job
description and resume and return: - Match score (integer from 0 to
100). - Up to five matching skills. - Up to three skill gaps. - Exactly
three suggested interview questions.

The AI shall base findings on evidence in the supplied documents, avoid
inventing skills or experience, treat resume content as untrusted data
rather than model instructions, and avoid scoring protected
characteristics. AI output is decision support only; HR remains
responsible for decisions.

### FR-06: Match score

The score shall be an integer from 0 to 100 inclusive. The project
design reserves weights of 40%, 30%, 15%, and 15%.

**Open specification item:** The four scoring dimensions and their
definitions must be explicitly agreed before implementing the scoring
calculation. The assessment brief specifies a 0--100 score but does not
define these weighted dimensions.

### FR-07: Structured output validation

-   Require structured JSON from the AI service.
-   Validate the response using Pydantic before display or persistence.
-   Do not display or save malformed output as a successful report.
-   Permit one controlled retry for malformed output.
-   If validation still fails, return a clear error message.

### FR-08: Report display

Display candidate name, match score, matching skills, skill gaps,
exactly three interview questions, and screening date/time. Present the
report in a readable format that distinguishes strengths from gaps.

### FR-09: Save screening report

After successful validation, save the report in SQLite. Store candidate
name, job description, score, matching skills, skill gaps, interview
questions, and creation timestamp. Do not store the original resume file
or extracted resume text.

### FR-10: History

Provide a History page listing saved reports. Support candidate-name
search, score-range filtering, opening an individual report, and
pagination with a default page size of 10.

### FR-11: Delete report

Allow HR to delete a saved report after a confirmation step. Communicate
success or failure.

### FR-12: Reliability and errors

Handle empty/invalid input, unsupported or oversized files,
corrupt/encrypted documents, PDFs with no extractable text, Gemini API
errors/timeouts, malformed AI output, and very long input. Show clear
actionable errors. Never include API keys or sensitive configuration
values in logs or error responses.

## 8. Non-Functional Requirements

### Privacy and data minimization

-   Store the Gemini API key in backend environment configuration; never
    expose it to the browser.
-   Do not persist the original resume file or extracted resume text.
-   Store only the screening report fields defined in this PRD.
-   Do not write candidate resume content to application logs.
-   Explain candidate-data handling in the README.

### Security

-   Validate user input on the backend.
-   Restrict uploads to supported formats and apply
    file-size/input-length limits.
-   Keep secrets out of source control.
-   Treat resume text as untrusted input to reduce prompt-injection
    risk.
-   Do not allow instructions embedded in a resume to override the
    analysis task.

### Maintainability and usability

-   Separate API routes, business logic, database models, and validation
    schemas.
-   Keep Gemini integration in a dedicated service.
-   Use meaningful Git commits and document setup steps.
-   Provide clear labels, validation feedback, loading feedback,
    readable reports, and empty states.

## 9. Data Requirements

**Database:** SQLite\
**ORM:** SQLAlchemy

  Field                 Type          Rules
  --------------------- ------------- -----------------
  id                    Integer       Primary key
  candidate_name        String(150)   Required
  job_description       Text          Required
  match_score           Integer       0--100
  matching_skills       JSON          Up to 5 items
  skill_gaps            JSON          Up to 3 items
  interview_questions   JSON          Exactly 3 items
  created_at            DateTime      Required

No resume-text or resume-file column shall be created.

## 10. API Requirements

Base path: `/api`

  -----------------------------------------------------------------------
  Method                  Endpoint                Purpose
  ----------------------- ----------------------- -----------------------
  GET                     `/health`               Check API availability

  GET                     `/dashboard`            Return dashboard
                                                  summary and recent
                                                  activity

  POST                    `/analyze`              Validate input, analyze
                                                  resume, save report

  GET                     `/analyses`             List reports with
                                                  search, score filters,
                                                  and pagination

  GET                     `/analyses/:id`         Retrieve one saved
                                                  report

  DELETE                  `/analyses/:id`         Delete one saved report
  -----------------------------------------------------------------------

The API shall return consistent JSON responses and appropriate HTTP
status codes.

## 11. Proposed Technology Stack

  Layer                       Technology
  --------------------------- ------------------------------------
  Frontend                    React.js with Vite
  Styling                     Tailwind CSS
  Frontend routing            React Router
  Frontend API calls          Native Fetch API
  Backend                     Python Flask
  AI provider                 Google Gemini API (`google-genai`)
  Database                    SQLite
  ORM                         SQLAlchemy
  Data validation             Pydantic
  PDF extraction              PyMuPDF
  DOCX extraction             python-docx
  CORS                        Flask-Cors
  Environment configuration   python-dotenv

## 12. High-Level Architecture

1.  **React frontend:** collects input, displays loading/error states,
    and renders reports and history.
2.  **Flask API:** receives requests, validates input, and coordinates
    application services.
3.  **Document processing service:** extracts text from supported
    uploaded formats.
4.  **Gemini service:** sends the analysis request and returns
    structured model output; it does not write to the database.
5.  **Screening service:** coordinates extraction, AI analysis, output
    validation, and persistence.
6.  **SQLAlchemy and SQLite:** store validated screening reports only.

## 13. Acceptance Criteria

-   [ ] HR can submit a job description and pasted resume text.
-   [ ] HR can submit a PDF resume with extractable text.
-   [ ] HR can submit a DOCX resume.
-   [ ] Candidate name is required.
-   [ ] Successful analysis returns a score from 0 to 100.
-   [ ] The report contains no more than five matching skills.
-   [ ] The report contains no more than three skill gaps.
-   [ ] The report contains exactly three interview questions.
-   [ ] AI output is validated before display or persistence.
-   [ ] A successful report is persisted in SQLite.
-   [ ] Original resume text and files are not persisted.
-   [ ] History supports candidate-name search and score-range
    filtering.
-   [ ] History paginates at 10 records per page.
-   [ ] A saved report can be opened and deleted after confirmation.
-   [ ] API failures and malformed AI output produce clear errors.
-   [ ] API keys are not exposed in frontend code or logs.
-   [ ] README explains setup, architecture, and design decisions.
-   [ ] `AI_USAGE.md` records tools, three key prompts, and two examples
    of AI errors and corrections.

## 14. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  AI returns invalid JSON             Validate with Pydantic and allow
                                      one controlled retry

  AI invents candidate skills         Require evidence-based analysis and
                                      review output

  Resume contains prompt injection    Treat resume as untrusted data and
                                      isolate it from system instructions

  PDF is scanned or has no text layer Detect missing extracted text and
                                      show a clear unsupported-input
                                      message

  Gemini API is unavailable           Handle API errors/timeouts and show
                                      a retry-friendly message

  Candidate data is retained          Store report fields only; discard
  unnecessarily                       resume content after processing

  Very long documents exceed model    Apply input limits and a documented
  limits                              truncation strategy
  -----------------------------------------------------------------------

## 15. Assumptions and Open Decisions

### Approved project decisions

-   The application is an internal HR decision-support tool.
-   Save the screening report, not the original resume or extracted
    resume text.
-   Return up to five matching skills and up to three skill gaps.
-   Return exactly three interview questions.
-   History page size is 10 records.
-   Delete requires confirmation.
-   HR must enter the candidate name if it is unavailable from the
    resume.
-   The selected stack is React/Vite, Flask, Gemini, SQLite, SQLAlchemy,
    Pydantic, PyMuPDF, and python-docx.

### Open decision before scoring implementation

The 40/30/15/15 score weights are reserved, but the four criteria
represented by those weights still need explicit definitions and
approval. Do not implement or describe them as finalized until agreed.

## 16. Assessment Deliverables

The submission shall include: - Source code in a Git repository with
meaningful commits. - README with setup instructions, architecture
overview, and design decisions. - A 2--3 minute screen recording or live
demo link; screenshots are an acceptable alternative. - `AI_USAGE.md`
with tools used, three key prompts, and two examples where AI output was
wrong and how it was corrected.

Optional assessment enhancements include basic automated tests,
deployment, and prompt-injection protection.

## 17. Reference

This PRD is based on the supplied **Synthweb --- AI Product Engineer
Candidate Assessment Task** and the implementation decisions approved
during project planning. Requirements not specified in the assessment
are identified as project decisions, assumptions, or open items rather
than being presented as assessment requirements.
