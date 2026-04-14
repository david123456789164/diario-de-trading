const requiredServerEnv = ["SUPABASE_SERVICE_ROLE_KEY", "PENDING_SIGNUP_SECRET"] as const;

export function getServerEnv() {
  const env = {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PENDING_SIGNUP_SECRET: process.env.PENDING_SIGNUP_SECRET,
    ADMIN_EMAILS: process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "",
  };

  const missing = requiredServerEnv.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno server obligatorias: ${missing.join(", ")}. Revisa tu .env.local.`,
    );
  }

  if (env.PENDING_SIGNUP_SECRET && env.PENDING_SIGNUP_SECRET.length < 32) {
    throw new Error("PENDING_SIGNUP_SECRET debe tener al menos 32 caracteres.");
  }

  return env as {
    SUPABASE_SERVICE_ROLE_KEY: string;
    PENDING_SIGNUP_SECRET: string;
    ADMIN_EMAILS: string;
  };
}

export function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
