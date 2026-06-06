import Link from "next/link";

const supervisorSlots = [
  {
    id: "DR100001",
    name: "Supervisor Slot 1",
    market: "Louisville, KY",
    due: "Due now",
    state: "Needs ride details",
    note: "Waiting on pickup and drop-off destination from the supervisor.",
  },
  {
    id: "DR100002",
    name: "Supervisor Slot 2",
    market: "New Albany, IN",
    due: "12 days",
    state: "Quiet",
    note: "Next monthly ride window is coming up soon.",
  },
  {
    id: "DR100003",
    name: "Supervisor Slot 3",
    market: "Jeffersonville, IN",
    due: "19 days",
    state: "Quiet",
    note: "Tracked and waiting for the next request cycle.",
  },
  {
    id: "OPEN-004",
    name: "Open Slot 4",
    market: "Clarksville, IN",
    due: "Open",
    state: "Open slot",
    note: "Available for the next qualifying driver who accepts free rides.",
  },
];

const monthlySteps = [
  "Supervisor sends driver ID.",
  "Supervisor sends pickup destination.",
  "Supervisor sends drop-off destination.",
  "Dennis confirms the free ride was handled.",
  "Dennis clears the item after completion.",
];

const sideStats = [
  { label: "Rule", value: "First 5 drivers" },
  { label: "Reward", value: "1 free ride monthly" },
  { label: "Request line", value: "+1 930 216 4166" },
];

function badgeClasses(state: string) {
  if (state === "Needs ride details") {
    return "bg-amber-300/20 text-amber-100 border border-amber-300/30";
  }
  if (state === "Open slot") {
    return "bg-sky-300/20 text-sky-100 border border-sky-300/30";
  }
  return "bg-emerald-300/20 text-emerald-100 border border-emerald-300/30";
}

export default function SupervisorsPage() {
  return (
    <main className="min-h-screen bg-[#08111f] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[#0b1728] shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#123154_50%,#0f766e_100%)] px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-sky-100/80">
                  Supervisor operations board
                </p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                  Supervisor free-ride command board
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-100/90 sm:text-base">
                  A more structured live page for tracking supervisor slots, monthly ride timing,
                  and Dennis&apos;s next action without making it feel like another plain text page.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Back to homepage
                </Link>
                <a
                  href="tel:+19302164166"
                  className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-sky-100"
                >
                  Call Dennis
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="border-b border-white/10 bg-[#0a1423] p-6 lg:border-b-0 lg:border-r">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Summary rail</p>
                <div className="mt-5 space-y-4">
                  {sideStats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-[#101d31] p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-extrabold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">What makes a supervisor</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  The first five drivers in each city and state who accept Dennis&apos;s free rides become supervisors automatically.
                </p>
              </div>
            </aside>

            <section className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Slot board</p>
                  <h2 className="mt-2 text-2xl font-extrabold">Current supervisor queue</h2>
                </div>
                <div className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">
                  Public workflow view
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {supervisorSlots.map((slot) => (
                  <div key={slot.id} className="rounded-3xl border border-white/10 bg-[#101d31] p-5 shadow-lg">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-extrabold text-sky-200">{slot.name}</p>
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${badgeClasses(slot.state)}`}>
                            {slot.state}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">{slot.id} • {slot.market}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
                        <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Ride due</p>
                          <p className="mt-2 text-base font-extrabold text-white">{slot.due}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-[#0b1728] p-3">
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Next action</p>
                          <p className="mt-2 text-base font-extrabold text-white">Review</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b1728] px-4 py-3 text-sm leading-7 text-slate-300">
                      {slot.note}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="rounded-full bg-sky-400 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:bg-sky-300">
                        Mark received
                      </button>
                      <button className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/10">
                        Notify
                      </button>
                      <button className="rounded-full border border-rose-300/30 bg-rose-300/10 px-4 py-2 text-sm font-extrabold text-rose-100 transition hover:bg-rose-300/20">
                        Clear item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <aside className="bg-[#0a1423] p-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Monthly workflow</p>
                <div className="mt-5 space-y-3">
                  {monthlySteps.map((step, index) => (
                    <div key={step} className="flex gap-3 rounded-2xl border border-white/10 bg-[#101d31] p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-400 text-xs font-extrabold text-slate-950">
                        {index + 1}
                      </div>
                      <p className="text-sm leading-7 text-slate-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-200">Owner note</p>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  This page is meant to feel more like a control board than a flyer. Later, these cards can hook into live admin data, alerts, and true monthly reminders.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
