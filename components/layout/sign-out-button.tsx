"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("No se pudo cerrar sesión.");
      setLoading(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleSignOut} disabled={loading}>
      <LogOut className="h-4 w-4" />
      {loading ? "Saliendo..." : "Salir"}
    </Button>
  );
}

