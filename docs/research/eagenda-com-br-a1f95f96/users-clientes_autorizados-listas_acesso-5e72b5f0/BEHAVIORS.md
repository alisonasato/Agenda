# /users/clientes_autorizados/listas_acesso — Behaviors

## Scroll sweep
- Page fits the viewport (doc height 900 at 1440×900); only the table scrolls. No scroll-driven effects.
- The action bar scrolls horizontally with `.hrail-arrow` buttons when narrow.

## Click sweep
- **Agenda:** empty for this account. **Serviço:** lists the account's service.
  Each popover is 240px with search, "Limpar"/"Concluir" and a count badge on the trigger.
- **Limpar filtros:** resets the search and both popovers. It sits alone on its row, aligned right —
  this page has no status tags, unlike the other list pages.
- **Nova Lista:** opens a modal on the live site (out of scope here).
- **Gestão Individual:** links to the per-client page, which is not cloned.

## Hover states
- Buttons and rows follow the shared `.hbtn` / `.htable` rules.

## Per-state content
- Unfiltered empty state: "Nada por aqui ainda / Assim que houver registros, eles aparecerão nesta
  tabela." Filtered: "Nenhum resultado encontrado / Nenhum registro corresponde aos filtros
  aplicados. Ajuste ou limpe os filtros para ver mais resultados."
- Table keeps 10 fixed empty rows (row height 3.5rem, head 38px).

## Responsive sweep
- **1440:** search 288px at left, buttons at right; table 1072 wide, empty message 389×130.
- **768:** same rows, action bar starts scrolling.
- **<768:** search full width and the button row wraps below; the table scrolls horizontally.

## Data (fase de lógica)
- **Nova Lista** abre o modal clonado de `/users/clientes_autorizados/listas_acesso/nova`, com as
  seis seções do original: Dados Gerais, Limites de Agendamento, Permissões, Lista Externa de
  Acesso, Convites de cadastro e Mensagem de Acesso Negado.
- Como no original, "Período em dias" só aparece quando o período é Dias Corridos, os seletores de
  agendas e serviços só aparecem quando as caixas "acessar todas/todos" estão desmarcadas, e a URL
  e a chave da API só aparecem com a lista externa ligada.
- As listas vivem em `data.accessLists`. A tabela mostra o nome, o tipo de chave em chip,
  as permissões ("Todas · Todos" quando a lista não restringe), quantos clientes convidados, o
  limite com o período e o status, com editar e excluir.
- A busca filtra pelo nome; os filtros de Agenda e Serviço passam a oferecer os da conta.

## Verificação
No build estático: criar "Convênio Alfa" com chave Passaporte põe a linha com o chip do tipo,
"Todas · Todos", 0 clientes, limite "—" e o chip Ativa.

## Diferenças em relação ao original
- A chave secreta da API não é guardada, e a lista externa não é consultada: o clone não chama
  serviços de fora.
- A lista ainda não barra ninguém: o clone não tem a página pública onde o acesso seria checado.
- "Gestão Individual" continua sem destino, porque essa tela não foi clonada.
