import Link from "next/link";

const checklist = [
  {
    number: "01",
    title: "Driver's license",
    body: "Upload a valid driver's license before review can begin.",
  },
  {
    number: "02",
    title: "Insurance",
    body: "Provide current insurance information that matches the vehicle being used.",
  },
  {
    number: "03",
    title: "Background check",
    body: "Complete a full background screening before approval.",
  },
  {
    number: "04",
    title: "Driving record check",
    body: "Complete the driving-history review for your state before activation.",
  },
];

const processFlow = [
  "Upload license and insurance first.",
  "Complete the background check with the approved provider.",
  "Complete the driving record review for the driver’s state.",
  "Wait for full compliance review before expecting approval.",
];

export default function DriverOnboardingPage() {
  return (
    <main className="min-h-screen bg-[#f4efe6] text-slate-900">
      <section className="border-b border-slate-300 bg-[#10233d] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">
              Driver approval path
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Driver onboarding and compliance review
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
              This page is built as a checklist-style review screen, not another copy of the supervisor page.
              It makes the full driver approval path visible before a driver is accepted.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Back to homepage
              </Link>
              <a
                href="#driver-checklist"
                className="inline-flex items-center rounded-full bg-amber-300 px-5 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-amber-200"
              >
                Open checklist
              </a>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-amber-300">Plain rule</p>
            <h2 className="mt-3 text-2xl font-extrabold">Not approved with only 2 items</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              A driver is not approved with only a license and insurance.
              Background screening and driving record review are also required before activation.
            </p>
          </div>
        </div>
      </section>

      <section id="driver-checklist" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-300 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Checklist board</p>
            <h2 className="mt-2 text-3xl font-extrabold">Required compliance items</h2>
          </div>
          <div className="rounded-full bg-[#10233d] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
            4 required checks
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.number} className="rounded-[28px] border-2 border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#10233d] text-lg font-extrabold text-amber-300">
                  {item.number}
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-slate-300 bg-[#eadfcb] p-6">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-600">Review status</p>
            <h2 className="mt-3 text-3xl font-extrabold">Approval happens after full review</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">
              This step makes it clear that driver activation comes after the complete rideshare-style compliance review,
              not before it.
            </p>
          </div>

          <div className="rounded-[32px] border border-slate-300 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Process flow</p>
            <div className="mt-5 space-y-4">
              {processFlow.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-300 text-sm font-extrabold text-slate-950">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
