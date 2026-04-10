import { CalendarRange } from "lucide-react";

import { SignOutButton } from "@/components/layout/sign-out-button";

export function Topbar({ email }: { email: string | undefined }) {
  const today = new Intl.DateTimeFormat("es-ES", {
    dateStyle: "full",
  }).format(new Date());

  return (
    <div className="glass-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-text">{email ?? "Usuario autenticado"}</p>
        <div className="flex items-center gap-2 text-sm text-muted">
          <CalendarRange className="h-4 w-4" />
          {today}
        </div>
      </div>
      <SignOutButton />
    </div>
  );
}

