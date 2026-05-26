"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Panel, PrimaryButton } from "@/components/ui/AppShell";
import { todayInput, whatsappLink } from "@/lib/format";
import { useAgendaStore } from "@/lib/agenda-store";

export function PublicBooking({ slug }: { slug: string }) {
  const store = useAgendaStore();
  const [date, setDate] = useState(todayInput());
  const [serviceId, setServiceId] = useState(store.activeServices[0]?.id ?? "");
  const [staffId, setStaffId] = useState(store.activeStaff[0]?.id ?? "");
  const [success, setSuccess] = useState("");
  const slots = useMemo(() => store.availableSlots(date, staffId), [date, staffId, store]);

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
      source: "public",
    });
    setSuccess("Agendamento recebido. Aguarde a confirmacao do estabelecimento.");
    event.currentTarget.reset();
  }

  if (slug !== store.business.slug) {
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

  return (
    <main className="min-h-screen bg-canvas p-6">
      <header className="mx-auto mb-5 grid max-w-6xl grid-cols-[180px_minmax(0,1fr)] gap-5 max-md:grid-cols-1">
        <Link className="rounded-card border border-line bg-white px-4 py-3 text-center font-black" href="/painel">
          Voltar ao painel
        </Link>
        <div>
          <p className="text-xs font-black uppercase text-brand">Agendamento online</p>
          <h1 className="mt-1 text-6xl font-black leading-none max-md:text-4xl">{store.business.name}</h1>
          <p className="mt-2 text-muted">{store.business.address}</p>
        </div>
      </header>
      <section className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_380px] gap-4 max-lg:grid-cols-1">
        <Panel>
          <h2 className="mb-4 text-xl font-black">Escolha seu horario</h2>
          <form onSubmit={submit} className="grid gap-3">
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
            href={whatsappLink(store.business.phone, `Ola, gostaria de falar com ${store.business.name}.`)}
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
