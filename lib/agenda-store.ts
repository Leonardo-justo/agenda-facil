"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgendaData, Appointment, AppointmentStatus, Business, Service, StaffMember } from "@/types/agenda";
import { addDaysInput, onlyDigits, slugify, todayInput } from "@/lib/format";

const STORAGE_KEY = "agenda-facil-next-data";

const businessId = "studio-aurora";

const seedData: AgendaData = {
  business: {
    id: businessId,
    name: "Studio Aurora",
    slug: "studio-aurora",
    phone: "5511999999999",
    address: "Rua das Flores, 120 - Centro",
    open: "09:00",
    close: "18:00",
    planPrice: 79,
    active: true,
  },
  services: [
    { id: "svc-corte", businessId, name: "Corte feminino", duration: 45, price: 89.9, active: true },
    { id: "svc-manicure", businessId, name: "Manicure", duration: 60, price: 45, active: true },
    { id: "svc-pet", businessId, name: "Banho e tosa", duration: 90, price: 110, active: true },
  ],
  staff: [
    { id: "staff-ana", businessId, name: "Ana Souza", role: "Cabelo e finalizacao", active: true },
    { id: "staff-bruno", businessId, name: "Bruno Lima", role: "Pet care", active: true },
    { id: "staff-camila", businessId, name: "Camila Nunes", role: "Unhas", active: true },
  ],
  appointments: [
    {
      id: "apt-1",
      businessId,
      client: "Marina Costa",
      phone: "5511988887777",
      serviceId: "svc-corte",
      staffId: "staff-ana",
      date: addDaysInput(1),
      time: "10:00",
      status: "confirmed",
      source: "owner",
      createdAt: new Date().toISOString(),
    },
    {
      id: "apt-2",
      businessId,
      client: "Rafael Martins",
      phone: "5511977776666",
      serviceId: "svc-pet",
      staffId: "staff-bruno",
      date: addDaysInput(1),
      time: "14:30",
      status: "scheduled",
      source: "public",
      createdAt: new Date().toISOString(),
    },
  ],
};

function createId(prefix: string) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadData(): AgendaData {
  if (typeof window === "undefined") return seedData;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return JSON.parse(stored) as AgendaData;
}

function saveData(data: AgendaData) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

function buildSlots(open: string, close: string) {
  const result: string[] = [];
  let current = timeToMinutes(open);
  const end = timeToMinutes(close);
  while (current < end) {
    result.push(minutesToTime(current));
    current += 30;
  }
  return result;
}

export function useAgendaStore() {
  const [data, setData] = useState<AgendaData>(seedData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveData(data);
  }, [data, ready]);

  const activeServices = useMemo(() => data.services.filter((service) => service.active), [data.services]);
  const activeStaff = useMemo(() => data.staff.filter((person) => person.active), [data.staff]);

  const metrics = useMemo(() => {
    const today = todayInput();
    const month = today.slice(0, 7);
    const monthAppointments = data.appointments.filter((appointment) => appointment.date.startsWith(month));
    const todayAppointments = data.appointments.filter((appointment) => appointment.date === today);
    const revenue = data.appointments.reduce((sum, appointment) => {
      const service = data.services.find((item) => item.id === appointment.serviceId);
      return sum + (service?.price ?? 0);
    }, 0);

    return {
      todayAppointments: todayAppointments.length,
      monthAppointments: monthAppointments.length,
      activeServices: activeServices.length,
      revenue,
      mrr: data.business.active ? data.business.planPrice : 0,
      activeClients: data.business.active ? 1 : 0,
    };
  }, [activeServices.length, data]);

  function updateBusiness(input: Partial<Business>) {
    setData((current) => ({
      ...current,
      business: {
        ...current.business,
        ...input,
        slug: input.slug ? slugify(input.slug) : current.business.slug,
        phone: input.phone ? onlyDigits(input.phone) : current.business.phone,
      },
    }));
  }

  function addService(input: Omit<Service, "id" | "businessId" | "active">) {
    setData((current) => ({
      ...current,
      services: [...current.services, { ...input, id: createId("svc"), businessId: current.business.id, active: true }],
    }));
  }

  function addStaff(input: Omit<StaffMember, "id" | "businessId" | "active">) {
    setData((current) => ({
      ...current,
      staff: [...current.staff, { ...input, id: createId("staff"), businessId: current.business.id, active: true }],
    }));
  }

  function addAppointment(input: Omit<Appointment, "id" | "businessId" | "status" | "createdAt"> & { status?: AppointmentStatus }) {
    setData((current) => ({
      ...current,
      appointments: [
        ...current.appointments,
        {
          ...input,
          id: createId("apt"),
          businessId: current.business.id,
          status: input.status ?? "scheduled",
          phone: onlyDigits(input.phone),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
  }

  function updateAppointmentStatus(id: string, status: AppointmentStatus) {
    setData((current) => ({
      ...current,
      appointments: current.appointments.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    }));
  }

  function toggleService(id: string) {
    setData((current) => ({
      ...current,
      services: current.services.map((service) => (service.id === id ? { ...service, active: !service.active } : service)),
    }));
  }

  function toggleStaff(id: string) {
    setData((current) => ({
      ...current,
      staff: current.staff.map((person) => (person.id === id ? { ...person, active: !person.active } : person)),
    }));
  }

  function availableSlots(date: string, staffId: string) {
    const reserved = new Set(
      data.appointments
        .filter((appointment) => appointment.date === date && appointment.staffId === staffId && appointment.status !== "canceled")
        .map((appointment) => appointment.time),
    );
    return buildSlots(data.business.open, data.business.close).filter((slot) => !reserved.has(slot));
  }

  return {
    ...data,
    activeServices,
    activeStaff,
    metrics,
    ready,
    updateBusiness,
    addService,
    addStaff,
    addAppointment,
    updateAppointmentStatus,
    toggleService,
    toggleStaff,
    availableSlots,
  };
}
