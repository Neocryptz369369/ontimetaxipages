import Link from "next/link";

const stats = [
  { label: "Open supervisor slots", value: "5 per city/state", tone: "sky" },
  { label: "Monthly free rides", value: "1 each", tone: "emerald" },
  { label: "Driver ID required", value: "Always", tone: "violet" },
  { label: "Request path", value: "+1 930 216 4166", tone: "amber" },
];

const supervisors = [
  {
    id: "DR100001",
    name: "Supervisor Slot 1",
    city: "Louisville",
    state: "KY",
    due: "Due now",
    status: "Active",
    note: "Waiting for pickup and drop-off message",
  },
  {
    id: "DR100002",
    name: "Supervisor Slot 2",
    city: "New Albany",
    state: "IN",
    due: "Due in 12 days",
    status: "Pending",
    note: "Monthly ride not requested yet",
  },
  {
    id: "DR100003",
    name: "Supervisor Slot 3",
    city: "Jeffersonville",
    state: "IN",
    due: "Due in 19 days",
    status: "Pending",
    note: "Supervisor tracking started",
  },
];

function toneClasses(tone: string) {
  if (tone === "emerald") {
    return "border-emerald-400/30 bg-emerald-400/10 text-emerald-100";
  }
  if (tone === "violet") {
    return "border-violet-400/30 bg-violet-400/10 text-violet-100";
  }
  if (tone === "amber") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-100";
  }
  return "border-sky-400/30 bg-sky-400/10 text-sky-100";
}

function statusClasses(status: string) {
  if (status === "Active") {
    return "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30";
  }
  return "bg-amber-400/20 text-amber-200 border border-amber-400/30";
}

export default function SupervisorsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.28),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_28%),linear-gradient(180deg,#082f49_0%,#0f172a_48%,#020617_100%)]">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="inline-flex items-center rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-sky-200">
            Public supervisor step
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Supervisor free-ride workflow
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
                This page shows how supervisor slots work, how monthly free rides are tracked,
                and what Dennis needs to see at a glance. It should feel like a real launch step,
                not just a note page.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Back to homepage
                </Link>
                <a
                  href="tel:+19302164166"
                  className="inline-flex rounded-full bg-sky-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
                >
                  Call Dennis
                </a>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Quick summary</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Who becomes a supervisor</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    First five drivers in each city and state who accept Dennis&apos;s free rides.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly reward</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    One free ride every month.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Needed for the ride</p>
                  <p className="mt-2 text-base font-semibold text-white">
                    Driver ID, pickup destination, and drop-off destination.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-3xl border p-5 shadow-lg ${toneClasses(stat.tone)}`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em]">{stat.label}</p>
              <p className="mt-4 text-2xl font-extrabold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Step 1</p>
            <h2 className="mt-3 text-2xl font-bold">Earn the slot</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              The first five drivers in the local city/state area who accept Dennis&apos;s free rides
              become supervisors automatically.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Step 2</p>
            <h2 className="mt-3 text-2xl font-bold">Request the monthly ride</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              The supervisor sends the pickup destination, drop-off destination, and driver ID to Dennis.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Step 3</p>
            <h2 className="mt-3 text-2xl font-bold">Track and clear</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Dennis tracks who is due, marks the ride received, and clears the item after it is handled.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 bg-slate-900/60 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-300">Supervisor ledger</p>
              <h2 className="mt-2 text-2xl font-extrabold">Current monthly ride status</h2>
            </div>
            <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
              Text ride details to +1 930 216 4166
            </div>
          </div>

          <div className="grid gap-4 p-6">
            {supervisors.map((driver) => (
              <div
                key={driver.id}
                className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-lg"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5 xl:items-center">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Driver ID</p>
                      <p className="mt-2 text-lg font-bold text-sky-300">{driver.id}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Name</p>
                      <p className="mt-2 text-base font-semibold">{driver.name}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Location</p>
                      <p className="mt-2 text-base font-semibold">{driver.city}, {driver.state}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Monthly ride due</p>
                      <p className="mt-2 text-base font-semibold">{driver.due}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
                      <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClasses(driver.status)}`}>
                        {driver.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button className="rounded-full bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-sky-300">
                      Mark received
                    </button>
                    <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/5">
                      Notify
                    </button>
                    <button className="rounded-full border border-rose-400/30 bg-rose-400/10 px-4 py-2 text-sm font-bold text-rose-200 transition hover:bg-rose-400/20">
                      Clear item
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
                  {driver.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
