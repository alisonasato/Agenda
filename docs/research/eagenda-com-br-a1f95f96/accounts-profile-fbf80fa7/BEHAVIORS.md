# /accounts/profile — Behaviors

## Data (fase de lógica)
- O nome, o e-mail e o telefone vêm do membro proprietário (`data.members` com `profile: "owner"`),
  que é o mesmo registro que "Convidar equipe" mostra — editar aqui muda lá também.
- `data.profile` guarda o que é só desta tela: `emailVerified`, `newsletter`, `socialAccounts`,
  `extraEmails` e `orgSlug`.
- **Editar Perfil** grava nome e telefone no membro proprietário; o cabeçalho da página e o menu
  "Conectado como" do topo passam a mostrar o novo valor.
- **Alterar Senha** não tem onde gravar (o clone não tem login), então só aplica as validações que
  o original faz no navegador: mínimo de 8 caracteres, não inteiramente numérica e as duas iguais.
- **Gerenciar Email** lista o endereço principal e os extras. "Tornar Principal" troca o endereço
  do membro e manda o antigo para os extras, deixando a verificação pendente de novo; "Remover"
  tira um extra e recusa o principal; "Reenviar Verificação" e "Adicionar" avisam na própria tela.
- **Contas Vinculadas** liga e desliga Facebook, Google e Microsoft Graph em `socialAccounts`, sem
  OAuth nenhum.
- **Novidades** alterna `newsletter`, e o chip acompanha.
- **Encerrar Conta** só libera o botão com a caixa marcada e o e-mail digitado igual ao do usuário;
  confirmar fecha o modal sem apagar nada.
- A tabela **Organizações** mostra a organização do usuário como Proprietário da Conta e uma linha
  por conta filial de `data.accounts`.

## Verificação
No build estático: os seis modais abrem com os mesmos títulos, rodapés e campos do original. Trocar
o nome para "Maria Souza Lima" atualizou o cabeçalho; "Inscrever-se" trocou o chip para "Você está
inscrito"; conectar o Google moveu o provedor para a lista de conectadas; adicionar
maria.lima@exemplo.com.br gravou o extra e avisou "Verificação enviada para ..."; "Tornar Principal"
trocou o endereço do membro e mandou o antigo para os extras; em "Encerrar Conta" o botão só saiu de
`disabled` com a caixa marcada e o e-mail certo digitado.

## Diferenças em relação ao original
- Não há autenticação: alterar a senha não altera nada e encerrar a conta não apaga nada.
- O duplo fator exige e-mail verificado no original; como o clone não envia e-mail, a linha fica no
  estado "Inativo · Requer email verificado" e o botão leva ao modal de e-mail, como no original.
- Vincular uma conta de terceiro grava só o nome do provedor: não há OAuth.
