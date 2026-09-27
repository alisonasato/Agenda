# /agendamentos/link_agendamento/ — Behaviors

## Scroll sweep
- Ordinary page scroll (doc height 900 at 1440×900, 1039 at 390); no scroll-driven effects.

## Click sweep
- **Copiar / WhatsApp / QR Code / Abrir** on every `.hlinkfield`: copy uses the clipboard, WhatsApp
  opens wa.me with the link, QR opens a modal, "abrir" opens the public page in a new tab.
- **Selecionar agendas:** `.hms` field opens a 494px popover with search, options
  ("Agenda Principal (sem identificador)"), a "N selecionados" counter and "Concluir".
  Picked agendas become chips with an "×"; a clear button empties them.
- **Gerar:** fills `#generated-link` with the segmented URL and enables Copiar and WhatsApp
  (both start `disabled`).
- **Accordion:** each agenda is a `<details>`; the chevron rotates 180° when open.
- **Salvar (identificador):** grava o identificador na agenda.

## Hover states
- `summary:hover` gets `bg-gray-50`; ghost icon buttons follow the shared `.hbtn--ghost` rules.

## Per-state content
- The live agenda has no slug, so it shows the warning chip "Sem identificador" and the hint
  "Defina um identificador para gerar o link amigável desta agenda."
- `.halert--warning` exists but stays empty/hidden until the generator has something to report.

## Responsive sweep
- **1440:** two cards side by side (526×238); "Todas as Agendas" row is horizontal.
- **1024–1439:** same two columns (`lg:grid-cols-2`).
- **<1024:** single column; the "Todas as Agendas" card stacks its label over the link field;
  buttons wrap. Card 342 wide at 390, no horizontal page scroll.

## Data (fase de lógica)
- As agendas vêm de `data.agendas` (só as ativas), e o identificador de cada uma é o novo campo
  `slug`, o mesmo que o passo Básicas da tela de configuração da agenda grava. Ou seja: dar um
  identificador aqui muda o que aquela tela abre, e vice-versa.
- Como no original, uma agenda **com** identificador mostra só **Link da Agenda** no corpo do
  accordion, sem o aviso "Sem identificador" e sem a frase abaixo do nome; **sem** identificador,
  mostra o aviso, a frase e o formulário. Salvar troca um estado pelo outro.
- O campo do identificador converte o que se digita ("Unidade Centro" vira `unidade-centro`), que é
  o que o original promete com "Espaços viram hífens".
- **Copiar** usa a área de transferência e o ícone vira um ✓ por um segundo e meio; **WhatsApp**
  abre `wa.me` com o link na mensagem; **QR Code** abre o modal com o QR gerado no navegador e o
  botão **Baixar** salva o PNG.
- **Gerar** monta o link do gerador com as agendas escolhidas e libera Copiar e WhatsApp.

## Verificação
No build estático: a Agenda Principal abre direto em **Link da Agenda**
(`https://minhaempresa.seiri.com.br/agenda/minhaempresa/agenda-principal`) e a Unidade Centro abre
no formulário; digitar "Unidade Centro" e salvar troca o corpo pelo link `.../unidade-centro` e
tira o aviso. O QR abre com a imagem e a URL embaixo. Escolher a Unidade Centro e clicar Gerar
escreve `https://seiri.com.br/agendamentos/incluir/minhaempresa/horarios?agendas=a2` e habilita
Copiar e WhatsApp.

## Diferenças em relação ao original
- O QR sai do pacote `qrcode` no próprio navegador; no original a imagem vem pronta do servidor.
- O painel do modal usa `hmodal-panel--md` porque o `--sm` do original não existe na folha de
  estilo extraída.
- "Links por agenda" promete links por serviço, mas a conta de origem não tem nenhum para capturar,
  então o clone mostra só os links por agenda, como o original mostra hoje.
