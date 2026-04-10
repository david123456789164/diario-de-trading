"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

const magicLinkSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
});

const passwordSchema = z.object({
  email: z.string().email("Ingresa un email válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type MagicLinkValues = z.infer<typeof magicLinkSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function LoginCard() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [loading, setLoading] = useState(false);

  const magicForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  async function submitMagic(values: MagicLinkValues) {
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "No se pudo enviar el magic link.");
      return;
    }

    toast.success("Revisa tu correo. Te enviamos un enlace para entrar.");
    magicForm.reset();
  }

  async function submitPassword(values: PasswordValues) {
    setLoading(true);

    const loginResult = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (!loginResult.error) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    const signUpResult = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signUpResult.error) {
      toast.error(signUpResult.error.message || "No se pudo iniciar sesión ni crear la cuenta.");
      return;
    }

    if (signUpResult.data.session) {
      toast.success("Sesión iniciada correctamente.");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.success("Cuenta creada. Revisa tu email para confirmar el acceso.");
  }

  return (
    <Card className="w-full max-w-xl space-y-8 border-accent/10 bg-panel/90 p-8">
      <div className="space-y-3">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          Acceso privado
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl md:text-4xl">Diario de trading swing</CardTitle>
          <CardDescription className="text-base">
            Registra operaciones, evalúa setups y convierte tu historial en decisiones mejores.
          </CardDescription>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stroke bg-background/40 p-2">
        <button
          type="button"
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${mode === "magic" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("magic")}
        >
          Magic link
        </button>
        <button
          type="button"
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${mode === "password" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("password")}
        >
          Email + contraseña
        </button>
      </div>

      {mode === "magic" ? (
        <form className="space-y-5" onSubmit={magicForm.handleSubmit(submitMagic)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Email</label>
            <Input placeholder="tu@email.com" {...magicForm.register("email")} />
            {magicForm.formState.errors.email ? (
              <p className="text-sm text-danger">{magicForm.formState.errors.email.message}</p>
            ) : (
              <p className="text-sm text-muted">Recibirás un enlace seguro para entrar sin contraseña.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Enviar enlace mágico
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={passwordForm.handleSubmit(submitPassword)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Email</label>
            <Input placeholder="tu@email.com" {...passwordForm.register("email")} />
            {passwordForm.formState.errors.email ? (
              <p className="text-sm text-danger">{passwordForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Contraseña</label>
            <Input type="password" placeholder="Mínimo 6 caracteres" {...passwordForm.register("password")} />
            {passwordForm.formState.errors.password ? (
              <p className="text-sm text-danger">{passwordForm.formState.errors.password.message}</p>
            ) : (
              <p className="text-sm text-muted">Si la cuenta no existe, se creará con este email y contraseña.</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Entrar o crear cuenta
          </Button>
        </form>
      )}
    </Card>
  );
}

