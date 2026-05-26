const SESSION_KEY = "agenda-facil-session";
const BUSINESS_KEY = "agenda-facil-business";
const SERVICES_KEY = "agenda-facil-services";
const STAFF_KEY = "agenda-facil-staff";
const APPOINTMENTS_KEY = "agenda-facil-appointments";

const credentials = [
  { email: "dono@agenda.local", password: "admin123", role: "owner" },
  { email: "admin@agenda.local", password: "admin123", role: "client" },
];

const seedBusiness = {
  name: "Studio Aurora",
  slug: "studio-aurora",
  phone: "5511999999999",
  address: "Rua das Flores, 120 - Centro",
  open: "09:00",
  close: "18:00",
};

const seedServices = [
  { id: createId(), name: "Corte feminino", duration: 45, price: 89.9, active: true },
  { id: createId(), name: "Manicure", duration: 60, price: 45, active: true },
  { id: createId(), name: "Banho e tosa", duration: 90, price: 110, active: true },
];

const seedStaff = [
  { id: createId(), name: "Ana Souza", role: "Cabelo e finalizacao", active: true },
  { id: createId(), name: "Bruno Lima", role: "Pet care", active: true },
  { id: createId(), name: "Camila Nunes", role: "Unhas", active: true },
];

const tomorrow = addDays(new Date(), 1);
const seedAppointments = [
  {
    id: createId(),
    client: "Marina Costa",
    phone: "5511988887777",
    serviceId: seedServices[0].id,
    staffId: seedStaff[0].id,
    date: formatDateInput(tomorrow),
    time: "10:00",
    status: "confirmed",
    source: "owner",
  },
  {
    id: createId(),
    client: "Rafael Martins",
    phone: "5511977776666",
    serviceId: seedServices[2].id,
    staffId: seedStaff[1].id,
    date: formatDateInput(tomorrow),
    time: "14:30",
    status: "scheduled",
    source: "public",
  },
];

const state = {
  business: loadValue(BUSINESS_KEY, seedBusiness),
  services: loadValue(SERVICES_KEY, seedServices),
  staff: loadValue(STAFF_KEY, seedStaff),
  appointments: loadValue(APPOINTMENTS_KEY, seedAppointments),
  role: localStorage.getItem(SESSION_KEY) || "",
  section: "dashboard",
};

const views = {
  login: document.querySelector("#login-view"),
  platform: document.querySelector("#platform-view"),
  admin: document.querySelector("#admin-view"),
  public: document.querySelector("#public-view"),
};

const today = formatDateInput(new Date());
document.querySelector("#appointment-date").value = today;
document.querySelector("#agenda-filter-date").value = today;
document.querySelector("#public-date").value = today;

document.querySelector("#login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#login-email").value.trim();
  const password = document.querySelector("#login-password").value;
  const account = credentials.find((item) => item.email === email && item.password === password);

  if (!account) {
    document.querySelector("#login-error").textContent = "E-mail ou senha invalidos.";
    return;
  }

  state.role = account.role;
  localStorage.setItem(SESSION_KEY, account.role);
  document.querySelector("#login-error").textContent = "";
  if (account.role === "owner") {
    showPlatform();
  } else {
    showAdmin();
  }
});

document.querySelector("#logout-button").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  state.role = "";
  showLogin();
});
document.querySelector("#platform-logout-button").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  state.role = "";
  showLogin();
});
document.querySelector("#open-client-panel").addEventListener("click", showAdmin);

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => setSection(button.dataset.section));
});

document.querySelector("#open-public-button").addEventListener("click", openPublicBooking);
document.querySelector("#back-to-admin").addEventListener("click", showAdmin);
document.querySelector("#copy-public-link").addEventListener("click", copyPublicLink);
document.querySelector("#agenda-filter-date").addEventListener("change", renderAppointments);
document.querySelector("#appointment-date").addEventListener("change", renderTimeOptions);
document.querySelector("#appointment-staff").addEventListener("change", renderTimeOptions);
document.querySelector("#public-date").addEventListener("change", renderPublicTimeOptions);
document.querySelector("#public-staff").addEventListener("change", renderPublicTimeOptions);

document.querySelector("#appointment-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.appointments.push({
    id: createId(),
    client: document.querySelector("#appointment-client").value.trim(),
    phone: onlyDigits(document.querySelector("#appointment-phone").value),
    serviceId: document.querySelector("#appointment-service").value,
    staffId: document.querySelector("#appointment-staff").value,
    date: document.querySelector("#appointment-date").value,
    time: document.querySelector("#appointment-time").value,
    status: "scheduled",
    source: "owner",
  });
  saveValue(APPOINTMENTS_KEY, state.appointments);
  event.target.reset();
  document.querySelector("#appointment-date").value = today;
  render();
  setSection("appointments");
});

document.querySelector("#service-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.services.push({
    id: createId(),
    name: document.querySelector("#service-name").value.trim(),
    duration: Number(document.querySelector("#service-duration").value),
    price: Number(document.querySelector("#service-price").value),
    active: true,
  });
  saveValue(SERVICES_KEY, state.services);
  event.target.reset();
  document.querySelector("#service-duration").value = 45;
  document.querySelector("#service-price").value = "0.00";
  render();
});

document.querySelector("#staff-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.staff.push({
    id: createId(),
    name: document.querySelector("#staff-name").value.trim(),
    role: document.querySelector("#staff-role").value.trim(),
    active: true,
  });
  saveValue(STAFF_KEY, state.staff);
  event.target.reset();
  render();
});

document.querySelector("#business-form").addEventListener("submit", (event) => {
  event.preventDefault();
  state.business = {
    name: document.querySelector("#business-name").value.trim(),
    slug: slugify(document.querySelector("#business-slug").value),
    phone: onlyDigits(document.querySelector("#business-phone").value),
    address: document.querySelector("#business-address").value.trim(),
    open: document.querySelector("#business-open").value,
    close: document.querySelector("#business-close").value,
  };
  saveValue(BUSINESS_KEY, state.business);
  render();
});

document.querySelector("#public-booking-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const appointment = {
    id: createId(),
    client: document.querySelector("#public-client").value.trim(),
    phone: onlyDigits(document.querySelector("#public-phone").value),
    serviceId: document.querySelector("#public-service").value,
    staffId: document.querySelector("#public-staff").value,
    date: document.querySelector("#public-date").value,
    time: document.querySelector("#public-time").value,
    status: "scheduled",
    source: "public",
  };

  state.appointments.push(appointment);
  saveValue(APPOINTMENTS_KEY, state.appointments);
  document.querySelector("#public-success").textContent =
    "Agendamento recebido. Aguarde a confirmacao do estabelecimento.";
  event.target.reset();
  document.querySelector("#public-date").value = today;
  render();
  showPublic();
});

document.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const id = event.target.dataset.id;
  if (!action || !id) return;

  if (action === "toggle-service") {
    const service = state.services.find((item) => item.id === id);
    service.active = !service.active;
    saveValue(SERVICES_KEY, state.services);
    render();
  }

  if (action === "toggle-staff") {
    const staff = state.staff.find((item) => item.id === id);
    staff.active = !staff.active;
    saveValue(STAFF_KEY, state.staff);
    render();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.dataset.action !== "status") return;
  const appointment = state.appointments.find((item) => item.id === event.target.dataset.id);
  if (!appointment) return;
  appointment.status = event.target.value;
  saveValue(APPOINTMENTS_KEY, state.appointments);
  render();
});

if (location.hash.startsWith("#book")) {
  showPublic();
} else if (localStorage.getItem(SESSION_KEY) === "owner") {
  showPlatform();
} else if (localStorage.getItem(SESSION_KEY) === "client") {
  showAdmin();
} else {
  showLogin();
}

function showLogin() {
  views.login.classList.remove("is-hidden");
  views.platform.classList.add("is-hidden");
  views.admin.classList.add("is-hidden");
  views.public.classList.add("is-hidden");
}

function showPlatform() {
  history.replaceState(null, "", location.pathname);
  views.login.classList.add("is-hidden");
  views.platform.classList.remove("is-hidden");
  views.admin.classList.add("is-hidden");
  views.public.classList.add("is-hidden");
  renderOwnerDashboard();
}

function showAdmin() {
  history.replaceState(null, "", location.pathname);
  views.login.classList.add("is-hidden");
  views.platform.classList.add("is-hidden");
  views.admin.classList.remove("is-hidden");
  views.public.classList.add("is-hidden");
  render();
}

function showPublic() {
  views.login.classList.add("is-hidden");
  views.platform.classList.add("is-hidden");
  views.admin.classList.add("is-hidden");
  views.public.classList.remove("is-hidden");
  renderPublic();
}

function openPublicBooking() {
  location.hash = `book/${state.business.slug}`;
  showPublic();
}

function setSection(section) {
  state.section = section;
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.section === section);
  });
  document.querySelectorAll(".view-section").forEach((element) => {
    element.classList.toggle("is-hidden", element.id !== `${section}-section`);
  });
  const title = {
    dashboard: "Dashboard",
    appointments: "Agenda",
    services: "Servicos",
    team: "Equipe",
    settings: "Link publico",
  }[section];
  document.querySelector("#section-title").textContent = title;
}

function render() {
  document.querySelector("#business-title").textContent = state.business.name;
  renderSelects();
  renderDashboard();
  renderAppointments();
  renderServices();
  renderStaff();
  renderSettings();
  setSection(state.section);
}

function renderOwnerDashboard() {
  const month = new Date().toISOString().slice(0, 7);
  const monthAppointments = state.appointments.filter((appointment) => appointment.date.startsWith(month));
  const activeClients = 1;
  const ticket = 79;
  const mrr = activeClients * ticket;
  const publicLink = publicUrl();
  const pitch = `Ola, preparei uma agenda online para ${state.business.name}. O cliente agenda pelo link, e voce acompanha tudo no painel: ${publicLink}`;

  document.querySelector("#owner-active-clients").textContent = activeClients;
  document.querySelector("#owner-month-appointments").textContent = monthAppointments.length;
  document.querySelector("#owner-mrr").textContent = money(mrr);
  document.querySelector("#platform-public-link").href = publicLink;
  document.querySelector("#platform-whatsapp-pitch").href = whatsappLink(state.business.phone, pitch);
  document.querySelector("#owner-client-list").innerHTML = miniItem(
    state.business.name,
    `${state.business.address} - ${state.appointments.length} agendamentos no total`,
    "ativo",
  );
}

function renderSelects() {
  const activeServices = state.services.filter((service) => service.active);
  const activeStaff = state.staff.filter((person) => person.active);
  const serviceOptions = activeServices.map(optionTemplate).join("");
  const staffOptions = activeStaff.map(optionTemplate).join("");

  document.querySelector("#appointment-service").innerHTML = serviceOptions;
  document.querySelector("#appointment-staff").innerHTML = staffOptions;
  document.querySelector("#public-service").innerHTML = serviceOptions;
  document.querySelector("#public-staff").innerHTML = staffOptions;
  renderTimeOptions();
  renderPublicTimeOptions();
}

function renderDashboard() {
  const todayAppointments = state.appointments.filter((item) => item.date === today);
  const weekEnd = formatDateInput(addDays(new Date(), 7));
  const weekAppointments = state.appointments.filter((item) => item.date >= today && item.date <= weekEnd);
  const revenue = weekAppointments.reduce((sum, appointment) => {
    const service = findService(appointment.serviceId);
    return sum + (service?.price || 0);
  }, 0);

  document.querySelector("#metric-today").textContent = todayAppointments.length;
  document.querySelector("#metric-week").textContent = weekAppointments.length;
  document.querySelector("#metric-revenue").textContent = money(revenue);
  document.querySelector("#metric-services").textContent = state.services.filter((service) => service.active).length;

  const nextItems = state.appointments
    .filter((item) => `${item.date}T${item.time}` >= `${today}T00:00`)
    .sort(sortByDateTime)
    .slice(0, 5)
    .map((appointment) =>
      miniItem(
        `${appointment.date} as ${appointment.time}`,
        `${appointment.client} - ${findService(appointment.serviceId)?.name || "Servico"}`,
        statusLabel(appointment.status),
      ),
    );
  document.querySelector("#next-appointments").innerHTML = nextItems.length
    ? nextItems.join("")
    : emptyState("Nenhum horario futuro.");

  const staffItems = state.staff.map((person) => {
    const count = weekAppointments.filter((appointment) => appointment.staffId === person.id).length;
    return miniItem(person.name, person.role, `${count} na semana`);
  });
  document.querySelector("#staff-summary").innerHTML = staffItems.length
    ? staffItems.join("")
    : emptyState("Cadastre profissionais para ver o resumo.");
}

function renderAppointments() {
  const filter = document.querySelector("#agenda-filter-date").value;
  const rows = state.appointments
    .filter((appointment) => !filter || appointment.date === filter)
    .sort(sortByDateTime)
    .map((appointment) => {
      const service = findService(appointment.serviceId);
      const staff = findStaff(appointment.staffId);
      const message = `Ola ${appointment.client}, seu horario de ${service?.name || "servico"} esta marcado para ${formatDisplayDate(appointment.date)} as ${appointment.time}.`;
      return `
        <tr>
          <td><strong>${formatDisplayDate(appointment.date)}</strong><div class="muted">${appointment.time}</div></td>
          <td>${escapeHTML(appointment.client)}<div class="muted">${escapeHTML(appointment.phone)}</div></td>
          <td>${escapeHTML(service?.name || "Servico removido")}</td>
          <td>${escapeHTML(staff?.name || "Profissional removido")}</td>
          <td>
            <select data-action="status" data-id="${appointment.id}">
              ${statusOptions(appointment.status)}
            </select>
          </td>
          <td>
            <a href="${whatsappLink(appointment.phone, message)}" target="_blank" rel="noreferrer">WhatsApp</a>
          </td>
        </tr>
      `;
    });

  document.querySelector("#appointments-table").innerHTML = rows.length
    ? rows.join("")
    : `<tr><td colspan="6">Nenhum agendamento para esta data.</td></tr>`;
}

function renderServices() {
  document.querySelector("#services-list").innerHTML = state.services.length
    ? state.services
        .map((service) =>
          miniItem(
            service.name,
            `${service.duration} min - ${money(service.price)}`,
            service.active ? "ativo" : "pausado",
            `<button class="small-button" data-action="toggle-service" data-id="${service.id}" type="button">${service.active ? "Pausar" : "Ativar"}</button>`,
          ),
        )
        .join("")
    : emptyState("Nenhum servico cadastrado.");
}

function renderStaff() {
  document.querySelector("#staff-list").innerHTML = state.staff.length
    ? state.staff
        .map((person) =>
          miniItem(
            person.name,
            person.role,
            person.active ? "ativo" : "pausado",
            `<button class="small-button" data-action="toggle-staff" data-id="${person.id}" type="button">${person.active ? "Pausar" : "Ativar"}</button>`,
          ),
        )
        .join("")
    : emptyState("Nenhum profissional cadastrado.");
}

function renderSettings() {
  document.querySelector("#business-name").value = state.business.name;
  document.querySelector("#business-slug").value = state.business.slug;
  document.querySelector("#business-phone").value = state.business.phone;
  document.querySelector("#business-address").value = state.business.address;
  document.querySelector("#business-open").value = state.business.open;
  document.querySelector("#business-close").value = state.business.close;
  document.querySelector("#public-link-box").textContent = publicUrl();
}

function renderPublic() {
  renderSelects();
  document.querySelector("#public-business-name").textContent = state.business.name;
  document.querySelector("#public-business-address").textContent = state.business.address;
  document.querySelector("#public-whatsapp-link").href = whatsappLink(
    state.business.phone,
    `Ola, gostaria de falar com ${state.business.name}.`,
  );
}

function renderTimeOptions() {
  renderTimeSelect("#appointment-time", "#appointment-date", "#appointment-staff");
}

function renderPublicTimeOptions() {
  renderTimeSelect("#public-time", "#public-date", "#public-staff");
}

function renderTimeSelect(timeSelector, dateSelector, staffSelector) {
  const date = document.querySelector(dateSelector).value || today;
  const staffId = document.querySelector(staffSelector).value;
  const slots = availableSlots(date, staffId);
  document.querySelector(timeSelector).innerHTML = slots.length
    ? slots.map((slot) => `<option value="${slot}">${slot}</option>`).join("")
    : `<option value="">Sem horarios livres</option>`;
}

function availableSlots(date, staffId) {
  const reserved = new Set(
    state.appointments
      .filter((appointment) => appointment.date === date && appointment.staffId === staffId && appointment.status !== "canceled")
      .map((appointment) => appointment.time),
  );
  return buildSlots(state.business.open, state.business.close, 30).filter((slot) => !reserved.has(slot));
}

function buildSlots(open, close, interval) {
  const result = [];
  let current = timeToMinutes(open);
  const end = timeToMinutes(close);
  while (current < end) {
    result.push(minutesToTime(current));
    current += interval;
  }
  return result;
}

function optionTemplate(item) {
  return `<option value="${item.id}">${escapeHTML(item.name)}</option>`;
}

function statusOptions(current) {
  return [
    ["scheduled", "Agendado"],
    ["confirmed", "Confirmado"],
    ["done", "Concluido"],
    ["canceled", "Cancelado"],
  ]
    .map(([value, label]) => `<option value="${value}" ${value === current ? "selected" : ""}>${label}</option>`)
    .join("");
}

function statusLabel(status) {
  return {
    scheduled: "agendado",
    confirmed: "confirmado",
    done: "concluido",
    canceled: "cancelado",
  }[status];
}

function miniItem(title, detail, badge, action = "") {
  return `
    <article class="mini-item">
      <div>
        <strong>${escapeHTML(title)}</strong>
        <div class="muted">${escapeHTML(detail)}</div>
      </div>
      <div class="inline-actions">
        <span class="status-pill">${escapeHTML(badge)}</span>
        ${action}
      </div>
    </article>
  `;
}

function emptyState(message) {
  return `<div class="empty-state">${escapeHTML(message)}</div>`;
}

function findService(id) {
  return state.services.find((service) => service.id === id);
}

function findStaff(id) {
  return state.staff.find((person) => person.id === id);
}

function sortByDateTime(a, b) {
  return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
}

function publicUrl() {
  return `${location.origin}${location.pathname}#book/${state.business.slug}`;
}

async function copyPublicLink() {
  const link = publicUrl();
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(link);
  }
  document.querySelector("#copy-public-link").textContent = "Link copiado";
  window.setTimeout(() => {
    document.querySelector("#copy-public-link").textContent = "Copiar link";
  }, 1600);
}

function whatsappLink(phone, message) {
  return `https://wa.me/${onlyDigits(phone)}?text=${encodeURIComponent(message)}`;
}

function money(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDisplayDate(value) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function timeToMinutes(value) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function onlyDigits(value) {
  return String(value).replace(/\D/g, "");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function loadValue(key, fallback) {
  const stored = localStorage.getItem(key);
  if (!stored) {
    saveValue(key, fallback);
    return structuredClone(fallback);
  }
  return JSON.parse(stored);
}

function saveValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}
