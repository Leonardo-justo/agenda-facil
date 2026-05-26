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
- Planos gratuito, 1 mes, 3 meses e 12 meses.
- Preparacao para checkout com Mercado Pago, InfinitePay ou Stripe.
- Login demonstrativo por perfil.
- Central interna da plataforma.
- Painel da loja com dados do negocio.
- Cadastro de negocio.
- Cadastro de servicos com preco e duracao.
- Cadastro de profissionais.
- Agenda diaria com status.
- Agendamento manual pelo dono.
- Link publico para clientes agendarem.
- Mensagem pronta para WhatsApp.
- Persistencia local para demonstracao.
- Schema inicial para Supabase em `supabase/schema.sql`.

## Como rodar

```bash
npm install
npm run dev
```

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

- Trocar `localStorage` por banco de dados.
- Criar planos por assinatura.
- Adicionar lembretes automaticos.
- Criar tela de bloqueio de horarios.
- Adicionar pagamento online para sinal.
