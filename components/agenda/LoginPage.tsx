"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { signInWithGoogle, validateLogin } from "@/lib/auth-store";

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await validateLogin(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "E-mail ou senha invalidos.");
      return;
    }
    router.push(result.path ?? "/painel");
  }

  async function googleLogin() {
    setError("");
    const result = await signInWithGoogle();
    if (!result.ok) setError(result.error ?? "Nao foi possivel entrar com Google.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <section className="grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_380px] gap-9 rounded-card border border-line bg-white p-7 shadow-soft max-md:grid-cols-1">
        <div>
          <p className="text-xs font-black uppercase text-brand">Agenda Facil</p>
          <h1 className="mt-2 max-w-[12ch] text-6xl font-black leading-[0.95] max-md:text-4xl">
            Acesse sua area
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Entre no painel interno da plataforma ou no painel da loja.
          </p>
        </div>
        <form onSubmit={submit} className="grid content-center gap-4">
          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="min-h-11 rounded-card bg-brand px-4 font-black text-white">{loading ? "Validando..." : "Entrar"}</button>
          <button type="button" onClick={googleLogin} className="min-h-11 rounded-card border border-line bg-white px-4 font-black text-ink">
            Entrar com Google
          </button>
          <p className="min-h-6 text-sm font-bold text-red-700">{error}</p>
          <div className="rounded-card border border-line bg-canvas p-3 text-sm text-muted">
            <strong className="text-ink">Area interna:</strong> dono@agenda.local com senha admin123. Lojas novas entram com o e-mail e senha cadastrados.
          </div>
        </form>
      </section>
    </main>
  );
}
