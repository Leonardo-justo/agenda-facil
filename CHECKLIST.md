# Checklist de evolucao do Agenda Facil

## 1. Fundacao segura com Supabase

- [x] Documentar checklist do produto.
- [x] Criar estrutura de perfis de usuario.
- [x] Criar vinculo usuario-loja.
- [x] Ativar RLS nas tabelas principais.
- [x] Criar politicas para loja acessar apenas seus proprios dados.
- [x] Criar politicas para leitura publica da agenda por slug.
- [ ] Ligar telas ao Supabase em vez de `localStorage`.
- [ ] Criar seed de demo separado dos dados reais.

## 2. Autenticacao real

- [x] Preparar Supabase Auth com e-mail e senha no client.
- [x] Preparar login com Google no client.
- [ ] Criar recuperacao de senha.
- [ ] Proteger `/painel` para usuarios logados.
- [ ] Proteger `/interno` para usuario administrador.
- [ ] Remover login demonstrativo fixo antes da producao.

## 3. Multiempresa

- [ ] Cada usuario deve acessar apenas a propria loja.
- [ ] Permitir mais de um usuario por loja.
- [ ] Criar papeis: dono, atendente e admin da plataforma.
- [ ] Painel interno listar lojas cadastradas do banco.
- [ ] Bloquear slug duplicado.

## 4. Pagamentos e planos

- [ ] Escolher provedor inicial para Brasil.
- [ ] Implementar checkout do plano mensal.
- [ ] Implementar checkout do plano trimestral.
- [ ] Implementar checkout do plano anual.
- [ ] Criar webhook de pagamento.
- [ ] Ativar/cancelar loja conforme pagamento.
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
- [ ] Salvar aceite com IP, user agent e versao do termo.
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
