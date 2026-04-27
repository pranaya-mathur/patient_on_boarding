import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type WelcomeStepProps = {
  token: string;
};

export function WelcomeStep({ token }: WelcomeStepProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-snug">
          Complete your pre-visit registration
        </h2>
        <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground sm:text-base">
          This secure link is unique to your visit. You can pause anytime — your answers save as you go.
        </p>
      </div>
      <Card className="overflow-hidden rounded-xl border-border/80 shadow-elevate">
        <CardHeader className="space-y-2 border-b border-border/60 bg-muted/[0.35] px-6 py-5">
          <CardTitle className="font-serif text-lg font-semibold tracking-tight">What you will need</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            Most people finish in under 10 minutes. Have your insurance card and a government-issued ID nearby.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 px-6 py-6">
          <ul className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-3.5">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/55" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Contact & address</span>
                <span className="text-muted-foreground"> — used for visit reminders and eligibility.</span>
              </span>
            </li>
            <li className="flex gap-3.5">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/55" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Insurance card photos</span>
                <span className="text-muted-foreground"> — front and back help confirm coverage before you arrive.</span>
              </span>
            </li>
            <li className="flex gap-3.5">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary/55" aria-hidden />
              <span>
                <span className="font-medium text-foreground">Consents</span>
                <span className="text-muted-foreground"> — review and acknowledge privacy and financial policies.</span>
              </span>
            </li>
          </ul>
          <p className="rounded-lg border border-border/60 bg-muted/25 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            Session reference: <span className="font-mono text-[13px] text-foreground">{token}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
