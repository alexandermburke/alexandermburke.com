export default function About() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="mt-4 text-white/70">
        I build software and ML products with a focus on high-signal UX and pragmatic engineering.
        Interests: Next.js, TypeScript, data pipelines, custom dashboards, and automotive tech.
      </p>
      <p className="mt-4 text-white/60">
        Resume available on request. For collaborations and consulting: <a className="hover:text-accent" href="mailto:ab@alexandermburke.com">ab@alexandermburke.com</a>.
      </p>
    </main>
  );
}