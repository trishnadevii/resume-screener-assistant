
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Upload,
  UserRound,
  BriefcaseBusiness,
  Sparkles,
  X,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { analyzeResume } from '../services/api'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'docx']

export default function NewScreening() {
  const navigate = useNavigate()

  // Job details
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [jobFile, setJobFile] = useState(null)
  const [jobInputMethod, setJobInputMethod] = useState('text')

  // Candidate details
  const [candidateName, setCandidateName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeInputMethod, setResumeInputMethod] = useState('upload')

  // General state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const validateFile = (file) => {
    const extension = file.name.split('.').pop().toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Please upload a PDF or DOCX file.'
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'The file must be smaller than 5 MB.'
    }

    return ''
  }

  const handleJobFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      event.target.value = ''
      return
    }

    setError('')
    setJobFile(file)
    setJobDescription('')
  }

  const handleResumeFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      event.target.value = ''
      return
    }

    setError('')
    setResumeFile(file)
    setResumeText('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setResult(null)

    if (!jobTitle.trim()) {
      setError('Please enter the job title.')
      return
    }

    if (jobInputMethod === 'text' && !jobDescription.trim()) {
      setError('Please paste the job description.')
      return
    }

    if (jobInputMethod === 'upload' && !jobFile) {
      setError('Please upload the job description PDF or DOCX file.')
      return
    }

    if (!candidateName.trim()) {
      setError('Please enter the candidate name.')
      return
    }

    if (resumeInputMethod === 'text' && !resumeText.trim()) {
      setError('Please paste the candidate resume text.')
      return
    }

    if (resumeInputMethod === 'upload' && !resumeFile) {
      setError('Please upload the candidate resume PDF or DOCX file.')
      return
    }

    const formData = new FormData()

    formData.append('job_title', jobTitle.trim())
    formData.append('candidate_name', candidateName.trim())

    if (jobInputMethod === 'upload') {
      formData.append('job_file', jobFile)
    } else {
      formData.append('job_description', jobDescription.trim())
    }

    if (resumeInputMethod === 'upload') {
      formData.append('resume_file', resumeFile)
    } else {
      formData.append('resume_text', resumeText.trim())
    }

    try {
      setLoading(true)

      const response = await analyzeResume(formData)
      setResult(response.data)
    } catch (err) {
      setError(
        err.message ||
          'Unable to complete screening. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setJobTitle('')
    setJobDescription('')
    setJobFile(null)
    setJobInputMethod('text')

    setCandidateName('')
    setResumeText('')
    setResumeFile(null)
    setResumeInputMethod('upload')

    setResult(null)
    setError('')
  }

  const renderInputTabs = (method, setMethod) => (
    <div className="mb-4 flex rounded-xl bg-[#edf0e9] p-1">
      <button
        type="button"
        onClick={() => {
          setMethod('upload')
          setError('')
        }}
        className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          method === 'upload'
            ? 'bg-white text-[#52664c] shadow-sm'
            : 'text-[#858d7d] hover:text-[#52664c]'
        }`}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Upload size={16} />
          Upload file
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          setMethod('text')
          setError('')
        }}
        className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          method === 'text'
            ? 'bg-white text-[#52664c] shadow-sm'
            : 'text-[#858d7d] hover:text-[#52664c]'
        }`}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <FileText size={16} />
          Paste text
        </span>
      </button>
    </div>
  )

  const renderFileUpload = (file, inputId, onChange, onRemove) => (
    <>
      <label
        htmlFor={inputId}
        className="flex min-h-[210px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d7dfd1] bg-white px-5 py-8 text-center transition hover:border-[#a4b398] hover:bg-[#fcfdfb]"
      >
        {file ? (
          <>
            <div className="mb-3 rounded-full bg-[#e8eee3] p-3 text-[#708369]">
              <FileText size={25} />
            </div>

            <p className="max-w-full break-all text-sm font-semibold text-[#52664c]">
              {file.name}
            </p>

            <p className="mt-2 text-xs text-[#92958b]">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>

            <span className="mt-3 text-xs font-medium text-[#8b9b80]">
              Click to replace file
            </span>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-full bg-[#edf1e9] p-4 text-[#829477]">
              <Upload size={26} />
            </div>

            <p className="text-sm font-semibold text-[#52604f]">
              Choose a PDF or DOCX file
            </p>

            <p className="mt-2 text-xs text-[#92958b]">
              Click to browse and select a file.
            </p>

            <p className="mt-4 rounded-lg bg-[#f2f4ef] px-3 py-2 text-xs text-[#7e8976]">
              PDF / DOCX · Maximum 5 MB
            </p>
          </>
        )}
      </label>

      <input
        id={inputId}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onChange}
        className="hidden"
      />

      {file && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#a45c4d] hover:text-[#854738]"
        >
          <X size={14} />
          Remove selected file
        </button>
      )}
    </>
  )

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      {/* Page heading */}
      <div>
        <p className="mb-2 text-sm font-medium text-[#87947f]">
          WORKSPACE / NEW SCREENING
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#344238]">
          New Resume Screening
        </h1>

        <p className="mt-2 text-sm text-[#858b80]">
          Add the job requirements and candidate resume to generate an
          AI-assisted screening report.
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-xl border border-[#edc9bd] bg-[#fff4ef] p-4 text-sm text-[#a4513e]"
          role="alert"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {!result && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
            {/* LEFT: JOB DETAILS */}
            <section className="rounded-2xl border border-[#e9e5da] bg-[#fbfaf6] p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-[#e9eee3] p-3 text-[#708369]">
                  <BriefcaseBusiness size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#3f4c40]">
                    Job Details
                  </h2>
                  <p className="text-xs text-[#92958b]">
                    Add the position and its requirements
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium text-[#515b50]"
                >
                  Job title <span className="text-[#c87965]">*</span>
                </label>

                <input
                  id="jobTitle"
                  type="text"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="e.g. Junior AI/ML Engineer"
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-[#e5e2d8] bg-white px-4 py-3 text-sm text-[#424b40] outline-none transition placeholder:text-[#b0b1a8] focus:border-[#a4b398] focus:ring-2 focus:ring-[#e7ecdf]"
                />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-[#515b50]">
                  Job description <span className="text-[#c87965]">*</span>
                </label>
                <span className="text-xs text-[#92958b]">PDF or DOCX</span>
              </div>

              {renderInputTabs(jobInputMethod, setJobInputMethod)}

              {jobInputMethod === 'upload' ? (
                renderFileUpload(
                  jobFile,
                  'jobFile',
                  handleJobFileChange,
                  () => setJobFile(null)
                )
              ) : (
                <>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    placeholder={`Paste the complete job description here...

Include:
• Role responsibilities
• Required technical skills
• Experience requirements
• Education and qualifications
• Preferred skills`}
                    rows={12}
                    className="w-full resize-y rounded-xl border border-[#e5e2d8] bg-white px-4 py-3 text-sm leading-6 text-[#424b40] outline-none transition placeholder:text-[#b0b1a8] focus:border-[#a4b398] focus:ring-2 focus:ring-[#e7ecdf]"
                  />

                  <p className="mt-2 text-xs text-[#999b91]">
                    Include the role responsibilities, required skills and
                    qualifications for a useful comparison.
                  </p>
                </>
              )}
            </section>

            {/* RIGHT: CANDIDATE DETAILS */}
            <section className="rounded-2xl border border-[#e2e9df] bg-[#f8faf6] p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-[#e8eee3] p-3 text-[#708369]">
                  <UserRound size={21} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#3f4c40]">
                    Candidate Details
                  </h2>
                  <p className="text-xs text-[#92958b]">
                    Add candidate information and resume
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="candidateName"
                  className="mb-2 block text-sm font-medium text-[#515b50]"
                >
                  Candidate name <span className="text-[#c87965]">*</span>
                </label>

                <input
                  id="candidateName"
                  type="text"
                  value={candidateName}
                  onChange={(event) => setCandidateName(event.target.value)}
                  placeholder="Enter candidate's full name"
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-[#e5e2d8] bg-white px-4 py-3 text-sm text-[#424b40] outline-none transition placeholder:text-[#b0b1a8] focus:border-[#a4b398] focus:ring-2 focus:ring-[#e7ecdf]"
                />
              </div>

              <div className="mb-3 flex items-center justify-between">
                <label className="block text-sm font-medium text-[#515b50]">
                  Candidate resume <span className="text-[#c87965]">*</span>
                </label>
                <span className="text-xs text-[#92958b]">PDF or DOCX</span>
              </div>

              {renderInputTabs(resumeInputMethod, setResumeInputMethod)}

              {resumeInputMethod === 'upload' ? (
                renderFileUpload(
                  resumeFile,
                  'resumeFile',
                  handleResumeFileChange,
                  () => setResumeFile(null)
                )
              ) : (
                <>
                  <textarea
                    value={resumeText}
                    onChange={(event) => setResumeText(event.target.value)}
                    placeholder="Paste the candidate's resume text here..."
                    rows={12}
                    className="w-full resize-y rounded-xl border border-[#e5e2d8] bg-white px-4 py-3 text-sm leading-6 text-[#424b40] outline-none transition placeholder:text-[#b0b1a8] focus:border-[#a4b398] focus:ring-2 focus:ring-[#e7ecdf]"
                  />

                  <p className="mt-2 text-xs text-[#92958b]">
                    Include the candidate's skills, experience, education
                    and projects.
                  </p>
                </>
              )}

              <div className="mt-5 flex items-start gap-2 rounded-xl bg-[#edf2e9] p-3">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-[#7c9271]"
                />
                <p className="text-xs leading-5 text-[#71806b]">
                  Resume content is processed for analysis and is not saved
                  in the screening history. Only the screening report is
                  stored.
                </p>
              </div>
            </section>
          </div>

          {/* FORM ACTIONS */}
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="rounded-xl border border-[#e3e0d6] bg-white px-5 py-3 text-sm font-medium text-[#72796e] transition hover:bg-[#f7f6f1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear form
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#829477] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#718568] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Analysing resume...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  Analyse Resume
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* SCREENING RESULT */}
      {result && (
        <section className="rounded-2xl border border-[#e3e9df] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-[#718b68]">
                <CheckCircle2 size={17} />
                Screening completed
              </div>

              <h2 className="text-2xl font-semibold text-[#3f4c40]">
                Screening Report
              </h2>

              <p className="mt-1 text-sm text-[#92958b]">
                Candidate: {result.candidate_name}
              </p>
            </div>

            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-2xl bg-[#edf2e9]">
              <span className="text-3xl font-bold text-[#617858]">
                {result.match_score}
              </span>
              <span className="text-xs text-[#829477]">Match score</span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-[#f5f7f2] p-5">
              <h3 className="mb-3 font-semibold text-[#4c5c47]">
                Matching Skills
              </h3>

              <ul className="space-y-2">
                {result.matching_skills?.map((skill, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[#626e5d]"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#829477]"
                    />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-[#fbf3ef] p-5">
              <h3 className="mb-3 font-semibold text-[#8c6255]">
                Skill Gaps
              </h3>

              <ul className="space-y-2">
                {result.skill_gaps?.map((gap, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-[#806c63]"
                  >
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-[#c28c79]"
                    />
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#f7f6f0] p-5">
            <h3 className="mb-4 font-semibold text-[#4c5c47]">
              Suggested Interview Questions
            </h3>

            <ol className="list-inside list-decimal space-y-3">
              {result.interview_questions?.map((question, index) => (
                <li
                  key={index}
                  className="text-sm leading-6 text-[#626e5d]"
                >
                  {question}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate(`/history/${result.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#829477] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#718568]"
            >
              View saved report
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#e3e0d6] bg-white px-5 py-3 text-sm font-medium text-[#72796e] transition hover:bg-[#f7f6f1]"
            >
              Start another screening
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
