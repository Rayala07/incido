import { useEffect, useState } from "react"
import useAuth from "../../auth/hook/useAuth"
import axiosInstance from "../../auth/services/axiosInstance"

const DashboardPage = () => {
  const { user, logout, isLoading } = useAuth()
  const [openActionItemCount, setOpenActionItemCount] = useState(null)
  const [countError, setCountError] = useState("")

  useEffect(() => {
    let isMounted = true

    const loadActionItemCount = async () => {
      try {
        const { data } = await axiosInstance.get("/api/action-items/open-count")

        if (isMounted) {
          setOpenActionItemCount(data.count ?? 0)
        }
      } catch (error) {
        if (isMounted) {
          setCountError("Could not load action item count")
        }
      }
    }

    loadActionItemCount()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-(--bg-base) px-4 py-10">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <div className="rounded-[28px] border border-(--border-col) bg-[rgba(255,255,255,0.02)] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.14)] backdrop-blur-sm">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-(--text-muted) mb-3">
            — Dashboard
          </p>
          <h1
            className="font-display font-semibold text-(--text-primary) leading-[1.05]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
          >
            Welcome back,
            <br />
            {user?.username ?? "—"}.
          </h1>
          <p className="font-mono text-[0.65rem] text-(--text-muted) mt-3 uppercase tracking-widest">
            Role: <span className="text-accent">{user?.role}</span>
            &nbsp;·&nbsp;
            {user?.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-(--border-col) bg-[rgba(255,255,255,0.02)] p-5">
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-(--text-muted)">
              Action Items
            </p>
            <div className="mt-4 flex items-end gap-4">
              <div>
                <div className="text-5xl font-display font-semibold text-(--text-primary) leading-none">
                  {openActionItemCount === null ? "—" : openActionItemCount}
                </div>
                <p className="mt-2 max-w-md text-sm text-(--text-muted)">
                  Open action items across past incidents.
                </p>
              </div>
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-accent">
                {openActionItemCount === null ? "Loading" : "Open"}
              </span>
            </div>
            {countError ? (
              <p className="mt-4 text-sm text-red-400">{countError}</p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-(--border-col) bg-[rgba(255,255,255,0.02)] p-5 flex flex-col justify-between gap-4">
            <div>
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-(--text-muted)">
                Status
              </p>
              <p className="mt-3 text-sm text-(--text-muted)">
                Action items are saved separately, so teams can track them after
                the postmortem closes.
              </p>
            </div>

            <button
              onClick={() => logout()}
              disabled={isLoading}
              className={[
                "h-10 px-8 font-mono font-medium text-[0.75rem] uppercase tracking-[0.15em]",
                "border border-(--border-col) rounded-xs",
                "text-(--text-primary) bg-transparent",
                "transition-all duration-200 cursor-pointer",
                "hover:border-accent hover:text-accent",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              ].join(" ")}
            >
              {isLoading ? "Signing out…" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
