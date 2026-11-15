
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  AlertCircle,
} from 'lucide-react'
import { deleteAnalysis, getAnalyses } from '../services/api'

export default function History() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    pages: 1,
    total: 0,
  })

  const loadHistory = async (pageNumber = page) => {
    try {
      setLoading(true)
      setError('')

      const response = await getAnalyses({
        page: pageNumber,
        candidate_name: candidateName.trim(),
        min_score: minScore,
        max_score: maxScore,
      })

      setAnalyses(response.data || [])
      setPagination(response.pagination || { pages: 1, total: 0 })
    } catch (err) {
      setError(err.message || 'Unable to load screening history.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory(page)
    // Initial load. Filters are applied using the Search button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSearch = (event) => {
    event.preventDefault()
    setPage(1)
    loadHistory(1)
  }

  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the screening report for ${name}?`
    )

    if (!confirmed) return

    try {
      await deleteAnalysis(id)
      await loadHistory(page)
    } catch (err) {
      setError(err.message || 'Unable to delete this report.')
    }
  }

  const clearFilters = () => {
    setCandidateName('')
    setMinScore('')
    setMaxScore('')
    setPage(1)

    // Load all records after clearing the filters.
    setTimeout(() => {
      getAnalyses({ page: 1 })
        .then((response) => {
          setAnalyses(response.data || [])
          setPagination(response.pagination || { pages: 1, total: 0 })
          setError('')
        })
        .catch((err) => setError(err.message))
    }, 0)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      <div>
        <p className="mb-2 text-sm font-medium text-[#87947f]">
          WORKSPACE / HISTORY
        </p>

        <h1 className="text-3xl font-semibold tracking-tight text-[#344238]">
          Screening History
        </h1>

        <p className="mt-2 text-sm text-[#858b80]">
          Browse, search and manage previously completed resume screenings.
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearch}
        className="rounded-2xl border border-[#e9e5da] bg-[#fbfaf6] p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2 text-[#52604f]">
          <SlidersHorizontal size={18} />
          <h2 className="font-semibold">Find screening reports</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#626e5d]">
              Candidate name
            </label>

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9f92]"
              />

              <input
                value={candidateName}
                onChange={(event) => setCandidateName(event.target.value)}
                placeholder="Search candidate..."
                className="w-full rounded-xl border border-[#e5e2d8] bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#a4b398]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#626e5d]">
              Minimum score
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(event) => setMinScore(event.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-[#e5e2d8] bg-white px-3 py-3 text-sm outline-none focus:border-[#a4b398]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#626e5d]">
              Maximum score
            </label>

            <input
              type="number"
              min="0"
              max="100"
              value={maxScore}
              onChange={(event) => setMaxScore(event.target.value)}
              placeholder="100"
              className="w-full rounded-xl border border-[#e5e2d8] bg-white px-3 py-3 text-sm outline-none focus:border-[#a4b398]"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-[#829477] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#718568]"
          >
            Apply filters
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-xl border border-[#e3e0d6] bg-white px-5 py-2.5 text-sm font-medium text-[#72796e] hover:bg-[#f7f6f1]"
          >
            Clear filters
          </button>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-[#edc9bd] bg-[#fff4ef] p-4 text-sm text-[#a4513e]">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Results */}
      <section className="overflow-hidden rounded-2xl border border-[#e9e5da] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eeeae1] px-5 py-4">
          <div>
            <h2 className="font-semibold text-[#465244]">
              Previous screenings
            </h2>

            <p className="mt-1 text-xs text-[#92958b]">
              {pagination.total} report(s) found
            </p>
          </div>

          <span className="rounded-lg bg-[#edf2e9] px-3 py-1.5 text-xs font-medium text-[#718568]">
            10 reports per page
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[#92958b]">
            Loading screening history...
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={35} className="mx-auto mb-3 text-[#b5bdad]" />

            <h3 className="font-medium text-[#52604f]">
              No screening reports found
            </h3>

            <p className="mt-2 text-sm text-[#92958b]">
              Try changing your filters or create a new screening.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#f8f7f2] text-xs uppercase tracking-wide text-[#858b80]">
                  <tr>
                    <th className="px-5 py-4 font-medium">Candidate</th>
                    <th className="px-5 py-4 font-medium">Job Title</th>
                    <th className="px-5 py-4 font-medium">Match score</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#f0eee7]">
                  {analyses.map((analysis) => (
                    <tr key={analysis.id} className="hover:bg-[#fcfbf8]">
                      <td className="px-5 py-4">
                        <div className="font-medium text-[#465244]">
                          {analysis.candidate_name}
                        </div>

                        <div className="mt-1 text-xs text-[#a0a398]">
                          Screening #{analysis.id}
                        </div>
                      </td>

                      {/* Newly added job title */}
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-[#718568]">
                          {analysis.job_title || 'Untitled Position'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-[#edf2e9] px-3 py-1.5 text-sm font-semibold text-[#718568]">
                          {analysis.match_score}%
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-[#858b80]">
                        {analysis.created_at
                          ? new Date(analysis.created_at).toLocaleDateString()
                          : '—'}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/history/${analysis.id}`}
                            className="text-sm font-medium text-[#718568] hover:text-[#4e6546]"
                          >
                            View report
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                analysis.id,
                                analysis.candidate_name
                              )
                            }
                            title="Delete report"
                            className="rounded-lg p-2 text-[#b17a6b] transition hover:bg-[#fff0eb]"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-[#eeeae1] px-5 py-4">
              <p className="text-xs text-[#92958b]">
                Page {page} of {pagination.pages || 1}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e5e2d8] px-3 py-2 text-sm text-[#72796e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= (pagination.pages || 1) || loading}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#e5e2d8] px-3 py-2 text-sm text-[#72796e] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
