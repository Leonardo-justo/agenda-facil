"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Panel, PrimaryButton } from "@/components/ui/AppShell";
import { todayInput, whatsappLink } from "@/lib/format";
import { demoAgendaData, useAgendaStore } from "@/lib/agenda-store";
import { createPublicAppointment, loadPublicBusinessData } from "@/lib/agenda-repository";
import type { AgendaData, Appointment, WeeklySchedule } from "@/types/agenda";

export function PublicBooking({ slug }: { slug: string }) {
  const store = useAgendaStore();
  const [remoteData, setRemoteData] = useState<AgendaData | null>(null);
  const [date, setDate] = useState(todayInput());
  const isDemo = slug === demoAgendaData.business.slug;
  const data = remoteData ?? (isDemo ? demoAgendaData : store);
  const activeServices = data.services.filter((service) => service.active);
  const activeStaff = data.staff.filter((person) => person.active);
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
  const [staffId, setStaffId] = useState(activeStaff[0]?.id ?? "");
  const [success, setSuccess] = useState("");
  const selectedService = activeServices.find((service) => service.id === serviceId);
  const slots = useMemo(
    () =>
      remoteData || isDemo
        ? buildPublicSlots(date, data.business.schedule, selectedService?.duration ?? 30)
        : store.availableSlots(date, staffId, serviceId),
    [data.business.schedule, date, isDemo, remoteData, selectedService?.duration, serviceId, staffId, store],
  );

  useEffect(() => {
    loadPublicBusinessData(slug).then((result) => {
      if (result) {
        setRemoteData(result);
        setServiceId(result.services[0]?.id ?? "");
        setStaffId(result.staff[0]?.id ?? "");
      }
    });
  }, [slug]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const appointment: Appointment = {
      client: String(form.get("client")),
      phone: String(form.get("phone")),
      serviceId,
      staffId,
      date,
      time: String(form.get("time")),
      source: "public",
      id: `apt-${crypto.randomUUID()}`,
      businessId: data.business.id,
      status: data.business.confirmationMode === "automatic" ? "confirmed" : "scheduled",
      createdAt: new Date().toISOString(),
    };
    const savedRemote = isDemo ? false : await createPublicAppointment(appointment);
    if (!savedRemote && !isDemo) store.addAppointment(appointment);
    setSuccess(
      data.business.confirmationMode === "automatic"
        ? "Agendamento confirmado. A loja recebeu seu horario."
        : "Agendamento recebido. Aguarde a confirmacao do estabelecimento.",
    );
    event.currentTarget.reset();
  }

  if (!remoteData && !isDemo && slug !== store.business.slug) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6">
        <Panel>
          <h1 className="text-3xl font-black">Agenda nao encontrada</h1>
          <Link className="mt-4 inline-flex font-black text-brand" href="/">
            Voltar
          </Link>
        </Panel>
      </main>
    );
  }

  if (!activeServices.length || !activeStaff.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas p-6">
        <Panel>
          <p className="text-xs font-black uppercase text-brand">Agendamento online</p>
          <h1 className="mt-2 text-3xl font-black">{data.business.name}</h1>
          <p className="mt-3 font-semibold text-muted">
            Esta agenda ainda esta em configuracao. A loja precisa cadastrar servicos e profissionais para liberar horarios.
          </p>
          <Link className="mt-5 inline-flex rounded-card bg-brand px-4 py-3 font-black text-white" href="/painel">
            Abrir painel da loja
          </Link>
        </Panel>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas p-6">
      <header className="mx-auto mb-5 grid max-w-6xl grid-cols-[180px_minmax(0,1fr)] gap-5 max-md:grid-cols-1">
        <Link className="rounded-card border border-line bg-white px-4 py-3 text-center font-black" href="/painel">
          Voltar ao painel
        </Link>
        <div>
          <p className="text-xs font-black uppercase text-brand">Agendamento online</p>
          <h1 className="mt-1 text-6xl font-black leading-none max-md:text-4xl">{data.business.name}</h1>
          <p className="mt-2 text-muted">{data.business.address}</p>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_380px] gap-4 max-lg:grid-cols-1">
        <Panel>
          <h2 className="mb-4 text-xl font-black">Escolha seu horario</h2>
          <form onSubmit={submit} className="grid gap-3">
            <label>
              Servico
              <select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
                {activeServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Profissional
              <select value={staffId} onChange={(event) => setStaffId(event.target.value)}>
                {activeStaff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
              <label>
                Data
                <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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
            <label>
              Seu nome
              <input name="client" required />
            </label>
            <label>
              WhatsApp
              <input name="phone" required placeholder="5511999999999" />
            </label>
            <PrimaryButton>Confirmar agendamento</PrimaryButton>
            <p className="min-h-6 font-bold text-brand">{success}</p>
          </form>
        </Panel>
        <Panel>
          <h2 className="mb-4 text-xl font-black">Como funciona</h2>
          <ol className="grid list-decimal gap-3 pl-5 text-muted">
            <li>Escolha o servico e profissional.</li>
            <li>Selecione data e horario disponivel.</li>
            <li>Confirme seus dados de contato.</li>
            <li>O estabelecimento acompanha tudo no painel.</li>
          </ol>
          <a
            className="mt-5 inline-flex min-h-11 items-center rounded-card bg-brand px-4 font-black text-white"
            href={whatsappLink(data.business.phone, `Ola, gostaria de falar com ${data.business.name}.`)}
            target="_blank"
            rel="noreferrer"
          >
            Chamar no WhatsApp
          </a>
        </Panel>
      </section>
    </main>
  );
}

function buildPublicSlots(date: string, schedule: WeeklySchedule, serviceDuration: number) {
  const weekday = String(new Date(`${date}T00:00:00`).getDay()) as keyof WeeklySchedule;
  const day = schedule[weekday];
  if (!day?.enabled) return [];
  const result: string[] = [];
  const [openHour, openMinute] = day.open.split(":").map(Number);
  const [closeHour, closeMinute] = day.close.split(":").map(Number);
  const [breakStartHour, breakStartMinute] = day.breakStart.split(":").map(Number);
  const [breakEndHour, breakEndMinute] = day.breakEnd.split(":").map(Number);
  let current = openHour * 60 + openMinute;
  const end = closeHour * 60 + closeMinute;
  const breakStart = breakStartHour * 60 + breakStartMinute;
  const breakEnd = breakEndHour * 60 + breakEndMinute;
  const hasBreak = day.breakStart !== day.breakEnd;
  while (current + serviceDuration <= end) {
    const slotEnd = current + serviceDuration;
    if (!hasBreak || current >= breakEnd || slotEnd <= breakStart) {
    result.push(`${String(Math.floor(current / 60)).padStart(2, "0")}:${String(current % 60).padStart(2, "0")}`);
    }
    current += 30;
  }
  return result;
}
