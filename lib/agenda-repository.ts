"use client";

import type { AgendaData, Appointment, Business, Service, StaffMember } from "@/types/agenda";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";

export function canUseSupabaseData() {
  return Boolean(hasSupabaseConfig && supabase);
}

function toBusinessRow(business: Business) {
  return {
    id: business.id,
    name: business.name,
    slug: business.slug,
    logo_url: business.logoUrl,
    owner_name: business.ownerName,
    owner_email: business.ownerEmail,
    document: business.document,
    phone: business.phone,
    address: business.address,
    category: business.category,
    open_time: business.open,
    close_time: business.close,
    plan_id: business.plan,
    plan_price: business.planPrice,
    payment_provider: business.paymentProvider,
    subscription_status: business.subscriptionStatus,
    trial_ends_at: business.trialEndsAt,
    lgpd_accepted_at: business.lgpdAcceptedAt,
    active: business.active,
    created_at: business.createdAt,
  };
}

function fromBusinessRow(row: Record<string, any>): Business {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logo_url ?? "",
    ownerName: row.owner_name,
    ownerEmail: row.owner_email,
    document: row.document ?? "",
    phone: row.phone,
    address: row.address,
    category: row.category,
    open: String(row.open_time).slice(0, 5),
    close: String(row.close_time).slice(0, 5),
    plan: row.plan_id,
    planPrice: Number(row.plan_price ?? 0),
    paymentProvider: row.payment_provider,
    subscriptionStatus: row.subscription_status,
    trialEndsAt: row.trial_ends_at,
    lgpdAcceptedAt: row.lgpd_accepted_at ?? "",
    active: row.active,
    createdAt: row.created_at,
  };
}

function toServiceRow(service: Service) {
  return {
    id: service.id,
    business_id: service.businessId,
    name: service.name,
    duration: service.duration,
    price: service.price,
    active: service.active,
  };
}

function fromServiceRow(row: Record<string, any>): Service {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    duration: Number(row.duration),
    price: Number(row.price),
    active: row.active,
  };
}

function toStaffRow(person: StaffMember) {
  return {
    id: person.id,
    business_id: person.businessId,
    name: person.name,
    role: person.role,
    active: person.active,
  };
}

function fromStaffRow(row: Record<string, any>): StaffMember {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    role: row.role,
    active: row.active,
  };
}

function toAppointmentRow(appointment: Appointment) {
  return {
    id: appointment.id,
    business_id: appointment.businessId,
    service_id: appointment.serviceId,
    staff_id: appointment.staffId,
    client: appointment.client,
    phone: appointment.phone,
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    status: appointment.status,
    source: appointment.source,
    created_at: appointment.createdAt,
  };
}

function fromAppointmentRow(row: Record<string, any>): Appointment {
  return {
    id: row.id,
    businessId: row.business_id,
    serviceId: row.service_id,
    staffId: row.staff_id,
    client: row.client,
    phone: row.phone,
    date: row.appointment_date,
    time: String(row.appointment_time).slice(0, 5),
    status: row.status,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function loadCurrentBusinessData(): Promise<AgendaData | null> {
  if (!canUseSupabaseData() || !supabase) return null;

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id;
  if (!businessId) return null;

  const [{ data: business }, { data: services }, { data: staff }, { data: appointments }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).single(),
    supabase.from("services").select("*").eq("business_id", businessId).order("name"),
    supabase.from("staff_members").select("*").eq("business_id", businessId).order("name"),
    supabase.from("appointments").select("*").eq("business_id", businessId).order("appointment_date"),
  ]);

  if (!business) return null;

  return {
    business: fromBusinessRow(business),
    services: (services ?? []).map(fromServiceRow),
    staff: (staff ?? []).map(fromStaffRow),
    appointments: (appointments ?? []).map(fromAppointmentRow),
  };
}

export async function loadPublicBusinessData(slug: string): Promise<AgendaData | null> {
  if (!canUseSupabaseData() || !supabase) return null;

  const { data: business } = await supabase.from("businesses").select("*").eq("slug", slug).eq("active", true).single();
  if (!business) return null;

  const businessId = business.id;
  const [{ data: services }, { data: staff }] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", businessId).eq("active", true).order("name"),
    supabase.from("staff_members").select("*").eq("business_id", businessId).eq("active", true).order("name"),
  ]);

  return {
    business: fromBusinessRow(business),
    services: (services ?? []).map(fromServiceRow),
    staff: (staff ?? []).map(fromStaffRow),
    appointments: [],
  };
}

export async function saveBusinessData(data: AgendaData) {
  if (!canUseSupabaseData() || !supabase) return;

  await supabase.from("businesses").upsert(toBusinessRow(data.business));
  if (data.services.length) await supabase.from("services").upsert(data.services.map(toServiceRow));
  if (data.staff.length) await supabase.from("staff_members").upsert(data.staff.map(toStaffRow));
  if (data.appointments.length) await supabase.from("appointments").upsert(data.appointments.map(toAppointmentRow));
}

export async function ensureCurrentUserBusinessMembership(input: { businessId: string; ownerName: string; ownerEmail: string }) {
  if (!canUseSupabaseData() || !supabase) return;

  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) return;

  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: input.ownerName,
    email: input.ownerEmail,
    role: "store_owner",
  });

  await supabase.from("business_members").upsert({
    business_id: input.businessId,
    user_id: user.id,
    role: "owner",
  });
}

export async function saveConsentEvent(input: { businessId: string; consentType: string; version: string }) {
  if (!canUseSupabaseData() || !supabase) return;

  const { data } = await supabase.auth.getSession();
  await supabase.from("consent_events").insert({
    business_id: input.businessId,
    user_id: data.session?.user.id ?? null,
    consent_type: input.consentType,
    version: input.version,
    user_agent: navigator.userAgent,
  });
}

export async function createPublicAppointment(appointment: Appointment) {
  if (!canUseSupabaseData() || !supabase) return false;

  const { error } = await supabase.from("appointments").insert(toAppointmentRow(appointment));
  return !error;
}
