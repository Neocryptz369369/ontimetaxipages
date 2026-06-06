import Link from "next/link";

const supervisors = [
  {
    id: "DR100001",
    name: "Supervisor Slot 1",
    city: "Louisville",
    state: "KY",
    due: "Due now",
    status: "Active",
  },
  {
    id: "DR100002",
    name: "Supervisor Slot 2",
    city: "New Albany",
    state: "IN",
    due: "Due in 12 days",
    status: "Waiting",
  },
  {
    id: "DR100003",
    name: "Supervisor Slot 3",
    city: "Jeffersonville",
    state: "IN",
    due: "Due in 19 days",
    status: "Waiting",
  },
];

export default function SupervisorsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-sky-700 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-200">
            Live homepage step
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Supervisor free-ride workflow
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            This public page shows the next rideshare build step after the marquee work:
            supervisor free-ride tracking, driver ID visibility, monthly due reminders,
            and simple owner actions.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Back to homepage
            </Link>
            <a
              href="tel:+19302164166"
              className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              Call Dennis
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Who qualifies</p>
            <p className="mt-3 text-base leading-7 text-slate-300">
              The first five drivers in each city and state who accept Dennis&apos;s free rides become supervisors.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Monthly reward</p>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Each supervisor gets one free ride every month and sends pickup and drop-off details directly to Dennis.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Owner actions</p>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Dennis can track who is due, confirm when the ride was received, and clear the item after it is handled.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="grid gap-4 border-b border-white/10 px-6 py-4 text-sm font-bold text-slate-300 md:grid-cols-5">
            <div>Driver ID</div>
            <div>Name</div>
            <div>City / State</div>
            <div>Ride Due</div>
            <div>Status</div>
          </div>

          <div className="divide-y divide-white/10">
            {supervisors.map((driver) => (
              <div key={driver.id} className="grid gap-4 px-6 py-5 md:grid-cols-5 md:items-center">
                <div className="font-semibold text-sky-300">{driver.id}</div>
                <div>{driver.name}</div>
                <div>{driver.city}, {driver.state}</div>
                <div>{driver.due}</div>
                <div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      driver.status === "Active"
                        ? "bg-emerald-400/20 text-emerald-200"
                        : "bg-amber-400/20 text-amber-200"
                    }`}
                  >
                    {driver.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
