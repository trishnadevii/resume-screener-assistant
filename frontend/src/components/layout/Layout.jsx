
import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, FilePlus2, History, Sparkles } from 'lucide-react'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/new-screening', label: 'New Screening', icon: FilePlus2 },
  { to: '/history', label: 'History', icon: History },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#343D35] md:flex">
      <aside className="w-full border-b border-[#E9E7DE] bg-[#FDFCF8] px-5 py-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:px-6">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E5EDE3] text-[#58745C]">
            <Sparkles size={21} />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight">Resume Assistant</h1>
            <p className="text-xs text-[#92958C]">Hiring workspace</p>
          </div>
        </div>

        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#A1A297]">
          Workspace
        </p>

        <nav className="flex gap-2 md:flex-col">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-[#E9EFE6] font-semibold text-[#4D6B51]'
                    : 'text-[#777D73] hover:bg-[#F2F1EB]'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 hidden rounded-2xl border border-[#EAE7DC] bg-[#F8F6EF] p-4 md:block">
          <p className="text-sm font-medium">A little reminder</p>
          <p className="mt-2 text-xs leading-5 text-[#85877D]">
            AI screening is here to support thoughtful hiring decisions, not replace human judgment.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-9">
        <Outlet />
      </main>
    </div>
  )
}
