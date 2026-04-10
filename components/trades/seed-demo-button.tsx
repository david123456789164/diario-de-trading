"use client";

import { DatabaseZap, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SeedDemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSeed() {
    setLoading(true);
    const response = await fetch("/api/seed-demo", { method: "POST" });
    const data = (await response.json().catch(() => null)) as { inserted?: number; error?: string } | null;
    setLoading(false);

    if (!response.ok) {
      toast.error(data?.error ?? "No se pudieron cargar datos demo.");
      return;
    }

    toast.success(`Se cargaron ${data?.inserted ?? 0} trades demo.`);
    router.refresh();
  }

  return (
    <Button variant="secondary" onClick={handleSeed} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
      Cargar datos demo
    </Button>
  );
}

