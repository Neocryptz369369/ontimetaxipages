import Link from "next/link";

const complianceItems = [
  {
    title: "Driver's license",
    text: "Upload a valid driver's license before review can begin.",
  },
  {
    title: "Insurance",
    text: "Provide current insurance details that match the vehicle being used.",
  },
  {
    title: "Background check",
    text: "Complete a full background check before approval.",
  },
  {
    title: "Driving record check",
    text: "Submit driving-history verification so the compliance review is complete.",
  },
];

const providerSteps = [
  "Choose an approved screening provider for background review.",
  "Choose the driving-record source or DMV process for your state.",
  "Upload your license and insurance details to the onboarding flow.",
  "Wait for full review before expecting driver approval.",
];

export default function DriverOnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-gradient-to-b from-sky-700 via-slate-900 to-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-200">
            New public step
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Driver onboarding and compliance
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200 sm:text-lg">
            Drivers are not approved with only a license and insurance. This flow makes the full
            screening path visible: license, insurance, background check, and driving record check.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Back to homepage
            </Link>
            <a
              href="#compliance-checklist"
              className="rounded-full bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              View checklist
            </a>
          </div>
        </div>
      </section>

      <section id="compliance-checklist" className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {complianceItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Required</p>
              <h2 className="mt-3 text-2xl font-semibold">{item.title}</h2>
              <p className="mt-3 text-base leading-7 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Important</p>
            <h2 className="mt-3 text-2xl font-semibold">Not approved with only 2 items</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              A driver should not be treated as approved with only a driver's license and insurance.
              The background check and driving-record check are also part of the required screening path.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Review outcome</p>
            <h2 className="mt-3 text-2xl font-semibold">Full compliance before activation</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              This page makes the rideshare-style review path visible before the driver is activated.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-300">Process points</p>
          <h2 className="mt-3 text-2xl font-semibold">Proper places and next steps</h2><ul className="mt-4 space-y-3 text-base leading-7 text-slate-300">
            {providerSteps.map((step) => (
              <li key={step}>• {step}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
