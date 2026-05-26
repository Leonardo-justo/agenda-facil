"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CreditCard, LockKeyhole, Store, UserRound, type LucideIcon } from "lucide-react";
import { agendaPlans, useAgendaStore } from "@/lib/agenda-store";
import { saveStoreAccount } from "@/lib/auth-store";
import { money } from "@/lib/format";
import type { PaymentProvider, PlanCycle } from "@/types/agenda";

type SignupData = {
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
};

const providers: Array<{ id: PaymentProvider; label: string }> = [
  { id: "mercado_pago", label: "Mercado Pago" },
  { id: "infinite_pay", label: "InfinitePay" },
  { id: "stripe", label: "Stripe" },
];

const steps: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Conta", icon: UserRound },
  { label: "Loja", icon: Store },
  { label: "Plano", icon: CreditCard },
  { label: "LGPD", icon: LockKeyhole },
];

export function SignupWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const store = useAgendaStore();
  const initialPlan = (params.get("plano") || "free") as PlanCycle;
  const [step, setStep] = useState(0);
  const [created, setCreated] = useState(false);
  const [data, setData] = useState<SignupData>({
    ownerName: "",
    ownerEmail: "",
    password: "",
    name: "",
    document: "",
    phone: "",
    address: "",
    category: "Salao de beleza",
    logoUrl: "",
    plan: agendaPlans.some((plan) => plan.id === initialPlan) ? initialPlan : "free",
    paymentProvider: "mercado_pago",
    lgpdAccepted: false,
  });

  const selectedPlan = useMemo(() => agendaPlans.find((plan) => plan.id === data.plan) ?? agendaPlans[0], [data.plan]);

  function update(input: Partial<SignupData>) {
    setData((current) => ({ ...current, ...input }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }
    store.onboardBusiness(data);
    await saveStoreAccount({
      email: data.ownerEmail,
      password: data.password,
      ownerName: data.ownerName,
      businessSlug: data.name,
    });
    setCreated(true);
    window.setTimeout(() => router.push("/painel"), 900);
  }

  return (
    <main className="min-h-screen bg-canvas p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
          <Link className="inline-flex items-center gap-2 font-black text-brand" href="/">
            <ArrowLeft size={18} /> Voltar ao site
          </Link>
          <div className="text-right max-md:text-left">
            <p className="text-xs font-black uppercase text-brand">Cadastro da loja</p>
            <h1 className="text-3xl font-black">Configure sua conta em poucos passos</h1>
          </div>
        </header>

        <div className="grid grid-cols-[280px_minmax(0,1fr)] gap-5 max-lg:grid-cols-1">
          <aside className="rounded-card border border-line bg-white p-4">
            {steps.map(({ label, icon: Icon }, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`mb-2 flex w-full items-center gap-3 rounded-card border px-3 py-3 text-left font-black ${
                  step === index ? "border-brand bg-brand/10 text-brand" : "border-transparent"
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
            <div className="mt-5 rounded-card bg-canvas p-4 text-sm font-bold text-muted">
              Plano atual: <strong className="text-ink">{selectedPlan.name}</strong>
              <br />
              {money(selectedPlan.price)}
            </div>
          </aside>

          <form onSubmit={submit} className="rounded-card border border-line bg-white p-6 shadow-soft">
            {step === 0 && (
              <section className="grid gap-4">
                <StepHeader title="Crie seu acesso" text="Esses dados serao usados pelo responsavel da loja para entrar no painel." />
                <label>
                  Nome do responsavel
                  <input value={data.ownerName} onChange={(event) => update({ ownerName: event.target.value })} required />
                </label>
                <label>
                  E-mail de acesso
                  <input type="email" value={data.ownerEmail} onChange={(event) => update({ ownerEmail: event.target.value })} required />
                </label>
                <label>
                  Senha
                  <input type="password" minLength={8} value={data.password} onChange={(event) => update({ password: event.target.value })} required />
                </label>
                <p className="text-sm font-bold text-muted">Use no minimo 8 caracteres. Na versao com Supabase, a senha fica no Auth do provedor.</p>
              </section>
            )}

            {step === 1 && (
              <section className="grid gap-4">
                <StepHeader title="Dados da loja" text="Essas informacoes aparecem no painel e ajudam o cliente a reconhecer o estabelecimento." />
                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                  <label>
                    Nome da loja
                    <input value={data.name} onChange={(event) => update({ name: event.target.value })} required />
                  </label>
                  <label>
                    CNPJ ou CPF
                    <input value={data.document} onChange={(event) => update({ document: event.target.value })} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
                  <label>
                    Telefone/WhatsApp
                    <input value={data.phone} onChange={(event) => update({ phone: event.target.value })} required />
                  </label>
                  <label>
                    Tipo de negocio
                    <select value={data.category} onChange={(event) => update({ category: event.target.value })}>
                      <option>Salao de beleza</option>
                      <option>Barbearia</option>
                      <option>Esmalteria</option>
                      <option>Petshop</option>
                      <option>Estetica</option>
                      <option>Outro</option>
                    </select>
                  </label>
                </div>
                <label>
                  Endereco
                  <input value={data.address} onChange={(event) => update({ address: event.target.value })} required />
                </label>
                <label>
                  Logo da loja
                  <input placeholder="Cole a URL da imagem da logo" value={data.logoUrl} onChange={(event) => update({ logoUrl: event.target.value })} />
                </label>
              </section>
            )}

            {step === 2 && (
              <section>
                <StepHeader title="Escolha o plano" text="O gratuito serve para testar. Os pagos liberam uso comercial sem limite operacional." />
                <div className="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-md:grid-cols-1">
                  {agendaPlans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => update({ plan: plan.id })}
                      className={`rounded-card border p-4 text-left ${
                        data.plan === plan.id ? "border-brand bg-brand/10" : "border-line bg-white"
                      }`}
                    >
                      <span className="text-sm font-black text-muted">{plan.name}</span>
                      <strong className="mt-2 block text-2xl font-black">{money(plan.price)}</strong>
                      <p className="mt-2 text-sm font-semibold text-muted">{plan.description}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-5">
                  <label>
                    Forma de pagamento futura
                    <select value={data.paymentProvider} onChange={(event) => update({ paymentProvider: event.target.value as PaymentProvider })}>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-2 text-sm font-bold text-muted">
                    A integracao real pode ser ligada por checkout externo ou API do provedor escolhido.
                  </p>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="grid gap-4">
                <StepHeader title="Privacidade e revisao" text="Confirme os dados e aceite o tratamento necessario para operar a agenda." />
                <div className="rounded-card border border-line bg-canvas p-4 text-sm font-bold text-muted">
                  Usaremos nome, contato, endereco, dados da loja e agendamentos apenas para cadastro, operacao da agenda, suporte,
                  cobranca e comunicacoes essenciais do servico.
                </div>
                <label className="flex-row items-start gap-3 text-ink">
                  <input
                    className="mt-1 w-auto"
                    type="checkbox"
                    checked={data.lgpdAccepted}
                    onChange={(event) => update({ lgpdAccepted: event.target.checked })}
                    required
                  />
                  Aceito o tratamento dos dados conforme a politica de privacidade e termos de uso do Agenda Facil.
                </label>
                {created && (
                  <div className="flex items-center gap-2 rounded-card bg-brand/10 p-4 font-black text-brand">
                    <Check size={18} /> Conta criada. Abrindo painel da loja.
                  </div>
                )}
              </section>
            )}

            <footer className="mt-8 flex justify-between gap-3">
              <button type="button" className="rounded-card border border-line px-4 py-3 font-black" onClick={() => setStep((current) => Math.max(0, current - 1))}>
                Voltar
              </button>
              <button className="inline-flex items-center gap-2 rounded-card bg-brand px-5 py-3 font-black text-white">
                {step === 3 ? "Finalizar cadastro" : "Continuar"} <ArrowRight size={18} />
              </button>
            </footer>
          </form>
        </div>
      </div>
    </main>
  );
}

function StepHeader({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-4xl font-black max-md:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl font-semibold text-muted">{text}</p>
    </div>
  );
}
