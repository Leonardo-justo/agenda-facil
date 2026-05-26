"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, Check, Clock, LayoutDashboard, ShieldCheck, Sparkles, Store } from "lucide-react";
import { agendaPlans } from "@/lib/agenda-store";
import { money } from "@/lib/format";

const segments = ["Barbearias", "Saloes", "Esmalterias", "Petshops", "Estetica"];

export function MarketingSite() {
  return (
    <main className="min-h-screen bg-[#f7faf5] text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3 font-black">
            <span className="grid size-10 place-items-center rounded-card bg-brand text-white">
              <CalendarCheck size={21} />
            </span>
            Agenda Facil
          </Link>
          <nav className="flex items-center gap-2 text-sm font-black max-md:hidden">
            <a className="px-3 py-2 text-muted" href="#recursos">Recursos</a>
            <a className="px-3 py-2 text-muted" href="#planos">Planos</a>
            <a className="px-3 py-2 text-muted" href="#lgpd">LGPD</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link className="rounded-card border border-line px-4 py-2 text-sm font-black" href="/login">Entrar</Link>
            <Link className="inline-flex items-center gap-2 rounded-card bg-brand px-4 py-2 text-sm font-black text-white" href="/cadastro">
              Cadastrar <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl grid-cols-[minmax(0,1fr)_480px] items-center gap-10 px-6 py-12 max-lg:grid-cols-1">
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {segments.map((segment) => (
              <span key={segment} className="rounded-full border border-line bg-white px-3 py-1 text-xs font-black text-muted">
                {segment}
              </span>
            ))}
          </div>
          <h1 className="max-w-4xl text-7xl font-black leading-[0.92] tracking-tight max-md:text-4xl">
            Sua agenda online pronta para vender mais horarios.
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-muted">
            O cliente agenda pelo link, a loja acompanha tudo no painel e voce reduz conversa perdida no WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="inline-flex min-h-12 items-center gap-2 rounded-card bg-brand px-5 font-black text-white" href="/cadastro">
              Comecar agora <ArrowRight size={18} />
            </Link>
            <Link className="inline-flex min-h-12 items-center rounded-card border border-line bg-white px-5 font-black" href="/agenda/studio-aurora">
              Ver agenda demo
            </Link>
          </div>
          <div className="mt-9 grid max-w-3xl grid-cols-3 gap-3 max-md:grid-cols-1">
            <Proof value="30" label="agendamentos no plano gratuito" />
            <Proof value="7 dias" label="para configurar e testar" />
            <Proof value="12 meses" label="com melhor desconto" />
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-6 -top-6 hidden rounded-card bg-rust px-4 py-3 text-sm font-black text-white shadow-soft lg:block">
            Novo horario recebido
          </div>
          <div className="rounded-card border border-line bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-brand">Dashboard da loja</p>
                <h2 className="text-2xl font-black">Studio Aurora</h2>
              </div>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand">online</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniMetric icon={<Clock size={18} />} label="Hoje" value="8 horarios" />
              <MiniMetric icon={<Store size={18} />} label="Mes" value="126 reservas" />
            </div>
            <div className="mt-4 grid gap-3">
              {["09:30 Corte masculino", "11:00 Manicure", "14:30 Banho e tosa", "16:00 Sobrancelha"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-card border border-line p-3">
                  <span className="font-bold">{item}</span>
                  <Check className="text-brand" size={18} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="border-y border-line bg-white py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-4 px-6 max-lg:grid-cols-1">
          <Feature icon={<LayoutDashboard />} title="Painel da loja" text="Agenda diaria, servicos, profissionais, link publico e resumo de receita prevista." />
          <Feature icon={<Sparkles />} title="Cadastro guiado" text="Wizard para criar usuario, senha, dados da loja, logo, plano e aceite LGPD." />
          <Feature icon={<ShieldCheck />} title="Pronto para LGPD" text="Consentimento registrado, uso claro de dados e estrutura preparada para politica de privacidade." />
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-7 flex items-end justify-between gap-4 max-md:flex-col max-md:items-start">
          <div>
            <p className="text-xs font-black uppercase text-brand">Planos</p>
            <h2 className="text-4xl font-black">Comece gratis, venda o anual.</h2>
          </div>
          <p className="max-w-xl font-semibold text-muted">O plano de 12 meses tem o melhor preco efetivo e cria previsibilidade de receita.</p>
        </div>
        <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
          {agendaPlans.map((plan) => (
            <article key={plan.id} className={`rounded-card border p-5 ${plan.highlighted ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
              <p className={`text-sm font-black ${plan.highlighted ? "text-white/80" : "text-muted"}`}>{plan.name}</p>
              <strong className="mt-3 block text-4xl font-black">{money(plan.price)}</strong>
              <p className={`mt-3 min-h-16 text-sm font-semibold ${plan.highlighted ? "text-white/85" : "text-muted"}`}>{plan.description}</p>
              <Link
                className={`mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-card font-black ${
                  plan.highlighted ? "bg-white text-brand" : "bg-ink text-white"
                }`}
                href={`/cadastro?plano=${plan.id}`}
              >
                Escolher plano
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="lgpd" className="bg-ink px-6 py-14 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 max-lg:flex-col max-lg:items-start">
          <div>
            <p className="text-xs font-black uppercase text-white/60">Privacidade</p>
            <h2 className="mt-2 text-4xl font-black">Dados tratados com clareza desde o cadastro.</h2>
            <p className="mt-3 max-w-3xl font-semibold text-white/70">
              O fluxo registra aceite LGPD, informa uso de dados para operacao da agenda e prepara a base para politica de privacidade.
            </p>
          </div>
          <Link className="inline-flex min-h-12 items-center rounded-card bg-white px-5 font-black text-ink" href="/cadastro">
            Criar minha conta
          </Link>
        </div>
      </section>
    </main>
  );
}

function Proof({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <strong className="text-2xl font-black">{value}</strong>
      <p className="mt-1 text-sm font-bold text-muted">{label}</p>
    </div>
  );
}

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-canvas p-4">
      <div className="mb-3 text-brand">{icon}</div>
      <p className="text-sm font-bold text-muted">{label}</p>
      <strong className="text-xl font-black">{value}</strong>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-card border border-line bg-canvas p-5">
      <div className="mb-4 text-brand">{icon}</div>
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 font-semibold text-muted">{text}</p>
    </article>
  );
}
