"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, ShieldCheck, UserPlus } from "lucide-react";
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

function createLoginSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("login.validation.email")),
    password: z.string().min(6, t("login.validation.passwordMin")),
  });
}

function createSignupSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(1, t("login.validation.nameRequired")),
    email: z.string().email(t("login.validation.email")),
    password: z.string().min(6, t("login.validation.passwordMin")),
  });
}

type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
type SignupValues = z.infer<ReturnType<typeof createSignupSchema>>;
type SignupStatus = "pending" | "approved" | "rejected" | "unknown";

export function LoginCard() {
  const router = useRouter();
  const { t } = useTranslation();
  const supabase = createBrowserSupabaseClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);
  const signupSchema = useMemo(() => createSignupSchema(t), [t]);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function getSignupStatus(email: string): Promise<SignupStatus> {
    const response = await fetch("/api/auth/signup-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = await response.json().catch(() => null);
    return body?.status ?? "unknown";
  }

  async function submitLogin(values: LoginValues) {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const status = await getSignupStatus(values.email);

        if (status === "pending") {
          toast.error(t("login.toasts.accessPending"));
          router.push("/pending?status=pending");
          return;
        }

        if (status === "rejected") {
          toast.error(t("login.toasts.accessRejected"));
          return;
        }

        toast.error(t("login.toasts.invalidCredentials"));
        return;
      }

      toast.success(t("login.toasts.sessionSuccess"));
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function submitSignup(values: SignupValues) {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/request-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(t("login.toasts.signupRequestSuccess"));
        signupForm.reset();
        router.push("/pending?status=pending");
        return;
      }

      const body = await response.json().catch(() => null);
      if (body?.code === "pending") {
        toast.error(t("login.toasts.accessPending"));
        router.push("/pending?status=pending");
        return;
      }

      if (body?.code === "rejected") {
        toast.error(t("login.toasts.accessRejected"));
        return;
      }

      if (body?.code === "approved") {
        toast.error(t("login.toasts.signupAlreadyApproved"));
        setMode("login");
        return;
      }

      toast.error(typeof body?.error === "string" ? body.error : t("login.toasts.signupRequestError"));
    } finally {
      setLoading(false);
    }
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

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-stroke bg-background/40 p-2">
        <button
          type="button"
          className={`rounded-lg px-4 py-3 text-sm font-medium transition ${mode === "login" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("login")}
        >
          {t("login.loginTab")}
        </button>
        <button
          type="button"
          className={`rounded-lg px-4 py-3 text-sm font-medium transition ${mode === "register" ? "bg-accent text-background" : "text-muted hover:bg-panel-soft hover:text-text"}`}
          onClick={() => setMode("register")}
        >
          {t("login.registerTab")}
        </button>
      </div>

      {mode === "login" ? (
        <form className="space-y-5" onSubmit={loginForm.handleSubmit(submitLogin)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.emailLabel")}</label>
            <Input placeholder={t("login.emailPlaceholder")} {...loginForm.register("email")} />
            {loginForm.formState.errors.email ? (
              <p className="text-sm text-danger">{loginForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.passwordLabel")}</label>
            <Input type="password" placeholder={t("login.passwordPlaceholder")} {...loginForm.register("password")} />
            {loginForm.formState.errors.password ? (
              <p className="text-sm text-danger">{loginForm.formState.errors.password.message}</p>
            ) : (
              <p className="text-sm text-muted">{t("login.passwordHint")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {t("login.submitLogin")}
          </Button>
        </form>
      ) : (
        <form className="space-y-5" onSubmit={signupForm.handleSubmit(submitSignup)}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.nameLabel")}</label>
            <Input placeholder={t("login.namePlaceholder")} {...signupForm.register("name")} />
            {signupForm.formState.errors.name ? (
              <p className="text-sm text-danger">{signupForm.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.emailLabel")}</label>
            <Input placeholder={t("login.emailPlaceholder")} {...signupForm.register("email")} />
            {signupForm.formState.errors.email ? (
              <p className="text-sm text-danger">{signupForm.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">{t("login.passwordLabel")}</label>
            <Input type="password" placeholder={t("login.passwordPlaceholder")} {...signupForm.register("password")} />
            {signupForm.formState.errors.password ? (
              <p className="text-sm text-danger">{signupForm.formState.errors.password.message}</p>
            ) : (
              <p className="text-sm text-muted">{t("login.registerHint")}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {t("login.submitSignup")}
          </Button>
        </form>
      )}
    </Card>
  );
}
