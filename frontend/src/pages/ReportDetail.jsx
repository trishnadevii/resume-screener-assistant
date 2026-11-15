
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  LoaderCircle,
} from 'lucide-react'
import { deleteAnalysis, getAnalysis } from '../services/api'

export default function ReportDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await getAnalysis(id)
        setAnalysis(response.data)
      } catch (err) {
        setError(err.message || 'Unable to load this screening report.')
      } finally {
        setLoading(false)
      }
    }

    loadReport()
  }, [id])

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the screening report for ${analysis.candidate_name}?`
    )

    if (!confirmed) return

    try {
      await deleteAnalysis(id)
      navigate('/history')
    } catch (err) {
      setError(err.message || 'Unable to delete this report.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#858b80]">
        <LoaderCircle size={20} className="animate-spin" />
        Loading screening report...
      </div>
    )
  }

  if (error && !analysis) {
    return (
      <div className="space-y-5">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 text-sm text-[#718568] hover:text-[#4e6546]"
        >
          <ArrowLeft size={17} />
          Back to History
        </Link>

        <div className="rounded-xl border border-[#edc9bd] bg-[#fff4ef] p-5 text-sm text-[#a4513e]">
          {error}
        </div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-10">
      <Link
        to="/history"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#718568] hover:text-[#4e6546]"
      >
        <ArrowLeft size={17} />
        Back to History
      </Link>

      {error && (
        <div className="rounded-xl border border-[#edc9bd] bg-[#fff4ef] p-4 text-sm text-[#a4513e]">
          {error}
        </div>
      )}

      {/* Report heading */}
      <section className="rounded-2xl border border-[#e9e5da] bg-[#fbfaf6] p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-medium text-[#87947f]">
              SCREENING REPORT #{analysis.id}
            </p>

            <h1 className="text-3xl font-semibold text-[#344238]">
              {analysis.candidate_name}
            </h1>

            <p className="mt-2 text-sm text-[#92958b]">
              Created on{' '}
              {analysis.created_at
                ? new Date(analysis.created_at).toLocaleString()
                : 'Date unavailable'}
            </p>
          </div>

          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-2xl bg-[#eaf0e5]">
            <span className="text-4xl font-bold text-[#617858]">
              {analysis.match_score}
            </span>
            <span className="text-xs text-[#829477]">Match score</span>
          </div>
        </div>
      </section>

      {/* Matching skills and gaps */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[#e3e9df] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-[#829477]" />
            <h2 className="text-lg font-semibold text-[#465244]">
              Matching Skills
            </h2>
          </div>

          {analysis.matching_skills?.length ? (
            <ul className="space-y-3">
              {analysis.matching_skills.map((skill, index) => (
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
          ) : (
            <p className="text-sm text-[#92958b]">
              No matching skills recorded.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-[#f0e2dc] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-[#c28c79]" />
            <h2 className="text-lg font-semibold text-[#8c6255]">
              Skill Gaps
            </h2>
          </div>

          {analysis.skill_gaps?.length ? (
            <ul className="space-y-3">
              {analysis.skill_gaps.map((gap, index) => (
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
          ) : (
            <p className="text-sm text-[#92958b]">
              No skill gaps recorded.
            </p>
          )}
        </section>
      </div>

      {/* Interview questions */}
      <section className="rounded-2xl border border-[#e9e5da] bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <FileText size={20} className="text-[#829477]" />
          <h2 className="text-lg font-semibold text-[#465244]">
            Suggested Interview Questions
          </h2>
        </div>

        {analysis.interview_questions?.length ? (
          <ol className="list-inside list-decimal space-y-4">
            {analysis.interview_questions.map((question, index) => (
              <li
                key={index}
                className="text-sm leading-6 text-[#626e5d]"
              >
                {question}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[#92958b]">
            No interview questions recorded.
          </p>
        )}
      </section>

      {/* Original job description */}
      {analysis.job_description && (
        <section className="rounded-2xl border border-[#e9e5da] bg-[#fbfaf6] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[#465244]">
            Job Description Used
          </h2>

          <p className="whitespace-pre-wrap text-sm leading-7 text-[#687164]">
            {analysis.job_description}
          </p>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
        <Link
          to="/history"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e3e0d6] bg-white px-5 py-3 text-sm font-medium text-[#72796e] hover:bg-[#f7f6f1]"
        >
          <ArrowLeft size={17} />
          Back to History
        </Link>

        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#a96f60] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#945b4d]"
        >
          <Trash2 size={17} />
          Delete Report
        </button>
      </div>
    </div>
  )
}
