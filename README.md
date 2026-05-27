# Agenda Facil

SaaS de agenda online para negocios de servicos como salao, barbearia, manicure, estetica e petshop.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready data layer
- Deploy recomendado na Vercel

## Funcionalidades

- Site comercial publico para venda do produto.
- Wizard de cadastro da empresa com usuario, senha, dados da loja, logo e aceite LGPD.
- Cadastro novo sem herdar dados da demo.
- Login da loja com e-mail e senha cadastrados.
- Preparacao para login com Google via Supabase Auth.
- Planos gratuito, 1 mes, 3 meses e 12 meses.
- Preparacao para checkout com Mercado Pago, InfinitePay ou Stripe.
- Checkout inicial com Mercado Pago por API route.
- Webhook base para eventos de pagamento.
- Protecao client-side de rotas do painel.
- Login demonstrativo por perfil.
- Central interna da plataforma.
- Painel da loja com dados do negocio.
- Cadastro de negocio.
- Cadastro de servicos com preco e duracao.
- Cadastro de profissionais.
- Agenda diaria com status.
- Agendamento manual pelo dono.
- Link publico para clientes agendarem.
- Horarios por dia da semana com intervalo.
- Validacao de disponibilidade por duracao do servico e horarios ocupados.
- Confirmacao manual ou automatica de agendamentos.
- Mensagem pronta para WhatsApp.
- Persistencia local para demonstracao.
- Schema inicial para Supabase em `supabase/schema.sql`.

## Como rodar

```bash
npm install
npm run dev
```

Para configurar ambiente real, copie `.env.example` para `.env.local` e preencha as chaves. Veja `DEPLOY.md`.

Acesse:

```text
http://127.0.0.1:4180
```

Login de demonstracao:

```text
dono@agenda.local
admin123

admin@agenda.local
admin123
```

Use `dono@agenda.local` para acessar a central interna da plataforma. Use `admin@agenda.local` para acessar o painel da loja.

## Rotas

- `/` site comercial.
- `/cadastro` wizard de cadastro da loja.
- `/login` login.
- `/interno` central interna da plataforma.
- `/admin` atalho legado da central interna.
- `/painel` painel da loja.
- `/agenda/studio-aurora` agendamento publico.

## Proximas evolucoes

O planejamento detalhado esta em `CHECKLIST.md`.

Prioridade atual:

1. Trocar `localStorage` por Supabase.
2. Ativar Supabase Auth com e-mail/senha e Google.
3. Isolar dados por loja com RLS.
4. Integrar pagamento recorrente.
5. Evoluir agenda com bloqueios, reagendamento e notificacoes.
