type CheckInPageProps = { params: Promise<{ token: string }> };

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-dvh bg-background px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-md space-y-6 rounded-xl border border-border/80 bg-card p-8 shadow-elevate sm:p-9">
        <header className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Self check-in</p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground">You are almost checked in</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Token <span className="font-mono text-[0.8125rem] text-foreground">{token}</span> will resolve to an appointment.
            Confirm identity, then tap check in — full flow comes in the patient build-out pass.
          </p>
        </header>
      </div>
    </div>
  );
}
