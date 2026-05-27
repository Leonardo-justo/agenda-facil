# Deploy de producao

## 1. Supabase

1. Crie o projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Ative Authentication por e-mail/senha.
4. Ative Google em Authentication > Providers.
5. Configure as URLs permitidas:
   - `http://localhost:4180`
   - URL final da Vercel

## 2. Mercado Pago

1. Crie uma aplicacao no Mercado Pago.
2. Copie o access token de producao.
3. Configure `MERCADO_PAGO_ACCESS_TOKEN` no ambiente.
4. Aponte o webhook para:

```text
https://seu-dominio.com/api/webhooks/mercado-pago
```

## 3. Vercel

1. Importe o repositorio `agenda-facil`.
2. Configure as variaveis:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
MERCADO_PAGO_ACCESS_TOKEN=
```

3. Rode o build padrao:

```bash
npm run build
```

## 4. Checklist antes de vender

- criar usuario administrador da plataforma em `profiles` com `role = 'platform_admin'`
- testar cadastro de loja real
- testar login por e-mail/senha
- testar login com Google
- testar checkout mensal, trimestral e anual
- validar recebimento do webhook de pagamento
- revisar textos finais de termos e privacidade com dados da empresa
