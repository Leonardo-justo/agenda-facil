"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { AppShell, ButtonLink, EmptyState, MetricCard, Panel, PrimaryButton } from "@/components/ui/AppShell";
import { displayDate, money, todayInput, whatsappLink } from "@/lib/format";
import { agendaPlans, getPlan, useAgendaStore } from "@/lib/agenda-store";
import type { Appointment, AppointmentStatus, PaymentProvider, PlanCycle, Weekday, WeeklySchedule } from "@/types/agenda";

type Section = "dashboard" | "appointments" | "services" | "staff" | "settings" | "billing";

const weekdays: Array<{ id: Weekday; label: string }> = [
  { id: "1", label: "Segunda" },
  { id: "2", label: "Terca" },
  { id: "3", label: "Quarta" },
  { id: "4", label: "Quinta" },
  { id: "5", label: "Sexta" },
  { id: "6", label: "Sabado" },
  { id: "0", label: "Domingo" },
];

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
  const [dashboardDate, setDashboardDate] = useState(todayInput());
  const [serviceFilter, setServiceFilter] = useState("all");
  const [staffFilter, setStaffFilter] = useState("all");
  const dayAppointments = useMemo(
    () =>
      store.appointments
        .filter((appointment) => {
          const byDate = appointment.date === dashboardDate;
          const byService = serviceFilter === "all" || appointment.serviceId === serviceFilter;
          const byStaff = staffFilter === "all" || appointment.staffId === staffFilter;
          return byDate && byService && byStaff;
        })
        .sort((a, b) => a.time.localeCompare(b.time)),
    [dashboardDate, serviceFilter, staffFilter, store.appointments],
  );
  const openAppointments = useMemo(
    () => dayAppointments.filter((appointment) => appointment.status !== "done" && appointment.status !== "canceled"),
    [dayAppointments],
  );
  const currentAppointment = openAppointments[0];
  const nextQueue = openAppointments.slice(1, 6);
  const completedCount = dayAppointments.filter((appointment) => appointment.status === "done").length;
  const dayRevenue = dayAppointments
    .filter((appointment) => appointment.status !== "canceled")
    .reduce((total, appointment) => total + (store.services.find((item) => item.id === appointment.serviceId)?.price ?? 0), 0);
  const filteredStaff = store.staff.filter((person) => staffFilter === "all" || person.id === staffFilter);
  const filteredServiceName = serviceFilter === "all" ? "Todos os servicos" : store.services.find((item) => item.id === serviceFilter)?.name;
  const filteredStaffName = staffFilter === "all" ? "Todos os profissionais" : store.staff.find((item) => item.id === staffFilter)?.name;

  function clearFilters() {
    setDashboardDate(todayInput());
    setServiceFilter("all");
    setStaffFilter("all");
  }

  return (
    <>
      <Panel className="mb-4 border-brand/30 bg-brand/5">
        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 max-lg:grid-cols-1">
          <div>
            <p className="font-black uppercase text-brand">Fila de atendimento</p>
            <h3 className="mt-1 text-3xl font-black max-md:text-2xl">{displayDate(dashboardDate)}</h3>
            <p className="mt-2 max-w-2xl text-sm font-bold text-muted">
              Veja quem deve ser atendido agora e mantenha a ordem do dia atualizada conforme os horarios forem confirmados, concluidos ou cancelados.
            </p>
          </div>
          <div className="grid gap-3 rounded-card border border-line bg-white p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-black uppercase text-muted">Servico</p>
                <strong>{filteredServiceName}</strong>
              </div>
              <div>
                <p className="text-xs font-black uppercase text-muted">Profissional</p>
                <strong>{filteredStaffName}</strong>
              </div>
            </div>
            <button type="button" className="min-h-11 rounded-card bg-brand px-4 font-black text-white" onClick={clearFilters}>
              Ver hoje completo
            </button>
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        <MetricCard label="Atendimentos do dia" value={dayAppointments.length} />
        <MetricCard label="Ainda na fila" value={openAppointments.length} />
        <MetricCard label="Concluidos" value={completedCount} tone="green" />
        <MetricCard label="Receita do dia" value={money(dayRevenue)} tone="rust" />
      </div>
      <Panel className="mt-4">
        <div className="grid grid-cols-[0.8fr_1fr_1fr_auto] items-end gap-3 max-xl:grid-cols-2 max-md:grid-cols-1">
          <label>
            Dia
            <input type="date" value={dashboardDate} onChange={(event) => setDashboardDate(event.target.value)} />
          </label>
          <label>
            Filtrar por servico
            <select value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)}>
              <option value="all">Todos os servicos</option>
              {store.services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Filtrar por profissional
            <select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)}>
              <option value="all">Todos os profissionais</option>
              {store.staff.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="min-h-11 rounded-card border border-line px-4 font-black" onClick={clearFilters}>
            Limpar filtros
          </button>
        </div>
      </Panel>
      <ProfessionalScheduleGrid store={store} appointments={dayAppointments} date={dashboardDate} staff={filteredStaff} />
      <div className="mt-4 grid grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] gap-4 max-lg:grid-cols-1">
        <div className="grid gap-4">
          <Panel className="border-brand/40">
            <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
              <div>
                <p className="text-xs font-black uppercase text-brand">Atendimento atual</p>
                <h3 className="text-2xl font-black">Proximo da fila</h3>
              </div>
              {currentAppointment && <StatusPill status={currentAppointment.status} />}
            </div>
            {currentAppointment ? (
              <CurrentAppointmentCard store={store} appointment={currentAppointment} />
            ) : (
              <EmptyState>Nenhum atendimento pendente para os filtros atuais.</EmptyState>
            )}
          </Panel>
          <Panel>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-black">Depois dele</h3>
              <span className="text-sm font-bold text-muted">{nextQueue.length} proximos</span>
            </div>
            <div className="grid gap-3">
              {nextQueue.length ? (
                nextQueue.map((appointment, index) => (
                  <QueueAppointment key={appointment.id} store={store} appointment={appointment} position={index + 2} />
                ))
              ) : (
                <EmptyState>Nao ha outros horarios pendentes na fila.</EmptyState>
              )}
            </div>
          </Panel>
        </div>
        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Ordem completa do dia</h3>
            <span className="text-sm font-bold text-muted">{dayAppointments.length} horarios</span>
          </div>
          <div className="grid gap-3">
            {dayAppointments.length ? (
              dayAppointments.map((appointment, index) => (
                <DayAppointmentRow key={appointment.id} store={store} appointment={appointment} position={index + 1} />
              ))
            ) : (
              <EmptyState>Nenhum horario encontrado para este dia.</EmptyState>
            )}
          </div>
          <div className="mt-5 border-t border-line pt-5">
            <h3 className="mb-4 text-lg font-black">Resumo por profissional</h3>
            <div className="grid gap-3">
              {filteredStaff.length ? (
                filteredStaff.map((person) => {
                  const personAppointments = dayAppointments.filter((item) => item.staffId === person.id);
                  const personOpen = personAppointments.filter((item) => item.status !== "done" && item.status !== "canceled").length;
                  return (
                    <div key={person.id} className="rounded-card border border-line p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <strong>{person.name}</strong>
                          <p className="text-sm text-muted">
                            {personAppointments.length} horarios no dia, {personOpen} em aberto
                          </p>
                        </div>
                        <span className="rounded-full bg-ink px-3 py-1 text-xs font-black text-white">{personOpen}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState>Nenhum profissional cadastrado.</EmptyState>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </>
  );
}

function ProfessionalScheduleGrid({
  store,
  appointments,
  date,
  staff,
}: {
  store: ReturnType<typeof useAgendaStore>;
  appointments: Appointment[];
  date: string;
  staff: ReturnType<typeof useAgendaStore>["staff"];
}) {
  const weekday = String(new Date(`${date}T00:00:00`).getDay()) as Weekday;
  const schedule = store.business.schedule[weekday];
  const slots = useMemo(() => (schedule?.enabled ? buildDashboardSlots(schedule.open, schedule.close) : []), [schedule]);
  const activeStaff = staff.filter((person) => person.active);

  return (
    <Panel className="mt-4">
      <div className="mb-4 flex items-start justify-between gap-3 max-md:flex-col">
        <div>
          <h3 className="text-lg font-black">Grade por profissional</h3>
          <p className="text-sm font-bold text-muted">Mapa de disponibilidade em tempo real por horario e profissional.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-black">
          <span className="rounded-full border border-line bg-white px-3 py-1">Livre</span>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-brand">Confirmado</span>
          <span className="rounded-full border border-rust/30 bg-rust/10 px-3 py-1 text-rust">Aguardando</span>
          <span className="rounded-full border border-ink/30 bg-ink/10 px-3 py-1 text-ink">Concluido</span>
        </div>
      </div>
      {!schedule?.enabled && <EmptyState>Loja fechada neste dia conforme horario configurado.</EmptyState>}
      {schedule?.enabled && !activeStaff.length && <EmptyState>Nenhum profissional ativo encontrado para a grade.</EmptyState>}
      {schedule?.enabled && activeStaff.length > 0 && (
        <div className="overflow-x-auto">
          <div className="min-w-[820px]">
            <div
              className="grid border-b border-line text-sm font-black"
              style={{ gridTemplateColumns: `88px repeat(${activeStaff.length}, minmax(180px, 1fr))` }}
            >
              <div className="sticky left-0 z-10 bg-white p-3 text-muted">Horario</div>
              {activeStaff.map((person) => (
                <div key={person.id} className="p-3">
                  <strong>{person.name}</strong>
                  <p className="text-xs font-bold text-muted">{person.role}</p>
                </div>
              ))}
            </div>
            <div className="grid">
              {slots.map((slot) => (
                <div
                  key={slot}
                  className="grid border-b border-line last:border-b-0"
                  style={{ gridTemplateColumns: `88px repeat(${activeStaff.length}, minmax(180px, 1fr))` }}
                >
                  <div className="sticky left-0 z-10 flex items-center bg-white p-3 font-black">{slot}</div>
                  {activeStaff.map((person) => (
                    <ScheduleCell key={`${person.id}-${slot}`} store={store} appointments={appointments} staffId={person.id} slot={slot} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}

function ScheduleCell({
  store,
  appointments,
  staffId,
  slot,
}: {
  store: ReturnType<typeof useAgendaStore>;
  appointments: Appointment[];
  staffId: string;
  slot: string;
}) {
  const appointment = appointments.find((item) => item.staffId === staffId && item.time === slot);
  const continuation = appointments.find((item) => {
    if (item.staffId !== staffId || item.status === "canceled" || item.time === slot) return false;
    const service = store.services.find((serviceItem) => serviceItem.id === item.serviceId);
    const start = timeToMinutes(item.time);
    const end = start + (service?.duration ?? 30);
    const current = timeToMinutes(slot);
    return current > start && current < end;
  });

  if (appointment) {
    const service = store.services.find((item) => item.id === appointment.serviceId);
    return (
      <div className={`min-h-20 p-2 ${scheduleCellClass(appointment.status)}`}>
        <div className="rounded-card border border-current/20 bg-white/70 p-3">
          <div className="flex items-start justify-between gap-2">
            <strong className="text-sm">{appointment.client}</strong>
            <StatusPill status={appointment.status} />
          </div>
          <p className="mt-1 text-xs font-bold text-muted">
            {service?.name ?? "Servico"} - {service?.duration ?? 30} min
          </p>
        </div>
      </div>
    );
  }

  if (continuation) {
    const service = store.services.find((item) => item.id === continuation.serviceId);
    return (
      <div className="min-h-20 bg-ink/5 p-2 text-xs font-bold text-muted">
        <div className="rounded-card border border-dashed border-line p-3">
          Ocupado por {continuation.client}
          <p>{service?.name ?? "Servico"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-20 p-2">
      <div className="flex h-full items-center justify-center rounded-card border border-dashed border-line text-sm font-black text-muted">
        Livre
      </div>
    </div>
  );
}

function buildDashboardSlots(open: string, close: string) {
  const result: string[] = [];
  let current = timeToMinutes(open);
  const end = timeToMinutes(close);
  while (current < end) {
    result.push(minutesToTime(current));
    current += 30;
  }
  return result;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function scheduleCellClass(status: AppointmentStatus) {
  return {
    scheduled: "bg-rust/10",
    confirmed: "bg-brand/10",
    done: "bg-ink/10",
    canceled: "bg-red-50",
  }[status];
}

function CurrentAppointmentCard({ store, appointment }: { store: ReturnType<typeof useAgendaStore>; appointment: Appointment }) {
  const service = store.services.find((item) => item.id === appointment.serviceId);
  const staff = store.staff.find((item) => item.id === appointment.staffId);
  const message = appointmentMessage(appointment, service?.name ?? "servico", store.business.name);

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 max-md:grid-cols-1">
        <div className="flex min-h-28 flex-col items-center justify-center rounded-card bg-ink p-4 text-center text-white">
          <span className="text-sm font-black uppercase">Horario</span>
          <strong className="text-4xl font-black">{appointment.time}</strong>
        </div>
        <div className="grid content-center gap-2">
          <h4 className="text-3xl font-black max-md:text-2xl">{appointment.client}</h4>
          <p className="text-muted">
            {service?.name ?? "Servico"} com {staff?.name ?? "profissional"}
          </p>
          <p className="text-sm font-bold text-muted">Origem: {appointment.source === "public" ? "Agendamento publico" : "Criado pela loja"}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <AppointmentActions store={store} appointment={appointment} message={message} />
      </div>
    </div>
  );
}

function QueueAppointment({
  store,
  appointment,
  position,
}: {
  store: ReturnType<typeof useAgendaStore>;
  appointment: Appointment;
  position: number;
}) {
  const service = store.services.find((item) => item.id === appointment.serviceId);
  const staff = store.staff.find((item) => item.id === appointment.staffId);
  const message = appointmentMessage(appointment, service?.name ?? "servico", store.business.name);

  return (
    <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-card border border-line p-3 max-md:grid-cols-[48px_minmax(0,1fr)]">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-lg font-black text-brand">{position}</div>
      <div>
        <strong>
          {appointment.time} - {appointment.client}
        </strong>
        <p className="text-sm text-muted">
          {service?.name ?? "Servico"} com {staff?.name ?? "profissional"}
        </p>
      </div>
      <div className="flex flex-wrap justify-end gap-2 max-md:col-span-2 max-md:justify-start">
        <StatusPill status={appointment.status} />
        <a className="rounded-card border border-line px-3 py-2 text-sm font-black" href={whatsappLink(appointment.phone, message)} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
    </div>
  );
}

function DayAppointmentRow({
  store,
  appointment,
  position,
}: {
  store: ReturnType<typeof useAgendaStore>;
  appointment: Appointment;
  position: number;
}) {
  const service = store.services.find((item) => item.id === appointment.serviceId);
  const staff = store.staff.find((item) => item.id === appointment.staffId);
  return (
    <div className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-card border border-line p-3 max-md:grid-cols-[40px_minmax(0,1fr)]">
      <span className="flex size-10 items-center justify-center rounded-full bg-paper text-sm font-black">{position}</span>
      <div>
        <strong>
          {appointment.time} - {appointment.client}
        </strong>
        <p className="text-sm text-muted">
          {service?.name ?? "Servico"} / {staff?.name ?? "profissional"}
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 max-md:col-span-2 max-md:justify-start">
        <StatusPill status={appointment.status} />
        {appointment.status !== "done" && appointment.status !== "canceled" && (
          <button
            type="button"
            className="rounded-card border border-line px-3 py-2 text-sm font-black"
            onClick={() => store.updateAppointmentStatus(appointment.id, "done")}
          >
            Concluir
          </button>
        )}
      </div>
    </div>
  );
}

function AppointmentActions({
  store,
  appointment,
  message,
}: {
  store: ReturnType<typeof useAgendaStore>;
  appointment: Appointment;
  message: string;
}) {
  const isOpen = appointment.status !== "done" && appointment.status !== "canceled";

  return (
    <>
      {appointment.status === "scheduled" && (
        <button
          type="button"
          className="min-h-11 rounded-card bg-brand px-4 font-black text-white"
          onClick={() => store.updateAppointmentStatus(appointment.id, "confirmed")}
        >
          Confirmar
        </button>
      )}
      {isOpen && (
        <button
          type="button"
          className="min-h-11 rounded-card bg-ink px-4 font-black text-white"
          onClick={() => store.updateAppointmentStatus(appointment.id, "done")}
        >
          Concluir atendimento
        </button>
      )}
      {isOpen && (
        <button
          type="button"
          className="min-h-11 rounded-card border border-line px-4 font-black"
          onClick={() => store.updateAppointmentStatus(appointment.id, "canceled")}
        >
          Cancelar
        </button>
      )}
      <a className="inline-flex min-h-11 items-center rounded-card border border-line px-4 font-black" href={whatsappLink(appointment.phone, message)} target="_blank" rel="noreferrer">
        WhatsApp
      </a>
    </>
  );
}

function StatusPill({ status }: { status: AppointmentStatus }) {
  const classes = {
    scheduled: "bg-rust/10 text-rust border-rust/30",
    confirmed: "bg-brand/10 text-brand border-brand/30",
    done: "bg-ink/10 text-ink border-ink/30",
    canceled: "bg-red-50 text-red-700 border-red-200",
  }[status];

  return <span className={`rounded-full border px-3 py-1 text-xs font-black ${classes}`}>{statusLabel(status)}</span>;
}

function statusLabel(status: AppointmentStatus) {
  return {
    scheduled: "Aguardando",
    confirmed: "Confirmado",
    done: "Concluido",
    canceled: "Cancelado",
  }[status];
}

function appointmentMessage(appointment: Appointment, serviceName: string, businessName: string) {
  return `Ola ${appointment.client}, seu horario de ${serviceName} na ${businessName} esta marcado para ${displayDate(appointment.date)} as ${appointment.time}.`;
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
  const slots = store.availableSlots(date, staffId, serviceId);
  const canCreateAppointment = store.activeServices.length > 0 && store.activeStaff.length > 0;

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
      status: store.business.confirmationMode === "automatic" ? "confirmed" : "scheduled",
    });
    event.currentTarget.reset();
  }

  const filtered = store.appointments.filter((appointment) => !filterDate || appointment.date === filterDate);

  return (
    <div className="grid grid-cols-[360px_minmax(0,1fr)] gap-4 max-lg:grid-cols-1">
      <Panel>
        <h3 className="mb-4 text-lg font-black">Novo agendamento</h3>
        {!canCreateAppointment && <EmptyState>Cadastre pelo menos um servico e um profissional antes de criar horarios.</EmptyState>}
        <form onSubmit={submit} className="mt-3 grid gap-3">
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
                {slots.length ? slots.map((slot) => <option key={slot}>{slot}</option>) : <option value="">Sem horarios</option>}
              </select>
            </label>
          </div>
          <PrimaryButton disabled={!canCreateAppointment}>Salvar horario</PrimaryButton>
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
                        <option value="scheduled">Aguardando confirmacao</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="done">Concluido</option>
                        <option value="canceled">Cancelado</option>
                      </select>
                    </td>
                    <td className="border-b border-line p-3">
                      <a className="font-black text-brand" href={whatsappLink(appointment.phone, message)} target="_blank" rel="noreferrer">
                        WhatsApp
                      </a>
                      {appointment.status === "scheduled" && (
                        <button
                          type="button"
                          className="ml-3 font-black text-brand"
                          onClick={() => store.updateAppointmentStatus(appointment.id, "confirmed")}
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td className="border-b border-line p-3 text-sm font-bold text-muted" colSpan={5}>
                    Nenhum agendamento encontrado para o filtro atual.
                  </td>
                </tr>
              )}
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
          {store.services.length ? (
            store.services.map((service) => (
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
            ))
          ) : (
            <EmptyState>Nenhum servico cadastrado.</EmptyState>
          )}
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
          {store.staff.length ? (
            store.staff.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3 rounded-card border border-line p-3">
                <div>
                  <strong>{person.name}</strong>
                  <p className="text-sm text-muted">{person.role}</p>
                </div>
                <button className="rounded-card bg-brand px-3 py-2 text-sm font-black text-white" onClick={() => store.toggleStaff(person.id)}>
                  {person.active ? "Pausar" : "Ativar"}
                </button>
              </div>
            ))
          ) : (
            <EmptyState>Nenhum profissional cadastrado.</EmptyState>
          )}
        </div>
      </Panel>
    </div>
  );
}

function Settings({ store }: { store: ReturnType<typeof useAgendaStore> }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const schedule = weekdays.reduce((acc, day) => {
      acc[day.id] = {
        enabled: form.get(`day-${day.id}`) === "on",
        open: String(form.get(`open-${day.id}`) || store.business.open),
        close: String(form.get(`close-${day.id}`) || store.business.close),
        breakStart: String(form.get(`breakStart-${day.id}`) || "00:00"),
        breakEnd: String(form.get(`breakEnd-${day.id}`) || "00:00"),
      };
      return acc;
    }, {} as WeeklySchedule);
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
      schedule,
      confirmationMode: String(form.get("confirmationMode")) as "manual" | "automatic",
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
          <label>
            Confirmacao de agendamento
            <select name="confirmationMode" defaultValue={store.business.confirmationMode}>
              <option value="manual">Manual: cliente solicita e a loja confirma</option>
              <option value="automatic">Automatica: horario ja entra confirmado</option>
            </select>
          </label>
          <div>
            <h4 className="mb-3 text-sm font-black text-ink">Horarios por dia</h4>
            <div className="grid gap-3">
              {weekdays.map((day) => {
                const item = store.business.schedule?.[day.id];
                return (
                  <div key={day.id} className="grid grid-cols-[130px_repeat(4,minmax(0,1fr))] items-end gap-2 rounded-card border border-line p-3 max-lg:grid-cols-2">
                    <label className="flex-row items-center gap-2 text-ink">
                      <input className="w-auto" type="checkbox" name={`day-${day.id}`} defaultChecked={item?.enabled} />
                      {day.label}
                    </label>
                    <label>
                      Abre
                      <input name={`open-${day.id}`} type="time" defaultValue={item?.open ?? store.business.open} />
                    </label>
                    <label>
                      Fecha
                      <input name={`close-${day.id}`} type="time" defaultValue={item?.close ?? store.business.close} />
                    </label>
                    <label>
                      Pausa inicio
                      <input name={`breakStart-${day.id}`} type="time" defaultValue={item?.breakStart ?? "00:00"} />
                    </label>
                    <label>
                      Pausa fim
                      <input name={`breakEnd-${day.id}`} type="time" defaultValue={item?.breakEnd ?? "00:00"} />
                    </label>
                  </div>
                );
              })}
            </div>
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
  const [checkoutMessage, setCheckoutMessage] = useState("");

  async function startCheckout(planId: PlanCycle) {
    if (planId === "free") {
      store.updatePlan(planId, provider);
      setCheckoutMessage("Plano gratuito ativado.");
      return;
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        businessId: store.business.id,
        email: store.business.ownerEmail,
      }),
    });
    const data = await response.json();
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
      return;
    }
    store.updatePlan(planId, provider);
    setCheckoutMessage(data.message ?? "Checkout preparado. Plano atualizado no ambiente de demonstracao.");
  }

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
              onClick={() => void startCheckout(plan.id as PlanCycle)}
              className="mt-4 min-h-11 w-full rounded-card bg-brand px-4 font-black text-white"
            >
              {plan.id === "free" ? "Ativar" : "Contratar"}
            </button>
          </article>
        ))}
      </div>
      {checkoutMessage && <div className="rounded-card border border-brand/30 bg-brand/10 p-4 font-bold text-brand">{checkoutMessage}</div>}
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
