"use client";

import { hasSupabaseConfig, supabase } from "@/lib/supabase";

const AUTH_KEY = "agenda-facil-auth-accounts";
const SESSION_KEY = "agenda-facil-auth-session";

type AuthRole = "platform" | "store";
type AuthSession = {
  email: string;
  role: AuthRole;
  signedInAt: string;
};

type AuthAccount = {
  email: string;
  passwordHash: string;
  role: AuthRole;
  ownerName: string;
  businessSlug?: string;
  createdAt: string;
};

const platformAccount = {
  email: "dono@agenda.local",
  password: "admin123",
  role: "platform" as const,
  path: "/interno",
};

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function readAccounts(): AuthAccount[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(AUTH_KEY);
  return stored ? (JSON.parse(stored) as AuthAccount[]) : [];
}

function writeAccounts(accounts: AuthAccount[]) {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(accounts));
}

export async function saveStoreAccount(input: { email: string; password: string; ownerName: string; businessSlug: string }) {
  const email = input.email.trim().toLowerCase();

  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: input.ownerName,
          business_slug: input.businessSlug,
          role: "store_owner",
        },
      },
    });
    if (error) throw new Error(error.message);
  }

  const accounts = readAccounts().filter((account) => account.email !== email);
  accounts.push({
    email,
    passwordHash: await hashPassword(input.password),
    role: "store",
    ownerName: input.ownerName,
    businessSlug: input.businessSlug,
    createdAt: new Date().toISOString(),
  });
  writeAccounts(accounts);
  setSession({ email, role: "store" });
}

export function setSession(input: { email: string; role: AuthRole }) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify({ ...input, signedInAt: new Date().toISOString() }));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getLocalSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(SESSION_KEY);
  return stored ? (JSON.parse(stored) as AuthSession) : null;
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  if (hasSupabaseConfig && supabase) {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (user?.email) {
      const role: AuthRole = user.user_metadata?.role === "platform_admin" ? "platform" : "store";
      const session = { email: user.email, role, signedInAt: new Date().toISOString() };
      setSession(session);
      return session;
    }
  }

  return getLocalSession();
}

export async function validateLogin(emailInput: string, password: string) {
  const email = emailInput.trim().toLowerCase();

  if (email === platformAccount.email && password === platformAccount.password) {
    setSession({ email, role: "platform" });
    return { ok: true, path: platformAccount.path };
  }

  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setSession({ email, role: "store" });
      return { ok: true, path: "/painel" };
    }
  }

  const account = readAccounts().find((item) => item.email === email);
  if (!account) return { ok: false, error: "Conta nao encontrada." };

  const passwordHash = await hashPassword(password);
  if (account.passwordHash !== passwordHash) return { ok: false, error: "Senha invalida." };

  setSession({ email, role: account.role });
  return { ok: true, path: account.role === "store" ? "/painel" : "/interno" };
}

export async function signInWithGoogle() {
  if (!hasSupabaseConfig || !supabase) {
    return { ok: false, error: "Login com Google preparado. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY para ativar." };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/painel`,
    },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(emailInput: string) {
  const email = emailInput.trim().toLowerCase();
  if (!email) return { ok: false, error: "Informe o e-mail para recuperar a senha." };

  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "Enviamos um link de recuperacao para o e-mail informado." };
  }

  const account = readAccounts().find((item) => item.email === email);
  if (!account && email !== platformAccount.email) return { ok: false, error: "Conta nao encontrada." };
  return { ok: true, message: "Recuperacao preparada. Em producao, o Supabase enviara o e-mail automaticamente." };
}

export async function signOut() {
  if (hasSupabaseConfig && supabase) {
    await supabase.auth.signOut();
  }
  clearSession();
}
