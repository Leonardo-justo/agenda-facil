"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const accounts = [
  { email: "dono@agenda.local", password: "admin123", path: "/admin" },
  { email: "admin@agenda.local", password: "admin123", path: "/painel" },
];

export function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dono@agenda.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const account = accounts.find((item) => item.email === email.trim() && item.password === password);
    if (!account) {
      setError("E-mail ou senha invalidos.");
      return;
    }
    router.push(account.path);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6">
      <section className="grid w-full max-w-5xl grid-cols-[minmax(0,1fr)_380px] gap-9 rounded-card border border-line bg-white p-7 shadow-soft max-md:grid-cols-1">
        <div>
          <p className="text-xs font-black uppercase text-brand">Agenda Facil</p>
          <h1 className="mt-2 max-w-[12ch] text-6xl font-black leading-[0.95] max-md:text-4xl">
            Agenda online para negocios de servicos
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted">
            Plataforma com painel do dono, painel do cliente e link publico para agendamentos.
          </p>
        </div>
        <form onSubmit={submit} className="grid content-center gap-4">
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <button className="min-h-11 rounded-card bg-brand px-4 font-black text-white">Entrar</button>
          <p className="min-h-6 text-sm font-bold text-red-700">{error}</p>
          <div className="rounded-card border border-line bg-canvas p-3 text-sm text-muted">
            <strong className="text-ink">Demos:</strong> dono@agenda.local ou admin@agenda.local, senha admin123.
          </div>
        </form>
      </section>
    </main>
  );
}
