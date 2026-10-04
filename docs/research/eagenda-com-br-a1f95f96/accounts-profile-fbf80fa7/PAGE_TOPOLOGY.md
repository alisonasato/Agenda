# Sua Conta — Page Topology

Source: `https://eagenda.com.br/accounts/profile/`
Route: `/accounts/profile` (title "Sua Conta")
Page key: `accounts-profile-fbf80fa7`

## Shell
`DashboardShell` with no sidebar item of its own — the page is reached from the account menu in the
topbar and from the e-mail warning on Configurações Gerais.
Container: `mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0 space-y-6`.

## Sections
1. **Header:** `havatar--lg` with the initial, the name, the e-mail with its Pendente/Verificado
   chip and "Conta ativa: <organização>".
2. **Configurações da Conta** — one `hui-card` with six rows divided by `divide-y`, each one an
   icon, a title (some with chips), a description and a `hbtn--secondary hbtn--sm`:
   | Linha | Botão | Modal |
   |---|---|---|
   | Perfil | Editar Perfil | `personal-modal` (md) — Nome + Telefone |
   | Senha | Alterar Senha | `password-change-modal` (md) — senha atual + nova (×2) e as regras |
   | Verificação de Email | Gerenciar Email | `email-manage-modal` (lg) — lista de endereços e "Adicionar Novo Email" |
   | Contas Vinculadas | Gerenciar Contas | `social-connections-modal` (lg) — Facebook, Google, Microsoft Graph |
   | Novidades | Novidades | `newsletter-modal` (md) — inscrever/cancelar |
   | Duplo Fator de Autenticação | Validar Email | abre o modal de e-mail enquanto o endereço não está verificado |
3. **Organizações** — `hwidget-head` e uma `htable` de 10 slots com Conta · Função · Status ·
   Contexto.
4. **Zona de perigo** — `hui-card` com borda `border-danger/20` e a linha "Encerrar Conta"
   (`hbtn--danger-soft`), que abre `account-delete-modal` (md).

## Modais que o original tem e o clone não
`mfa-activate-modal`, `mfa-codes-modal`, `mfa-manage-modal` e `mfa-reauth-modal` só abrem depois do
e-mail verificado, e `org-change-modal` ("Alternar Conta") pertence ao seletor de contas do topo.
