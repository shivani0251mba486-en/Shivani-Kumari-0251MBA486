import type { User } from 'firebase/auth';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { type ActiveProject, TRACKER_STAGES } from '../data/solarData';

interface TurnkeyTrackerProps {
  projects: ActiveProject[];
  activeProjectId: string;
  user: User | null;
  advancing: boolean;
  onSignIn: () => void;
  onSelectProject: (id: string) => void;
  onAdvanceDemoStage: (project: ActiveProject) => void;
}

export function TurnkeyTracker({
  projects,
  activeProjectId,
  user,
  advancing,
  onSignIn,
  onSelectProject,
  onAdvanceDemoStage,
}: TurnkeyTrackerProps) {
  const activeProject =
    projects.find((p) => p.id === activeProjectId) ?? projects[0];

  const progressPct = Math.min(
    100,
    Math.round((activeProject.completedSteps / TRACKER_STAGES.length) * 100)
  );

  return (
    <section id="tracker" className="border-b border-slate-200 bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">
              04. 25-Day Turnkey Concierge Pipeline
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Live DISCOM net-metering &amp; escrow milestone tracker
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Track every regulatory filing, Jansamarth loan sanction, and grid
              synchronization step in real time without visiting a single government office.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="tracker-project" className="text-xs font-medium text-slate-500">
              Active File:
            </label>
            <select
              id="tracker-project"
              value={activeProject.id}
              onChange={(e) => onSelectProject(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-slate-900 focus:outline-none"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.id} · {proj.homeowner} ({proj.city})
                  {proj.isPersisted ? ' · Saved' : ' · Sample'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Summary Card */}
          <div className="lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-6">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <p className="font-mono text-xs text-slate-500">
                    {activeProject.id} ·{' '}
                    {activeProject.isPersisted ? 'Synced to Account' : 'Sample Pilot'}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold text-slate-900">
                    {activeProject.homeowner}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {activeProject.locality} · {activeProject.discom}
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                  {activeProject.systemKw} kW
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">25-Day SLA Progress</span>
                  <span className="font-mono text-slate-900 tabular-nums">
                    Day {activeProject.currentDay} of {activeProject.targetDays} ({progressPct}%)
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <dl className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-xs">
                <div>
                  <dt className="text-slate-500">Assigned Tier-1 EPC</dt>
                  <dd className="mt-0.5 font-semibold text-slate-900">
                    {activeProject.installerName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Escrow Milestone Status</dt>
                  <dd className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-slate-900">
                    <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{activeProject.escrowStatus}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">PM Surya Ghar CFA</dt>
                  <dd className="mt-0.5 font-semibold text-emerald-700">
                    {activeProject.subsidyStatus}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Jansamarth Financing</dt>
                  <dd className="mt-0.5 font-medium text-slate-800">
                    {activeProject.loanStatus}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => onAdvanceDemoStage(activeProject)}
                disabled={
                  advancing || activeProject.completedSteps >= TRACKER_STAGES.length
                }
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {advancing
                  ? 'Updating Milestone...'
                  : activeProject.completedSteps >= TRACKER_STAGES.length
                    ? 'Grid Commissioned & Escrow Released'
                    : activeProject.isPersisted
                      ? 'Advance & Save Next Milestone'
                      : 'Simulate Next Milestone Completion'}
              </button>

              {!user && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  <button
                    type="button"
                    onClick={onSignIn}
                    className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-900"
                  >
                    Sign in with Google
                  </button>{' '}
                  to view and save your own installations.
                </p>
              )}
            </div>
          </div>

          {/* 6-Stage Timeline */}
          <div className="lg:col-span-8">
            <ol className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
              {TRACKER_STAGES.map((stage, idx) => {
                const stepNum = idx + 1;
                const isDone = stepNum <= activeProject.completedSteps;
                const isCurrent = stepNum === activeProject.completedSteps + 1;

                return (
                  <li
                    key={stage.title}
                    className={`flex items-start gap-4 p-5 transition-colors ${
                      isCurrent ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Clock className="h-5 w-5 text-amber-600" />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 font-mono text-[11px] font-semibold text-slate-500 tabular-nums">
                          {stepNum}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-slate-900 sm:text-base">
                          {stage.title}
                        </h4>
                        <span className="font-mono text-xs font-medium text-slate-500 tabular-nums">
                          {stage.dayRange} · {stage.department}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {stage.detail}
                      </p>
                      <p className="mt-1.5 text-xs font-medium">
                        {isDone && <span className="text-emerald-700">Completed &amp; Verified</span>}
                        {isCurrent && (
                          <span className="text-amber-700">In Progress · Concierge Active</span>
                        )}
                        {!isDone && !isCurrent && (
                          <span className="text-slate-400">Scheduled in Pipeline</span>
                        )}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
