import type { ReactNode } from "react";

/** Shell lives under `(dashboard)` so `/staff/login` stays full-screen. */
export default function StaffSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
