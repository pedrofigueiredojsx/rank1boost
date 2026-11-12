# Rank1Boost (rank1boost.com)

Marketplace de boost, pilot, coach, aluguel por hora e pacotes (Vicious Saddle) para **WoW PvP**.

**Stack:** Next.js 16 · TypeScript · **styled-components** (sem Tailwind) · Prisma 7 · Supabase (banco + login) · Zod
**Visual:** flat, amarelo do R1 (`#F7C600`) e preto, fontes Outfit (títulos) e Inter (texto), hospedadas no próprio projeto.

---

## Como rodar (passo a passo)

### 0. O que você precisa ter instalado
- **Node.js 22 LTS** (nodejs.org). Para conferir, abra o terminal e rode `node -v` (precisa ser 20.19 ou mais novo).
- Um editor (VS Code) e uma conta grátis no **Supabase** (supabase.com).

### 1. Criar o projeto no Supabase (banco + login)
1. No Supabase, clique em **New project**, escolha um nome e **guarde a senha do banco** que você definir.
2. Vá em **Authentication → Providers → Email** e **desligue "Confirm email"** (só para desenvolvimento; senão você precisa confirmar cada e-mail de teste).
3. Clique em **Connect** (botão no topo do projeto) e copie a string do **Session pooler**. A conexão direta é só IPv6 e costuma falhar no Brasil.
4. Em **Project Settings → API**, copie a **Project URL** e a **anon key** (ou publishable key).

### 2. Configurar o projeto
Dentro da pasta do projeto, no terminal:

```bash
cp .env.example .env      # no Windows (PowerShell): copy .env.example .env
```

Abra o `.env` e preencha:
- `DATABASE_URL`: a string do Session pooler (troque `[SENHA]` pela senha do banco)
- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`: os dois valores do passo 1.4
- Deixe `ALLOW_FAKE_PAYMENTS="true"`

### 3. Instalar, criar as tabelas e rodar

```bash
npm install                            # baixa as dependências
npx prisma migrate dev --name init     # cria as tabelas no Supabase e gera o client do Prisma
npm run db:seed                        # cadastra o catálogo de serviços (preços de exemplo)
npm run db:check                       # deve mostrar "Serviços cadastrados: 10"
npm run dev                            # sobe o site em http://localhost:3000
```

### 4. Virar admin
1. Abra `http://localhost:3000/signup` e crie a sua conta (tipo **Cliente**).
2. No terminal: `npm run make-admin -- seu@email.com`
3. Saia e entre de novo. O botão "Meu painel" leva ao painel admin.

### 5. Testar o fluxo completo
Use um navegador normal e uma aba anônima, para ter duas contas ao mesmo tempo:

1. **Cliente:** escolhe um serviço na home, cria o pedido e clica em **Simular pagamento**.
2. **Booster** (outra conta, tipo Booster): preenche o perfil em `/booster/profile`.
3. **Admin:** em `/admin`, aprova o booster e define o nível dele.
4. **Booster:** em `/booster`, candidata-se ao pedido aberto.
5. **Admin:** abre o pedido e clica em **Atribuir**.
6. **Booster:** Começar o serviço → Marcar como concluído. O chat do pedido já funciona.
7. **Cliente:** Confirmar e liberar pagamento.
8. **Admin:** **Simular repasse** fecha o pedido como pago.

### Se algo der errado
| Sintoma | Causa provável |
|---|---|
| `Environment variable not found: DATABASE_URL` | O `.env` não existe ou está em outra pasta |
| Erro de conexão / timeout no `migrate` | Use a string do **Session pooler**, não a conexão direta |
| `Cannot find module '@/generated/prisma/client'` | Falta gerar o client: `npx prisma generate` |
| Cadastro não loga sozinho | "Confirm email" ainda está ligado no Supabase |
| Home sem serviços | Falta rodar `npm run db:seed` |
| Já tinha rodado uma migration antiga neste banco | `npx prisma migrate reset` (apaga tudo; só use em banco de teste) |

---

## O que já está pronto

- Landing em português e inglês (botão PT / EN), catálogo vindo do banco
- Cadastro e login (cliente, booster, admin) pelo Supabase Auth
- Pedido com link do Armory/Check-PvP, classe, spec, ratings, horas, gear da season e nível do booster
- Preço calculado **no servidor** (rating, hora ou fixo, mais nível do booster e acréscimo sem gear)
- Máquina de estados do pedido (`src/lib/order-state.ts`) com log de auditoria
- Perfil de booster, aprovação e nível pelo admin, candidatura, atribuição pelo admin
- Chat por pedido (polling a cada 4 s) com a linha do tempo de status
- Painéis do cliente, do booster e do admin

## O que é SUA parte (marcado com `TODO(você)` no código)

| O quê | Onde |
|---|---|
| Pagamento do cliente (Stripe/Pix): checkout e webhook | `src/lib/payments/provider.ts`, uma rota `src/app/api/webhooks/...` e o botão "Pagar" em `src/app/orders/[id]/page.tsx`. Quando o webhook confirmar, chame `confirmPaymentReceived()` |
| Repasse ao booster via PayPal Payouts | `sendPayout()` em `src/lib/payments/payout.ts` (e um botão de reenvio no painel admin) |
| Testes unitários | `npm test` já roda o Vitest. Crie arquivos `*.test.ts` dentro de `src/` |

Enquanto você não implementa, `ALLOW_FAKE_PAYMENTS=true` mostra os botões **Simular pagamento** e **Simular repasse**.
Eles não funcionam em produção.

### Sugestões de testes (comece por aqui)
- `pricing.ts`: cada modelo de preço (rating, hora, fixo), multiplicador de nível, acréscimo sem gear, erros (rating inválido, sem horas) e `splitPayout`
- `order-state.ts`: a matriz de `canTransition` (quem pode ir de qual status para qual) e `nextStatuses`
- `tiers.ts`: `canTakeOrder` em todas as combinações
- `validation.ts`: `profileUrlSchema` (só https, só Armory/Check-PvP) e `orderInputSchema` (spec que não é da classe, rating desejado menor que o atual)

---

## Como o visual funciona (styled-components)

```
src/ui/theme.ts        cores, fontes, raio e breakpoints (mude a cor aqui, muda o site todo)
src/ui/primitives.tsx  Button, Panel, Input, Badge, Stack, Row, Grid... (os blocos reutilizáveis)
src/ui/shell.tsx       cabeçalho e rodapé
src/ui/landing.tsx     hero com pódio, serviços, níveis e passos
src/ui/chat.tsx        estilos do chat
src/ui/global.tsx      reset e estilos globais
src/ui/registry.tsx    faz o CSS chegar já no HTML (necessário para styled-components no Next)
```

Regras para lembrar:
- Todo arquivo que **define** styled-components começa com `"use client"` (por isso ficam todos em `src/ui`). As páginas (servidor) só **usam** esses componentes.
- Props que só servem para estilo começam com `$` (ex.: `$variant`, `$gap`): assim elas não vão parar no HTML.
- Para mudar uma cor, edite `src/ui/theme.ts`. Para um botão novo, parta do `Button` em `primitives.tsx`.

## Estrutura

```
prisma/schema.prisma        modelo de dados
prisma/seed.ts              catálogo inicial
src/lib/pricing.ts          cálculo de preço e repasse
src/lib/order-state.ts      máquina de estados do pedido
src/lib/tiers.ts            níveis de booster e multiplicadores
src/lib/validation.ts       schemas Zod (inclui a trava de links)
src/lib/payments/           SUA PARTE: pagamento e repasse
src/app/actions/            Server Actions (auth, pedidos, booster/admin)
src/app/api/orders/[id]/messages   chat
src/proxy.ts                renova sessão e protege rotas (no Next 16, "middleware" virou "proxy")
```

## Manutenções para praticar
1. Preço por **faixa** de rating (hoje é linear por 100 pontos): `calcOrderPrice` + nova tabela
2. Traduzir as telas restantes para inglês (hoje só landing, menu e login) ou migrar para `next-intl`
3. Trocar o polling do chat por **Supabase Realtime**
4. Avisos por e-mail (Resend) quando chegar mensagem ou mudar o status
5. Avaliação do booster (a tabela `Review` já existe) depois da confirmação
6. Motivo da suspensão de booster e fluxo de contestação
7. Limite de taxa (rate limit) no login e no chat
8. Migrar para Cache Components (desligado em `next.config.ts` de propósito)
9. Páginas de SEO em inglês por serviço ("Rank 1 Boost", "Arena Boost") e imagem de compartilhamento (Open Graph)

## Avisos
- O projeto **não foi testado contra um Supabase real**: compila, passa no lint e na checagem de tipos, o servidor de produção sobe e entrega as páginas com o CSS, e a lógica de preço, estados e validação foi conferida. O primeiro login de verdade é com você.
- Nunca guarde senha de conta de jogo no banco. Se o pilot exigir credenciais, use cofre/criptografia e revise o risco antes.
- Os preços do seed e os multiplicadores de nível são exemplos.
- `src/app/terms/page.tsx` é um modelo: revise com um profissional antes de operar.
