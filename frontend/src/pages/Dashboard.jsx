
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ChartNoAxesColumnIncreasing,
  FilePlus2,
  ArrowUpRight
} from 'lucide-react'
import { getDashboard } from '../services/api'

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#EAE8DF] bg-white p-5 shadow-sm shadow-[#4A493D]/[0.03]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#85877D]">{label}</p>
        <div className="rounded-xl bg-[#F0F3EC] p-2.5 text-[#658068]">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight text-[#39463B]">
        {value}
      </p>
      <p className="mt-1 text-xs text-[#999A90]">{note}</p>
    </div>
  )
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then((response) => setDashboard(response.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const recentActivity = dashboard?.recent_activity || []

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-[#8B8D82]">Your workspace</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-[#39463B]">
            Good to see you.
          </h2>
          <p className="mt-2 text-sm text-[#85877D]">
            Here's an overview of your candidate screenings.
          </p>
        </div>

        <Link
          to="/new-screening"
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#66836A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#56735A]"
        >
          <FilePlus2 size={17} />
          Start a screening
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-[#EBD6CC] bg-[#FFF5F0] p-4 text-sm text-[#A45F48]">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-10 text-sm text-[#85877D]">
          Loading your dashboard...
        </p>
      ) : (
        <>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              label="Total screenings"
              value={dashboard?.total_screenings ?? 0}
              note="Candidates reviewed so far"
              icon={Users}
            />

            <StatCard
              label="Average match score"
              value={`${dashboard?.average_score ?? 0}%`}
              note="Across all completed screenings"
              icon={ChartNoAxesColumnIncreasing}
            />

            <div className="flex flex-col justify-between rounded-2xl border border-[#E7E9DE] bg-[#EEF2E9] p-5">
              <p className="text-sm font-medium text-[#526B55]">
                Ready for another review?
              </p>
              <p className="mt-2 text-sm leading-6 text-[#788476]">
                Compare a candidate's experience with your role requirements.
              </p>
              <Link
                to="/new-screening"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#55735A]"
              >
                New screening <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>

          <section className="mt-9 rounded-2xl border border-[#EAE8DF] bg-white p-5 shadow-sm shadow-[#4A493D]/[0.03] sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-[#39463B]">
                  Recent activity
                </h3>
                <p className="mt-1 text-sm text-[#929389]">
                  Your latest candidate reviews
                </p>
              </div>
              <Link
                to="/history"
                className="text-sm font-medium text-[#66836A] hover:underline"
              >
                View history
              </Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F0F3EC] text-[#66836A]">
                  <FilePlus2 size={21} />
                </div>
                <p className="mt-4 text-sm font-medium text-[#555E53]">
                  No screenings yet
                </p>
                <p className="mt-1 text-sm text-[#999A90]">
                  Your completed screenings will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-[#F0EFE9]">
                {recentActivity.map((item) => (
                  <Link
                    key={item.id}
                    to={`/history/${item.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 py-4 transition hover:bg-[#FCFBF7]"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#485448]">
                        {item.candidate_name}
                      </p>

                      {/* Newly added job title */}
                      <p className="mt-1 text-xs font-medium text-[#71866C]">
                        {item.job_title || 'Untitled Position'}
                      </p>

                      <p className="mt-1 text-xs text-[#999A90]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="rounded-full bg-[#EDF2E9] px-3 py-1.5 text-sm font-semibold text-[#58745C]">
                      {item.match_score}% match
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
