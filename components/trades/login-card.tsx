"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function createMagicLinkSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("login.validation.email")),
  });
}

function createPasswordSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("login.validation.email")),
    password: z.string().min(6, t("login.validation.passwordMin")),
  });
}

type MagicLinkValues = z.infer<ReturnType<typeof createMagicLinkSchema>>;
type PasswordValues = z.infer<ReturnType<typeof createPasswordSchema>>;

export function LoginCard() {
  const router = useRouter();
  const { t } = useTranslation();
  const supabase = createBrowserSupabaseClient();
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [loading, setLoading] = useState(false);
  const magicLinkSchema = useMemo(() => createMagicLinkSchema(t), [t]);
  const passwordSchema = useMemo(() => createPasswordSchema(t), [t]);

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
      toast.error(error.message || t("login.toasts.magicError"));
      return;
    }

    toast.success(t("login.toasts.magicSuccess"));
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
      toast.error(signUpResult.error.message || t("login.toasts.authError"));
      return;
    }

    if (signUpResult.data.session) {
      toast.success(t("login.toasts.sessionSuccess"));
      router.push("/dashboard");
      router.refresh();
      return;
    }

    toast.success(t("login.toasts.signupSuccess"));
  }

  return (
    <Card className="w-full max-w-xl space-y-8 border-accent/10 bg-panel/90 p-8">
      <div className="space-y-3">
        <div className="rtl-kicker inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          <ShieldCheck className="h-3.5 w-3.5" />
          {t("login.accessBadge")}
        </div>
        <div className="space-y-2">
          <CardTitle className="text-3xl md:text-4xl">{t("login.title")}</CardTitle>
          <CardDescription className="text-base">{t("login.description")}</CardDescription>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-stroke bg-background/40 p-2">
        <button
          type="button"
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${mode === "magic" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("magic")}
        >
          {t("login.magicTab")}
        </button>
        <button
          type="button"
          className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${mode === "password" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("password")}
        >
          {t("login.passwordTab")}
        </button>
      </div>

      {mode === "magic" ? (
        <form className="space-y-5" onSubmit={magicForm.handleSubmit(submitMagic)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.emailLabel")}</label>
            <Input placeholder={t("login.emailPlaceholder")} {...magicForm.register("email")} />
            {magicForm.formState.errors.email ? (
              <p className="text-sm text-danger">{magicForm.formState.errors.email.message}</p>
            ) : (
              <p className="text-sm text-muted">{t("login.magicHint")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {t("login.sendMagicLink")}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={passwordForm.handleSubmit(submitPassword)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.emailLabel")}</label>
            <Input placeholder={t("login.emailPlaceholder")} {...passwordForm.register("email")} />
            {passwordForm.formState.errors.email ? (
              <p className="text-sm text-danger">{passwordForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.passwordLabel")}</label>
            <Input type="password" placeholder={t("login.passwordPlaceholder")} {...passwordForm.register("password")} />
            {passwordForm.formState.errors.password ? (
              <p className="text-sm text-danger">{passwordForm.formState.errors.password.message}</p>
            ) : (
              <p className="text-sm text-muted">{t("login.passwordHint")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {t("login.submitPassword")}
          </Button>
        </form>
      )}
    </Card>
  );
}
