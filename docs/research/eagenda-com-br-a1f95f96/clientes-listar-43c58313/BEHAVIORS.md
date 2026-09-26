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
- **Consolidar** abre o modal de dois passos do original: marcar os campos que identificam
  duplicatas (Email, Telefone, CPF/Identificação), "Continuar" mostra a revisão (campos
  selecionados, grupos encontrados e registros a fundir, este em vermelho) e "Confirmar Fusão"
  funde de verdade — mantém o primeiro cadastro de cada grupo, preenche os campos vazios dele com
  os dos outros e reaponta agendamentos e lista de espera para quem ficou.
- **Exportar** baixa `clientes-AAAA-MM-DD.csv` com o que a tabela está mostrando.
- **Filtros** filtra por nome, CPF, e-mail e telefone. "Empresa" e "Documento da Empresa" existem no
  original (ele manda `company_filter` e `company_document_filter`), mas o cadastro de cliente não
  tem empresa em nenhuma das telas, então aqui eles não casam com nada — como no original vazio.

## Diferenças em relação ao original
- O original aceita .csv, .xlsx e .xls e oferece "Baixar modelo (.xlsx)"; o clone roda só no
  navegador, então aceita .csv e o modelo sai em .csv.
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
