const requiredPublicEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;

export function getPublicEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };

  const missing = requiredPublicEnv.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(", ")}. Revisa tu archivo .env.local.`,
    );
  }

  return env as {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_APP_URL: string;
  };
}

