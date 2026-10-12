# /clientes/listar — Behaviors

## Botões (fase de lógica)
Capturados no original em 25/09/2026 (modais lidos via HTMX) e refeitos aqui sobre os dados do
navegador (docs/DATA-LAYER.md).

- **Adicionar Cliente** e o lápis abrem o modal `create_person_form` do original: painel 3xl
  (768×794), campos Nome Completo* (mínimo 6 caracteres), E-mail*, Telefone, CPF/Documento,
  Data de Nascimento, Gênero (dois cartões de rádio), Nacionalidade, Profissão, Estado Civil e a
  seção "Endereço (Opcional)" com CEP, Logradouro, Número, Complemento, Bairro, País, Estado e
  Cidade. No topo ficam os dois alertas do original: `halert--danger` "Não foi possível salvar"
  (nome curto ou e-mail inválido) e `halert--accent` "Cliente já cadastrado" (mesmo e-mail ou
  documento de outro cadastro). Rodapé Cancelar / Salvar Cliente.
- **Importar** abre o modal "Importar Clientes" (lg): seletor de arquivo com arrastar e soltar,
  os nove chips de colunas esperadas (`cliente_id`, `nome`, `email`, `telefone`, `cpf`,
  `dt_nascimento`, `genero`, `nacionalidade`, `profissao`), as regras em lista e "Baixar
  modelo". Enviar sem arquivo repete o aviso do original ("Selecione um arquivo CSV para
  importar."); com arquivo, o resultado vira um alerta do tipo "2 clientes importados · 1 já
  existia". Uma linha só entra se tiver nome, e-mail ou CPF, e é ignorada se já existir por um
  desses três.
  - **Chips verdes:** ao escolher o arquivo, o script do original (`initializeImportClientsModal`, lido em
    12/10/2026) lê a primeira linha (PapaParse no .csv, SheetJS no .xlsx/.xls) e troca `hchip--default`
    por `hchip--success` nos chips das colunas que achou, sem diferenciar maiúsculas nem espaços nas
    pontas; tirar o arquivo apaga todos. Medido nas duas cores: chip normal `rgb(239,239,240)` com texto
    `rgb(51,65,85)`, chip achado `rgb(227,244,234)` com texto `rgb(0,102,39)`, mesmo tamanho (20px de
    altura, 11px/600). O clone faz o mesmo com a primeira linha de `.csv` e `.xlsx`; `.xls` e arquivo
    quebrado não acendem nada (o clone não os lê). A coluna `login` não tem chip, então não acende.
- **Consolidar** abre o modal de dois passos do original: marcar os campos que identificam
  duplicatas (Email, Telefone, CPF/Identificação), "Continuar" mostra a revisão (campos
  selecionados, grupos encontrados e registros a fundir, este em vermelho) e "Confirmar Fusão"
  funde de verdade — mantém o primeiro cadastro de cada grupo, preenche os campos vazios dele com
  os dos outros e reaponta agendamentos e lista de espera para quem ficou.
- **Exportar** baixa `lista_clientes_AAAA-MM-DD.xlsx` com os clientes ativos que a lista casa com a busca e
  os filtros, nas dez colunas do modelo de Importar (`clientSheet.ts`; ver "Diferenças"). No original o
  botão chama `exportClients()` (lido no script da página em 12/10/2026), que repete o endereço da lista
  com os filtros, sem `page`, e `export=xlsx`: o arquivo traz todos os clientes do filtro, não só a página.
  Aqui cada célula é texto, a data de nascimento sai "dd/mm/aaaa" e `login` sai vazio.
- **Filtros** filtra pelos seis campos: nome, CPF, e-mail, telefone, Empresa e Documento da Empresa.
  Os dois últimos usam a denominação social e o CNPJ que a tela de editar cadastro preenche.

## Ações da linha
Cada linha traz os três botões do original, `btn-icon btn-icon-sm` de 36×36 com 4px entre eles:
- **Visualizar** (`btn-icon-flat`, olho) leva à página de detalhes do cliente
  (docs/research/.../clientes-detalhes-df2cd359).
- **Editar** (`btn-icon-flat`, lápis) abre o modal de cadastro preenchido.
- **Remover** (`btn-icon-danger`, lixeira vermelha) abre o alerta "Desativar cliente?", que repete o
  texto do original: o nome em negrito, "deixa de aparecer nas listas; os agendamentos permanecem no
  histórico". Confirmar marca o cliente como inativo — ele some da lista, mas o cadastro e os
  agendamentos continuam lá, como no original, que desativa em vez de apagar.

## Diferenças em relação ao original
- O seletor do original aceita `.csv,.xlsx,.xls` (relido em 12/10/2026, junto com o texto "Planilha CSV,
  XLSX ou XLS de até 5 MB — arraste aqui ou clique para escolher."), e o clone passou a aceitar o mesmo e
  a ler **.csv e .xlsx** no navegador (`sheetFile.ts`, `xlsxRead.ts`). Numa planilha, a data de
  nascimento vem como número de dias (33010 é 17/05/1990) e é escrita "dd/mm/aaaa"; um texto já
  escrito fica como está. **.xls**, o formato binário antigo, avisa para salvar como .xlsx ou .csv, e um
  arquivo quebrado diz "Não foi possível ler a planilha." (alerta vermelho).
- "Baixar modelo (.xlsx)" baixa o mesmo arquivo que o original gera no servidor, medido em 12/10/2026
  (`/clientes/criar_xlsx`, lido numa conta sem clientes): `lista_clientes_AAAA-MM-DD.xlsx` (data do dia),
  aba "Clientes", **só a linha de cabeçalho**, sem exemplo, sem larguras e sem estilo, com dez colunas:
  `cliente_id`, `nome`, `email`, **`login`**, `telefone`, `cpf`, `dt_nascimento`, `genero`,
  `nacionalidade`, `profissao`. Os chips do modal listam só nove (sem `login`). O clone monta o arquivo no
  navegador (`clientSheet.ts`, `xlsx.ts`) e abre no `openpyxl`; a coluna `login` é ignorada ao
  importar, porque cliente aqui não tem login. O nome diz "lista" e o "Exportar" do original pede
  `?export=xlsx` na própria lista, então o clone trata o modelo como o export sem linhas e o export como
  o modelo com os clientes; não foi conferido, porque a conta de referência não tem clientes para
  exportar. Também não se sabe como o original escreve cada célula (data como data ou texto, CPF com ou
  sem máscara) nem o que põe em `cliente_id`; o clone usa a chave de acesso (ou o id), como no Exportar
  de Acesso Individual. Antes o modelo saía em `.csv`,
  com uma linha de exemplo que o original não tem.
- A lista de regras do original traz uma linha que o clone não tem ("Preencha o campo username com o
  e-mail de acesso para também criar o login do cliente.") e o clone traz outra que o original não tem
  ("Quem já está na lista com o mesmo nome, e-mail ou CPF é ignorado."); clientes aqui não têm login.
- País, Estado e Cidade vêm do pacote de dados local (`useGeoCascade`), não de `/autocomplete/`.
- O CEP é só um campo com máscara, como no original — não busca endereço.

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar is a rail with `.hrail-arrow` buttons when it overflows.

## Click sweep
- **Filtros:** dialog titled "Filtrar clientes" with Nome · CPF/CNPJ · Email · Telefone · Empresa ·
  Documento da Empresa, each a `.hinput--sm` with its own placeholder; footer "Limpar" / "Aplicar".
  Applying shows a count badge on the trigger.
- **Adicionar Cliente / Importar / Consolidar / Exportar:** open modals or download, on the live site and here (see "Botões").
- **Sidebar:** the "Clientes" group renders open, its toggle carries `.sidebar-group-active`, and
  "Listar Clientes" carries `.nav-item-active`.

## Hover states
- Buttons and table rows follow the shared `.hbtn` / `.htable` hover rules.

## Per-state content
- Unfiltered empty state: "Nenhum cliente cadastrado / Os clientes cadastrados ou importados
  aparecerão nesta lista." Filtered: "Nenhum cliente encontrado / Nenhum cliente corresponde à busca
  ou aos filtros aplicados. Ajuste ou limpe os filtros."
- Table keeps 10 fixed empty rows (row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide.
- **768:** same layout, action bar scrolls.
- **<768:** search full width, buttons wrap below; table 358 wide with no page overflow.
