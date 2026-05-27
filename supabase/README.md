# Configuracao Supabase

Este diretorio prepara o Agenda Facil para sair do modo demonstracao e usar banco real.

## 1. Criar projeto

1. Crie um projeto no Supabase.
2. Ative Authentication.
3. Em Authentication > Providers, habilite:
   - Email
   - Google

## 2. Variaveis de ambiente

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
MERCADO_PAGO_ACCESS_TOKEN=seu-token-mercado-pago
```

## 3. Banco de dados

Execute o arquivo `schema.sql` no SQL Editor do Supabase.

O schema cria:

- planos
- perfis de usuario
- lojas
- membros da loja
- servicos
- profissionais
- agendamentos
- eventos de pagamento
- eventos de consentimento LGPD
- RLS para isolamento por loja

## 4. Regras importantes

- O cliente final pode criar agendamento em loja ativa.
- A loja ve e altera apenas seus proprios dados.
- A central interna deve usar usuario com `profiles.role = 'platform_admin'`.
- O painel da loja deve usar usuarios vinculados em `business_members`.

## 5. Proximo passo de implementacao

Depois de configurar o Supabase real, trocar o `localStorage` por chamadas no banco:

- cadastro cria `auth.users`, `profiles`, `businesses`, `business_members` e `consent_events`
- painel carrega loja pelo usuario logado
- agenda publica carrega loja por `slug`
- agendamento publico insere em `appointments`

## 6. Pagamento

O checkout inicial usa Mercado Pago por meio de `/api/checkout`.

Sem `MERCADO_PAGO_ACCESS_TOKEN`, o app mostra mensagem de ambiente demonstrativo.
Com o token, o endpoint cria uma preferencia de pagamento e retorna a URL de checkout.

O webhook base esta em `/api/webhooks/mercado-pago` e deve ser completado com validacao do pagamento antes da operacao comercial.
