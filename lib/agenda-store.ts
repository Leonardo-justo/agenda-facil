"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AgendaData,
  Appointment,
  AppointmentStatus,
  Business,
  PaymentProvider,
  Plan,
  PlanCycle,
  Service,
  StaffMember,
} from "@/types/agenda";
import { addDaysInput, onlyDigits, slugify, todayInput } from "@/lib/format";

const STORAGE_KEY = "agenda-facil-next-data";
const businessId = "studio-aurora";

export const agendaPlans: Plan[] = [
  {
    id: "free",
    name: "Gratuito",
    price: 0,
    months: 0,
    appointmentLimit: 30,
    staffLimit: 1,
    description: "Teste com ate 30 agendamentos por mes, 1 profissional e link publico.",
  },
  {
    id: "monthly",
    name: "1 mes",
    price: 79,
    months: 1,
    appointmentLimit: null,
    staffLimit: null,
    description: "Plano mensal para comecar sem compromisso.",
  },
  {
    id: "quarterly",
    name: "3 meses",
    price: 199,
    months: 3,
    appointmentLimit: null,
    staffLimit: null,
    description: "Economia para validar a operacao por uma temporada.",
  },
  {
    id: "annual",
    name: "12 meses",
    price: 599,
    months: 12,
    appointmentLimit: null,
    staffLimit: null,
    description: "Melhor custo-beneficio, com desconto para fechar o ano.",
    highlighted: true,
  },
];

export function getPlan(planId: PlanCycle) {
  return agendaPlans.find((plan) => plan.id === planId) ?? agendaPlans[0];
}

const seedData: AgendaData = {
  business: {
    id: businessId,
    name: "Studio Aurora",
    slug: "studio-aurora",
    logoUrl: "",
    ownerName: "Marina Costa",
    ownerEmail: "admin@agenda.local",
    document: "12345678000190",
    phone: "5511999999999",
    address: "Rua das Flores, 120 - Centro",
    category: "Salao de beleza",
    open: "09:00",
    close: "18:00",
    plan: "monthly",
    planPrice: 79,
    paymentProvider: "mercado_pago",
    subscriptionStatus: "trial",
    trialEndsAt: addDaysInput(7),
    lgpdAcceptedAt: new Date().toISOString(),
    active: true,
    createdAt: new Date().toISOString(),
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
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeData(data: AgendaData): AgendaData {
  const business = data.business as Partial<Business>;
  const plan = (business.plan ?? "monthly") as PlanCycle;
  return {
    ...data,
    business: {
      ...data.business,
      logoUrl: business.logoUrl ?? "",
      ownerName: business.ownerName ?? "Administrador",
      ownerEmail: business.ownerEmail ?? "admin@agenda.local",
      document: business.document ?? "",
      category: business.category ?? "Servicos",
      plan,
      paymentProvider: business.paymentProvider ?? "mercado_pago",
      subscriptionStatus: business.subscriptionStatus ?? "trial",
      trialEndsAt: business.trialEndsAt ?? addDaysInput(7),
      lgpdAcceptedAt: business.lgpdAcceptedAt ?? new Date().toISOString(),
      createdAt: business.createdAt ?? new Date().toISOString(),
      planPrice: business.planPrice ?? getPlan(plan).price,
    },
  };
}

function loadData(): AgendaData {
  if (typeof window === "undefined") return seedData;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return seedData;
  }
  return normalizeData(JSON.parse(stored) as AgendaData);
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
    const trialDaysLeft = Math.max(0, Math.ceil((new Date(data.business.trialEndsAt).getTime() - Date.now()) / 86400000));

    return {
      todayAppointments: todayAppointments.length,
      monthAppointments: monthAppointments.length,
      activeServices: activeServices.length,
      revenue,
      mrr: data.business.active && data.business.plan !== "free" ? data.business.planPrice : 0,
      activeClients: data.business.active ? 1 : 0,
      trialDaysLeft,
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
        document: input.document ? onlyDigits(input.document) : current.business.document,
      },
    }));
  }

  function onboardBusiness(input: {
    ownerName: string;
    ownerEmail: string;
    password: string;
    name: string;
    document: string;
    phone: string;
    address: string;
    category: string;
    logoUrl: string;
    plan: PlanCycle;
    paymentProvider: PaymentProvider;
    lgpdAccepted: boolean;
  }) {
    const plan = getPlan(input.plan);
    const slug = slugify(input.name || "minha-loja");
    const id = slug || createId("biz");
    setData((current) => ({
      ...current,
      business: {
        ...current.business,
        id,
        name: input.name,
        slug,
        logoUrl: input.logoUrl,
        ownerName: input.ownerName,
        ownerEmail: input.ownerEmail,
        document: onlyDigits(input.document),
        phone: onlyDigits(input.phone),
        address: input.address,
        category: input.category,
        plan: plan.id,
        planPrice: plan.price,
        paymentProvider: input.paymentProvider,
        subscriptionStatus: plan.id === "free" ? "trial" : "active",
        trialEndsAt: addDaysInput(7),
        lgpdAcceptedAt: input.lgpdAccepted ? new Date().toISOString() : "",
        active: true,
        createdAt: new Date().toISOString(),
      },
      services: current.services.map((service) => ({ ...service, businessId: id })),
      staff: current.staff.map((person) => ({ ...person, businessId: id })),
      appointments: current.appointments.map((appointment) => ({ ...appointment, businessId: id })),
    }));
  }

  function updatePlan(planId: PlanCycle, paymentProvider: PaymentProvider) {
    const plan = getPlan(planId);
    updateBusiness({
      plan: plan.id,
      planPrice: plan.price,
      paymentProvider,
      subscriptionStatus: plan.id === "free" ? "trial" : "active",
    });
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
      appointments: current.appointments.map((appointment) => (appointment.id === id ? { ...appointment, status } : appointment)),
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
    onboardBusiness,
    updatePlan,
    addService,
    addStaff,
    addAppointment,
    updateAppointmentStatus,
    toggleService,
    toggleStaff,
    availableSlots,
  };
}
