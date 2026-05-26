# Agenda Facil

SaaS de agenda online para negocios de servicos como salao, barbearia, manicure, estetica e petshop.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready data layer
- Deploy recomendado na Vercel

## Funcionalidades

- Login demonstrativo por perfil.
- Painel do dono da plataforma.
- Painel do cliente com dados do negocio.
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

Use `dono@agenda.local` para acessar o painel do dono da plataforma. Use `admin@agenda.local` para acessar o painel do cliente.

## Rotas

- `/` login.
- `/admin` painel do dono da plataforma.
- `/painel` painel do cliente.
- `/agenda/studio-aurora` agendamento publico.

## Proximas evolucoes

- Trocar `localStorage` por banco de dados.
- Criar planos por assinatura.
- Adicionar lembretes automaticos.
- Criar tela de bloqueio de horarios.
- Adicionar pagamento online para sinal.
