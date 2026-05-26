"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AppShell, ButtonLink, EmptyState, MetricCard, Panel, PrimaryButton } from "@/components/ui/AppShell";
import { displayDate, money, todayInput, whatsappLink } from "@/lib/format";
import { agendaPlans, getPlan, useAgendaStore } from "@/lib/agenda-store";
import type { AppointmentStatus, PaymentProvider, PlanCycle } from "@/types/agenda";

type Section = "dashboard" | "appointments" | "services" | "staff" | "settings" | "billing";

export function ClientPanel() {
  const store = useAgendaStore();
  const [section, setSection] = useState<Section>("dashboard");
  const [filterDate, setFilterDate] = useState(todayInput());

  const nav = [
    { label: "Dashboard", active: section === "dashboard", onClick: () => setSection("dashboard") },
    { label: "Agenda", active: section === "appointments", onClick: () => setSection("appointments") },
    { label: "Servicos", active: section === "services", onClick: () => setSection("services") },
    { label: "Equipe", active: section === "staff", onClick: () => setSection("staff") },
    { label: "Dados da loja", active: section === "settings", onClick: () => setSection("settings") },
    { label: "Plano", active: section === "billing", onClick: () => setSection("billing") },
  ];

  return (
    <AppShell
      eyebrow="Agenda Facil"
      title={store.business.name}
      nav={nav}
      action={<Link className="rounded-card border border-line px-4 py-3 text-center font-black" href="/login">Sair</Link>}
    >
      <header className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <p className="font-bold text-muted">Painel da loja</p>
          <h2 className="text-5xl font-black tracking-tight max-md:text-3xl">{sectionTitle(section)}</h2>
        </div>
        <ButtonLink href={`/agenda/${store.business.slug}`}>Abrir agendamento</ButtonLink>
      </header>

      {section === "dashboard" && <Dashboard store={store} />}
      {section === "appointments" && <Appointments store={store} filterDate={filterDate} setFilterDate={setFilterDate} />}
      {section === "services" && <Services store={store} />}
      {section === "staff" && <Staff store={store} />}
      {section === "settings" && <Settings store={store} />}
      {section === "billing" && <Billing store={store} />}
    </AppShell>
  );
}

function sectionTitle(section: Section) {
  return {
    dashboard: "Dashboard",
    appointments: "Agenda",
    services: "Servicos",
    staff: "Equipe",
    settings: "Dados da loja",
    billing: "Plano e pagamento",
  }[section];
}

function Dashboard({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  const nextAppointments = useMemo(
    () => [...store.appointments].sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)).slice(0, 5),
    [store.appointments],
  );

  return (
    <>
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        <MetricCard label="Hoje" value={store.metrics.todayAppointments} />
        <MetricCard label="Mes" value={store.metrics.monthAppointments} />
        <MetricCard label="Receita prevista" value={money(store.metrics.revenue)} tone="green" />
        <MetricCard label="Plano" value={getPlan(store.business.plan).name} tone="rust" />
      </div>
      <div className="mt-4 grid grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] gap-4 max-lg:grid-cols-1">
        <Panel>
          <h3 className="mb-4 text-lg font-black">Proximos horarios</h3>
          <div className="grid gap-3">
            {nextAppointments.map((appointment) => (
              <AppointmentMini key={appointment.id} store={store} appointmentId={appointment.id} />
            ))}
          </div>
        </Panel>
        <Panel>
          <h3 className="mb-4 text-lg font-black">Resumo por profissional</h3>
          <div className="grid gap-3">
            {store.staff.map((person) => (
              <div key={person.id} className="rounded-card border border-line p-3">
                <strong>{person.name}</strong>
                <p className="text-sm text-muted">{store.appointments.filter((item) => item.staffId === person.id).length} horarios registrados</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

function AppointmentMini({ store, appointmentId }: { store: ReturnType<typeof useAgendaStore>; appointmentId: string }) {
  const appointment = store.appointments.find((item) => item.id === appointmentId);
  if (!appointment) return null;
  const service = store.services.find((item) => item.id === appointment.serviceId);
  return (
    <div className="flex items-start justify-between gap-3 rounded-card border border-line p-3">
      <div>
        <strong>
          {displayDate(appointment.date)} as {appointment.time}
        </strong>
        <p className="text-sm text-muted">
          {appointment.client} - {service?.name ?? "Servico"}
        </p>
      </div>
      <span className="rounded-full bg-brand px-3 py-1 text-xs font-black text-white">{appointment.status}</span>
    </div>
  );
}

function Appointments({
  store,
  filterDate,
  setFilterDate,
}: {
  store: ReturnType<typeof useAgendaStore>;
  filterDate: string;
  setFilterDate: (value: string) => void;
}) {
  const [date, setDate] = useState(todayInput());
  const [serviceId, setServiceId] = useState(store.activeServices[0]?.id ?? "");
  const [staffId, setStaffId] = useState(store.activeStaff[0]?.id ?? "");
  const slots = store.availableSlots(date, staffId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.addAppointment({
      client: String(form.get("client")),
      phone: String(form.get("phone")),
      serviceId,
      staffId,
      date,
      time: String(form.get("time")),
      source: "owner",
    });
    event.currentTarget.reset();
  }

  const filtered = store.appointments.filter((appointment) => !filterDate || appointment.date === filterDate);

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-4 max-lg:grid-cols-1">
      <Panel>
        <h3 className="mb-4 text-lg font-black">Novo agendamento</h3>
        <form onSubmit={submit} className="grid gap-3">
          <label>
            Cliente
            <input name="client" required />
          </label>
          <label>
            WhatsApp
            <input name="phone" required />
          </label>
          <label>
            Servico
            <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
              {store.activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Profissional
            <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
              {store.activeStaff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              Data
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label>
              Horario
              <select name="time" required>
                {slots.map((slot) => (
                  <option key={slot}>{slot}</option>
                ))}
              </select>
            </label>
          </div>
          <PrimaryButton>Salvar horario</PrimaryButton>
        </form>
      </Panel>
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">Agenda</h3>
          <input className="max-w-44" type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="border-b border-line p-3">Data</th>
                <th className="border-b border-line p-3">Cliente</th>
                <th className="border-b border-line p-3">Servico</th>
                <th className="border-b border-line p-3">Status</th>
                <th className="border-b border-line p-3">Contato</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appointment) => {
                const service = store.services.find((item) => item.id === appointment.serviceId);
                const message = `Ola ${appointment.client}, seu horario de ${service?.name ?? "servico"} esta marcado para ${displayDate(appointment.date)} as ${appointment.time}.`;
                return (
                  <tr key={appointment.id}>
                    <td className="border-b border-line p-3">
                      <strong>{displayDate(appointment.date)}</strong>
                      <p className="text-sm text-muted">{appointment.time}</p>
                    </td>
                    <td className="border-b border-line p-3">{appointment.client}</td>
                    <td className="border-b border-line p-3">{service?.name ?? "Servico"}</td>
                    <td className="border-b border-line p-3">
                      <select
                        value={appointment.status}
                        onChange={(event) => store.updateAppointmentStatus(appointment.id, event.target.value as AppointmentStatus)}
                      >
                        <option value="scheduled">Agendado</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="done">Concluido</option>
                        <option value="canceled">Cancelado</option>
                      </select>
                    </td>
                    <td className="border-b border-line p-3">
                      <a className="font-black text-brand" href={whatsappLink(appointment.phone, message)} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Services({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.addService({
      name: String(form.get("name")),
      duration: Number(form.get("duration")),
      price: Number(form.get("price")),
    });
    event.currentTarget.reset();
  }

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-4 max-lg:grid-cols-1">
      <Panel>
        <h3 className="mb-4 text-lg font-black">Novo servico</h3>
        <form onSubmit={submit} className="grid gap-3">
          <label>
            Nome
            <input name="name" required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              Duracao
              <input name="duration" type="number" min={15} step={15} defaultValue={45} />
            </label>
            <label>
              Preco
              <input name="price" type="number" min={0} step="0.01" defaultValue="0.00" />
            </label>
          </div>
          <PrimaryButton>Salvar servico</PrimaryButton>
        </form>
      </Panel>
      <Panel>
        <h3 className="mb-4 text-lg font-black">Servicos cadastrados</h3>
        <div className="grid gap-3">
          {store.services.map((service) => (
            <div key={service.id} className="flex items-center justify-between gap-3 rounded-card border border-line p-3">
              <div>
                <strong>{service.name}</strong>
                <p className="text-sm text-muted">
                  {service.duration} min - {money(service.price)}
                </p>
              </div>
              <button className="rounded-card bg-brand px-3 py-2 text-sm font-black text-white" onClick={() => store.toggleService(service.id)}>
                {service.active ? "Pausar" : "Ativar"}
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Staff({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.addStaff({ name: String(form.get("name")), role: String(form.get("role")) });
    event.currentTarget.reset();
  }

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-4 max-lg:grid-cols-1">
      <Panel>
        <h3 className="mb-4 text-lg font-black">Novo profissional</h3>
        <form onSubmit={submit} className="grid gap-3">
          <label>
            Nome
            <input name="name" required />
          </label>
          <label>
            Especialidade
            <input name="role" required />
          </label>
          <PrimaryButton>Salvar profissional</PrimaryButton>
        </form>
      </Panel>
      <Panel>
        <h3 className="mb-4 text-lg font-black">Equipe</h3>
        <div className="grid gap-3">
          {store.staff.map((person) => (
            <div key={person.id} className="flex items-center justify-between gap-3 rounded-card border border-line p-3">
              <div>
                <strong>{person.name}</strong>
                <p className="text-sm text-muted">{person.role}</p>
              </div>
              <button className="rounded-card bg-brand px-3 py-2 text-sm font-black text-white" onClick={() => store.toggleStaff(person.id)}>
                {person.active ? "Pausar" : "Ativar"}
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Settings({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    store.updateBusiness({
      ownerName: String(form.get("ownerName")),
      ownerEmail: String(form.get("ownerEmail")),
      name: String(form.get("name")),
      document: String(form.get("document")),
      category: String(form.get("category")),
      slug: String(form.get("slug")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      logoUrl: String(form.get("logoUrl")),
      open: String(form.get("open")),
      close: String(form.get("close")),
    });
  }

  const publicLink = typeof window === "undefined" ? `/agenda/${store.business.slug}` : `${window.location.origin}/agenda/${store.business.slug}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_380px] gap-4 max-lg:grid-cols-1">
      <Panel>
        <h3 className="mb-4 text-lg font-black">Dados da loja</h3>
        <form onSubmit={submit} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label>
              Responsavel
              <input name="ownerName" defaultValue={store.business.ownerName} />
            </label>
            <label>
              E-mail
              <input name="ownerEmail" type="email" defaultValue={store.business.ownerEmail} />
            </label>
          </div>
          <label>
            Nome
            <input name="name" defaultValue={store.business.name} />
          </label>
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label>
              CNPJ/CPF
              <input name="document" defaultValue={store.business.document} />
            </label>
            <label>
              Categoria
              <input name="category" defaultValue={store.business.category} />
            </label>
          </div>
          <label>
            Slug
            <input name="slug" defaultValue={store.business.slug} />
          </label>
          <label>
            WhatsApp
            <input name="phone" defaultValue={store.business.phone} />
          </label>
          <label>
            Endereco
            <input name="address" defaultValue={store.business.address} />
          </label>
          <label>
            Logo
            <input name="logoUrl" defaultValue={store.business.logoUrl} placeholder="URL da imagem" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              Abre
              <input name="open" type="time" defaultValue={store.business.open} />
            </label>
            <label>
              Fecha
              <input name="close" type="time" defaultValue={store.business.close} />
            </label>
          </div>
          <PrimaryButton>Salvar dados</PrimaryButton>
        </form>
      </Panel>
      <Panel>
        <h3 className="mb-4 text-lg font-black">Link para clientes</h3>
        <p className="rounded-card border border-line bg-canvas p-3 text-sm font-bold text-muted">{publicLink}</p>
        <div className="mt-4 rounded-card border border-line p-3 text-sm font-bold text-muted">
          LGPD aceito em: {store.business.lgpdAcceptedAt ? new Date(store.business.lgpdAcceptedAt).toLocaleDateString("pt-BR") : "pendente"}
        </div>
      </Panel>
    </div>
  );
}

function Billing({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  const [provider, setProvider] = useState<PaymentProvider>(store.business.paymentProvider);

  return (
    <div className="grid gap-4">
      <Panel>
        <div className="flex items-start justify-between gap-4 max-md:flex-col">
          <div>
            <h3 className="text-2xl font-black">Plano atual: {getPlan(store.business.plan).name}</h3>
            <p className="mt-1 font-semibold text-muted">
              Status: {store.business.subscriptionStatus} - cobranca por {paymentLabel(store.business.paymentProvider)}
            </p>
          </div>
          <strong className="text-3xl font-black text-brand">{money(store.business.planPrice)}</strong>
        </div>
      </Panel>
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        {agendaPlans.map((plan) => (
          <article key={plan.id} className={`rounded-card border p-5 ${plan.highlighted ? "border-brand bg-brand/10" : "border-line bg-white"}`}>
            <p className="text-sm font-black text-muted">{plan.name}</p>
            <strong className="mt-2 block text-3xl font-black">{money(plan.price)}</strong>
            <p className="mt-2 min-h-20 text-sm font-semibold text-muted">{plan.description}</p>
            <button
              type="button"
              onClick={() => store.updatePlan(plan.id as PlanCycle, provider)}
              className="mt-4 min-h-11 w-full rounded-card bg-brand px-4 font-black text-white"
            >
              Selecionar
            </button>
          </article>
        ))}
      </div>
      <Panel>
        <h3 className="mb-4 text-lg font-black">Provedor de pagamento</h3>
        <select value={provider} onChange={(event) => setProvider(event.target.value as PaymentProvider)}>
          <option value="mercado_pago">Mercado Pago</option>
          <option value="infinite_pay">InfinitePay</option>
          <option value="stripe">Stripe</option>
        </select>
        <p className="mt-3 text-sm font-bold text-muted">
          Checkout preparado para integrar com o provedor escolhido. O proximo passo e cadastrar as chaves e URLs reais.
        </p>
      </Panel>
    </div>
  );
}

function paymentLabel(provider: PaymentProvider) {
  return {
    mercado_pago: "Mercado Pago",
    infinite_pay: "InfinitePay",
    stripe: "Stripe",
  }[provider];
}
