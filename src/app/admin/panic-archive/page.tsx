import Link from "next/link";

const archiveGroups = [
  {
    title: "Driver audio",
    tone: "sky",
    entries: [
      { id: "DR100001", label: "Driver audio clip", time: "2 min ago", status: "New" },
      { id: "DR100014", label: "Driver audio clip", time: "19 min ago", status: "Reviewed" },
    ],
  },
  {
    title: "Driver video",
    tone: "emerald",
    entries: [
      { id: "DR100001", label: "Driver video clip", time: "2 min ago", status: "New" },
      { id: "DR100014", label: "Driver video clip", time: "19 min ago", status: "Reviewed" },
    ],
  },
  {
    title: "Rider audio",
    tone: "violet",
    entries: [
      { id: "CU200211", label: "Rider audio clip", time: "8 min ago", status: "New" },
      { id: "CU200145", label: "Rider audio clip", time: "43 min ago", status: "Hold" },
    ],
  },
  {
    title: "Rider video",
    tone: "amber",
    entries: [
      { id: "CU200211", label: "Rider video clip", time: "8 min ago", status: "New" },
      { id: "CU200145", label: "Rider video clip", time: "43 min ago", status: "Hold" },
    ],
  },
  {
    title: "Owner app audio",
    tone: "rose",
    entries: [
      { id: "OWN0001", label: "Owner audio clip", time: "1 hr ago", status: "Reviewed" },
    ],
  },
  {
    title: "Owner app video",
    tone: "cyan",
    entries: [
      { id: "OWN0001", label: "Owner video clip", time: "1 hr ago", status: "Reviewed" },
    ],
  },
];

const alerts = [
  "New panic recording reached the admin archive.",
  "ID search should match driver, rider, or owner IDs.",
  "Delete should move recordings into a hold area first, not remove them right away.",
  "Reminder email stays unwired until Dennis confirms the exact address.",
];

const holdItems = [
  { type: "Driver audio", id: "DR100014", daysLeft: "4 days left" },
  { type: "Rider video", id: "CU200145", daysLeft: "1 day left" },
];

function toneClasses(tone: string) {
  if (tone === "emerald") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (tone === "violet") return "border-violet-400/30 bg-violet-400/10 text-violet-100";
  if (tone === "amber") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  if (tone === "rose") return "border-rose-400/30 bg-rose-400/10 text-rose-100";
  if (tone === "cyan") return "border-cyan-400/30 bg-cyan-400/10 text-cyan-100";
  return "border-sky-400/30 bg-sky-400/10 text-sky-100";
}

function statusBadge(status: string) {
  if (status === "New") return "bg-rose-400/20 text-rose-100 border border-rose-400/30";
  if (status === "Hold") return "bg-amber-400/20 text-amber-100 border border-amber-400/30";
  return "bg-emerald-400/20 text-emerald-100 border border-emerald-400/30";
}

export default function PanicArchivePage() {
  return (
    <main className="min-h-screen bg-[#08111f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1728] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#123154_45%,#7c2d12_100%)] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-200/90">
                  Admin console • Panic recordings
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Panic archive and recordings board
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/90 sm:text-base">
                  This admin screen organizes panic-button recordings into the 6 separate archive areas Dennis requested,
                  with search, review, download, delete, restore, and hold-state structure.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Back to Admin
                </Link>
                <button className="inline-flex items-center rounded-full bg-amber-300 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-200">
                  New archive alert
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-0 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-white/10 bg-[#0a1423] p-6 xl:border-b-0 xl:border-r">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Search recordings</p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-[#101d31] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Find by ID</p>
                  <p className="mt-2 text-base font-bold text-white">DR100001 / CU200211 / OWN0001</p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Alert notes</p>
                <div className="mt-4 space-y-3">
                  {alerts.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-[#101d31] px-4 py-3 text-sm leading-7 text-slate-300">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Delete-hold rule</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  Deleted recordings should move into a hold area first, stay there for the default 5 days,
                  and be restorable before final removal.
                </p>
              </div>
            </aside>

            <section className="p-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {archiveGroups.map((group) => (
                  <div key={group.title} className="rounded-[28px] border border-white/10 bg-[#101d31] p-5 shadow-lg">
                    <div className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${toneClasses(group.tone)}`}>
                      {group.title}
                    </div>

                    <div className="mt-4 space-y-3">
                      {group.entries.map((entry) => (
                        <div key={`${group.title}-${entry.id}-${entry.time}`} className="rounded-2xl border border-white/10 bg-[#0b1728] p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-extrabold text-white">{entry.label}</p>
                              <p className="mt-1 text-xs text-slate-400">{entry.id} • {entry.time}</p>
                            </div>
                            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${statusBadge(entry.status)}`}>
                              {entry.status}
                            </span>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button className="rounded-full bg-sky-400 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-sky-300">
                              Review
                            </button>
                            <button className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/10">
                              Download
                            </button>
                            <button className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-extrabold text-rose-100 transition hover:bg-rose-300/20">
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Deleted recordings hold area</p>
                  <div className="mt-4 space-y-3">
                    {holdItems.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#101d31] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-extrabold text-white">{item.type}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.id} • {item.daysLeft}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full bg-emerald-400 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:bg-emerald-300">
                            Restore
                          </button>
                          <button className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-extrabold text-amber-100 transition hover:bg-amber-300/20">
                            Extend hold
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-200">Important note</p>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-[#101d31] p-4 text-sm leading-7 text-slate-300">
                    The email alert destination is still intentionally left unwired here until Dennis confirms the exact address.
                    This page is focused on the admin-console archive and recording-management structure first.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
