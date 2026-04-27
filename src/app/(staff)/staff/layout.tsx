import type { ReactNode } from "react";
import { StaffAppShell } from "@/components/staff/StaffAppShell";

export default function StaffSectionLayout({ children }: { children: ReactNode }) {
  return <StaffAppShell>{children}</StaffAppShell>;
}
