export type AppointmentStatus = "scheduled" | "confirmed" | "done" | "canceled";

export type Business = {
  id: string;
  name: string;
  slug: string;
  phone: string;
  address: string;
  open: string;
  close: string;
  planPrice: number;
  active: boolean;
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
