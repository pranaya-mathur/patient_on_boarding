import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-5 py-16 md:gap-14 md:py-24 md:pl-8 md:pr-8">
        <header className="space-y-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Patient onboarding MVP</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground md:text-[2.65rem] md:leading-[1.12]">
            Calm intake, clear operations
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Front-end scaffold for pre-visit registration, insurance capture, and staff queues. No PHI on this
            landing page.
          </p>
        </header>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
          <Link
            href="/intake/demo-token"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-elevate transition-[opacity,box-shadow] hover:opacity-[0.96] hover:shadow-md"
          >
            Open sample patient session
          </Link>
          <Link
            href="/staff"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border/80 bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted/40"
          >
            Open staff dashboard
          </Link>
          <Link
            href="/checkin/demo-token"
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-primary underline-offset-[3px] transition-colors hover:text-primary/90 hover:underline"
          >
            Sample self check-in
          </Link>
        </div>
      </div>
    </div>
  );
}
