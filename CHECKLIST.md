# Checklist de evolucao do Agenda Facil

## 1. Fundacao segura com Supabase

- [x] Documentar checklist do produto.
- [x] Criar estrutura de perfis de usuario.
- [x] Criar vinculo usuario-loja.
- [x] Ativar RLS nas tabelas principais.
- [x] Criar politicas para loja acessar apenas seus proprios dados.
- [x] Criar politicas para leitura publica da agenda por slug.
- [x] Criar camada de dados Supabase com fallback local.
- [x] Ligar painel e agenda publica a camada Supabase quando configurada.
- [ ] Remover fallback `localStorage` no modo producao.
- [ ] Criar seed de demo separado dos dados reais.

## 2. Autenticacao real

- [x] Preparar Supabase Auth com e-mail e senha no client.
- [x] Preparar login com Google no client.
- [x] Criar recuperacao de senha.
- [x] Proteger `/painel` para usuarios logados.
- [x] Proteger `/interno` para usuario administrador.
- [ ] Remover login demonstrativo fixo antes da producao.

## 3. Multiempresa

- [x] Preparar RLS para cada usuario acessar apenas a propria loja.
- [x] Preparar mais de um usuario por loja no schema.
- [x] Criar papeis no schema: dono, atendente e admin da plataforma.
- [ ] Painel interno listar lojas cadastradas do banco.
- [ ] Bloquear slug duplicado.

## 4. Pagamentos e planos

- [x] Escolher provedor inicial para Brasil.
- [x] Preparar checkout do plano mensal.
- [x] Preparar checkout do plano trimestral.
- [x] Preparar checkout do plano anual.
- [x] Criar webhook base de pagamento.
- [ ] Validar webhook com API do Mercado Pago e ativar/cancelar loja conforme pagamento.
- [ ] Aplicar limite do plano gratuito.

## 5. Agenda profissional

- [ ] Horarios por dia da semana.
- [ ] Bloqueio de horarios e feriados.
- [ ] Intervalo de almoco.
- [ ] Reagendamento pelo cliente.
- [ ] Cancelamento pelo cliente.
- [ ] Historico de status.
- [ ] Notificacoes por WhatsApp.

## 6. LGPD e juridico

- [x] Criar pagina de Politica de Privacidade.
- [x] Criar pagina de Termos de Uso.
- [x] Preparar salvamento de aceite com user agent e versao do termo.
- [ ] Criar exportacao de dados da loja.
- [ ] Criar exclusao/anonimizacao de dados.

## 7. Venda e operacao

- [ ] Melhorar copy do site comercial.
- [ ] Criar pagina de precos dedicada.
- [ ] Criar FAQ.
- [ ] Criar roteiro de demonstracao.
- [ ] Criar checklist de onboarding do cliente.
- [ ] Preparar deploy em Vercel.
- [ ] Preparar dominio e analytics.
