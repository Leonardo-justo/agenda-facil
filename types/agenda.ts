export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "canceled";
export type PlanCycle = "free" | "monthly" | "quarterly" | "annual";
export type PaymentProvider = "stripe" | "mercado_pago" | "infinite_pay";
export type Weekday = "0" | "1" | "2" | "3" | "4" | "5" | "6";

export type DaySchedule = {
  enabled: boolean;
  open: string;
  close: string;
  breakStart: string;
  breakEnd: string;
};

export type WeeklySchedule = Record<Weekday, DaySchedule>;

export type Plan = {
  id: PlanCycle;
  name: string;
  price: number;
  months: number;
  appointmentLimit: number | null;
  staffLimit: number | null;
  description: string;
  highlighted?: boolean;
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  ownerName: string;
  ownerEmail: string;
  document: string;
  phone: string;
  address: string;
  category: string;
  open: string;
  close: string;
  schedule: WeeklySchedule;
  confirmationMode: "manual" | "automatic";
  plan: PlanCycle;
  planPrice: number;
  paymentProvider: PaymentProvider;
  subscriptionStatus: "trial" | "active" | "past_due" | "canceled";
  trialEndsAt: string;
  lgpdAcceptedAt: string;
  active: boolean;
  createdAt: string;
};

export type Service = {
  id: string;
  businessId: string;
  name: string;
  duration: number;
  price: number;
  active: boolean;
};

export type StaffMember = {
  id: string;
  businessId: string;
  name: string;
  role: string;
  active: boolean;
};

export type Appointment = {
  id: string;
  businessId: string;
  client: string;
  phone: string;
  serviceId: string;
  staffId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  source: "owner" | "public";
  createdAt: string;
};

export type AgendaData = {
  business: Business;
  services: Service[];
  staff: StaffMember[];
  appointments: Appointment[];
};
