import Link from "next/link";

const overview = [
  { label: "Supervisor slots", value: "5", note: "per city/state", color: "sky" },
  { label: "Monthly free rides", value: "1", note: "for each supervisor", color: "emerald" },
  { label: "Driver ID needed", value: "DR", note: "required on every request", color: "violet" },
  { label: "Request line", value: "+1 930 216 4166", note: "pickup + drop-off", color: "amber" },
];

const slots = [
  {
    id: "DR100001",
    name: "Supervisor Slot 1",
    city: "Louisville",
    state: "KY",
    due: "Due now",
    status: "Active",
    message: "Ready for monthly free-ride request",
  },
  {
    id: "DR100002",
    name: "Supervisor Slot 2",
    city: "New Albany",
    state: "IN",
    due: "12 days",
    status: "Pending",
    message: "Watching for pickup and drop-off message",
  },
  {
    id: "DR100003",
    name: "Supervisor Slot 3",
    city: "Jeffersonville",
    state: "IN",
    due: "19 days",
    status: "Pending",
    message: "Monthly reminder not triggered yet",
  },
  {
    id: "DR100004",
    name: "Supervisor Slot 4",
    city: "Clarksville",
    state: "IN",
    due: "Open",
    status: "Open",
    message: "Available slot for next qualifying driver",
  },
];

const steps = [
  {
    title: "Earn the supervisor slot",
    text: "The first five drivers in each city and state who accept Dennis's free rides become supervisors automatically.",
  },
  {
    title: "Send ride details",
    text: "The supervisor sends the driver ID, pickup destination, and drop-off destination directly to Dennis.",
  },
  {
    title: "Track and confirm",
    text: "Dennis can see who is due, mark the ride received, and clear the item after it is handled.",
  },
];

const activity = [
  "Supervisor slot tracking is now visible on the public site.",
  "Monthly free-ride due dates can be shown in one place.",
  "Driver IDs are now part of the workflow display.",
  "Dennis can later connect this page to live admin data.",
];

function cardTone(color: string) {
  if (color === "emerald") return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  if (color === "violet") return "border-violet-400/30 bg-violet-400/10 text-violet-100";
  if (color === "amber") return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  return "border-sky-400/30 bg-sky-400/10 text-sky-100";
}

function statusTone(status: string) {
  if (status === "Active") return "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30";
  if (status === "Open") return "bg-sky-400/20 text-sky-200 border border-sky-400/30";
  return "bg-amber-400/20 text-amber-200 border border-amber-400/30";
}

export default function SupervisorsPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#082f49_35%,#0f766e_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.16),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-sky-100 backdrop-blur-sm">
                Public supervisor launch step
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Supervisor free-ride command page
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-100 sm:text-lg">
                This is a stronger live version of the supervisor page. It gives the workflow a real
                launch-page look with clear slot status, visible next actions, and a dashboard-style layout.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Back to homepage
                </Link>
                <a
                  href="tel:+19302164166"
                  className="inline-flex rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-100"
                >
                  Call Dennis
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-slate-950/45 p-6 shadow-2xl backdrop-blur-md">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-sky-200">Action center</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Current priority</p>
                  <p className="mt-2 text-lg font-bold text-white">Track monthly free rides by driver ID</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Needed from supervisor</p>
                  <p className="mt-2 text-lg font-bold text-white">Pickup and drop-off destination</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Admin flow later</p>
                  <p className="mt-2 text-lg font-bold text-white">Mark received, notify, and clear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {overview.map((item) => (
            <div key={item.label} className={`rounded-3xl border p-6 shadow-xl ${cardTone(item.color)}`}>
              <p className="text-xs font-bold uppercase tracking-[0.24em]">{item.label}</p>
              <p className="mt-4 break-words text-2xl font-extrabold sm:text-3xl">{item.value}</p>
              <p className="mt-2 text-sm opacity-90">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Supervisor slots</p>
                <h2 className="mt-2 text-3xl font-extrabold">Live slot board</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200">
                Updated public workflow view
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {slots.map((slot) => (
                <div key={slot.id} className="rounded-3xl border border-white/10 bg-[#0f172a] p-5 shadow-lg">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Driver ID</p>
                      <p className="mt-2 text-xl font-extrabold text-sky-300">{slot.id}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusTone(slot.status)}`}>
                      {slot.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Supervisor</p>
                      <p className="mt-2 text-base font-bold text-white">{slot.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
                      <p className="mt-2 text-base font-bold text-white">{slot.city}, {slot.state}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ride due</p>
                      <p className="mt-2 text-base font-bold text-white">{slot.due}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Next action</p>
                      <p className="mt-2 text-base font-bold text-white">Review request</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    {slot.message}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button className="rounded-full bg-sky-400 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300">
                      Mark received
                    </button>
                    <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/10">
                      Notify
                    </button>
                    <button className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-extrabold text-rose-200 transition hover:bg-rose-400/20">
                      Clear item
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">How it works</p>
              <div className="mt-5 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="rounded-2xl border border-white/10 bg-[#0f172a] p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-400 text-sm font-extrabold text-slate-950">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">{step.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Live activity board</p>
              <div className="mt-5 space-y-3">
                {activity.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm leading-7 text-slate-300">
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
