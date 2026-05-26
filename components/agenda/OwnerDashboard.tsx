"use client";

import Link from "next/link";
import { AppShell, ButtonLink, MetricCard, Panel } from "@/components/ui/AppShell";
import { money, whatsappLink } from "@/lib/format";
import { useAgendaStore } from "@/lib/agenda-store";

export function OwnerDashboard() {
  const { business, metrics, appointments, services } = useAgendaStore();
  const publicLink = `/agenda/${business.slug}`;
  const pitch = `Ola, preparei uma agenda online para ${business.name}. O cliente agenda pelo link e voce acompanha tudo no painel.`;

  return (
    <AppShell
      eyebrow="Agenda Facil"
      title="Painel do dono"
      nav={[
        { label: "Visao geral", href: "/admin", active: true },
        { label: "Painel do cliente", href: "/painel" },
      ]}
      action={<Link className="rounded-card border border-line px-4 py-3 text-center font-black" href="/">Sair</Link>}
    >
      <header className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <p className="font-bold text-muted">Operacao comercial</p>
          <h2 className="text-5xl font-black tracking-tight max-md:text-3xl">Visao da plataforma</h2>
        </div>
        <ButtonLink href={publicLink}>Ver link publico</ButtonLink>
      </header>

      <section className="mb-4 flex items-center justify-between gap-5 rounded-card border border-brand/30 bg-brand/10 p-5 max-md:flex-col max-md:items-start">
        <div>
          <p className="text-xs font-black uppercase text-brand">Meta da semana</p>
          <h3 className="mt-1 max-w-3xl text-3xl font-black leading-tight">
            Validar com 5 negocios locais e fechar os 2 primeiros clientes pagos.
          </h3>
        </div>
        <a className="inline-flex min-h-11 items-center rounded-card bg-brand px-4 font-black text-white" href={whatsappLink(business.phone, pitch)}>
          Enviar proposta
        </a>
      </section>

      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        <MetricCard label="Clientes ativos" value={metrics.activeClients} />
        <MetricCard label="Agendamentos no mes" value={metrics.monthAppointments} />
        <MetricCard label="Receita mensal estimada" value={money(metrics.mrr)} tone="green" />
        <MetricCard label="Ticket sugerido" value={money(business.planPrice)} tone="rust" />
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-4 max-lg:grid-cols-1">
        <Panel>
          <h3 className="mb-4 text-lg font-black">Clientes da plataforma</h3>
          <article className="rounded-card border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong>{business.name}</strong>
                <p className="text-sm text-muted">
                  {appointments.length} agendamentos, {services.length} servicos cadastrados
                </p>
              </div>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-black text-white">ativo</span>
            </div>
          </article>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-lg font-black">Proximas acoes</h3>
          <div className="grid gap-3 text-sm">
            <p className="rounded-card border border-line p-3 font-bold text-muted">Enviar link demo para 10 negocios locais.</p>
            <p className="rounded-card border border-line p-3 font-bold text-muted">Oferecer setup guiado como bonus de entrada.</p>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
