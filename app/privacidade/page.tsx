import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-canvas px-6 py-10">
      <article className="mx-auto max-w-4xl rounded-card border border-line bg-white p-8 shadow-soft">
        <Link className="font-black text-brand" href="/">
          Voltar
        </Link>
        <p className="mt-8 text-xs font-black uppercase text-brand">LGPD</p>
        <h1 className="mt-2 text-5xl font-black max-md:text-3xl">Politica de Privacidade</h1>
        <div className="mt-6 grid gap-5 font-semibold leading-7 text-muted">
          <p>
            O Agenda Facil trata dados pessoais para cadastrar lojas, operar agendas, registrar servicos, profissionais,
            clientes e horarios solicitados pelos canais publicos da loja.
          </p>
          <p>
            Os dados podem incluir nome, e-mail, telefone, endereco da loja, documento empresarial, nome do cliente final,
            telefone do cliente final e detalhes do agendamento.
          </p>
          <p>
            A finalidade do tratamento e permitir cadastro, autenticacao, suporte, cobranca, envio de comunicacoes
            essenciais e funcionamento da agenda online.
          </p>
          <p>
            A loja e responsavel por informar seus clientes sobre o uso da agenda e por manter seus dados atualizados. O
            titular pode solicitar acesso, correcao ou exclusao dos dados pelos canais de atendimento da loja ou da plataforma.
          </p>
          <p>
            Antes do uso em producao, esta politica deve receber dados juridicos da empresa operadora, canal oficial de
            contato e prazo de retencao definido.
          </p>
        </div>
      </article>
    </main>
  );
}
