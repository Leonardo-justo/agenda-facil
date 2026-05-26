import Link from "next/link";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10">
      <article className="mx-auto max-w-4xl rounded-card border border-line bg-white p-8 shadow-soft">
        <Link className="font-black text-brand" href="/">
          Voltar
        </Link>
        <p className="mt-8 text-xs font-black uppercase text-brand">Uso da plataforma</p>
        <h1 className="mt-2 text-5xl font-black max-md:text-3xl">Termos de Uso</h1>
        <div className="mt-6 grid gap-5 font-semibold leading-7 text-muted">
          <p>
            O Agenda Facil oferece ferramentas para cadastro de loja, servicos, profissionais, agendamentos e link publico
            para recebimento de solicitacoes de horario.
          </p>
          <p>
            A loja contratante e responsavel pelas informacoes cadastradas, pelos atendimentos prestados, pela confirmacao
            dos horarios e pela comunicacao com seus clientes finais.
          </p>
          <p>
            Os planos pagos dependem de confirmacao do provedor de pagamento configurado. Recursos pagos podem ser limitados
            ou suspensos em caso de inadimplencia, cancelamento ou uso indevido.
          </p>
          <p>
            E proibido usar a plataforma para cadastrar conteudo ilegal, ofensivo, fraudulento ou que viole direitos de
            terceiros.
          </p>
          <p>
            Antes da operacao comercial, estes termos devem receber razao social, CNPJ, contato oficial e regras finais de
            cancelamento, reembolso e suporte.
          </p>
        </div>
      </article>
    </main>
  );
}
