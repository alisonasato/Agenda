# Alterar Plano — Page Topology

Source: `https://eagenda.com.br/users/alterar-plano/?version=3`
Route: `/users/alterar-plano` (title "Planos de Assinaturas", h1 "Alterar Plano")
Page key: `users-alterar-plano-be26ebe1`

## Shell
`DashboardShell` on Conta › Meu Plano, reached from "Ver todos os planos" on that page.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0`.

## Sections
1. **"Voltar para Meu Plano"** (`hbtn--secondary`, `ChevronLeftIcon`).
2. **Cycle toggle:** an `inline-grid grid-cols-2` pill inside `bg-slate-100 rounded-full border
   border-slate-200`; the active half is `bg-white text-primary shadow-sm`. "Anual" carries an
   `hchip--success` reading "economize".
3. **"Todos os planos incluem":** four `hchip--soft` chips, each with a `w-3.5 h-3.5` icon —
   Envio de e-mails (`LetterIcon`), Integrações (`PlugCircleIcon`), Agendamento até 365 dias
   (`ClockSolidIcon`), Histórico por 365 dias (`HistoryIcon`).
4. **Plan grid** (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6`): one `hui-card` per
   plan with a `bg-slate-100` top rule, the name in `nunito-black`, "Valor mensal" over
   `BRL <n> /mês`, the annual total only while the annual cycle is picked, then two figures
   (agendamentos/mês and usuários) and a `hbtn--primary hbtn--block` "Selecionar Plano"
   (`ArrowUpIcon`).

## Catalogue
| id | Plano | Mensal | Anual (por mês) | Anual (total) | Agendamentos | Usuários |
| --- | --- | --- | --- | --- | --- | --- |
| 3 | Básico | 45 | 40,67 | 488 | 500 | 3 |
| 4 | Intermediário | 90 | 81,33 | 976 | 1000 | 3 |
| 5 | Avançado | 172 | 157,17 | 1886 | 2000 | 3 |
| 220 | Empresa | 387 | 349,92 | 4199 | 5000 | 3 |

The original's `planType` toggle has a second branch (`ppu`) whose panel is empty on this account,
so the clone does not draw it.

## Deviation
The original links `/users/confirmar-plano/<id>` (plus `?frequencia=anual`). A static export has no
per-plan route, so the clone links `/users/confirmar-plano/?id=<id>&frequencia=anual` — the same
pattern the other per-record screens use.
