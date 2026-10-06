# /users/dominios — Behaviors

## Data (fase de lógica)
- As linhas vêm de `data.domains`: nome, situação, quando foi verificado e o valor do TXT.
- A busca filtra pelo nome sem acento e sem caixa (`fold`); as pílulas filtram pela situação;
  "Limpar filtros" zera as duas.
- "Novo Domínio" exige o nome e grava o domínio como `pending`, sem data de verificação e com um
  TXT novo — que é o que o texto do formulário promete entregar depois de registrar.
- O "olhinho" mostra o domínio, a situação, o TXT para copiar e a data. "Verificar Agora" só
  aparece enquanto o domínio não está verificado, como o botão `hidden` do original; confirmar
  marca `verified` com a data de hoje.
- A lixeira abre "Remover domínio?" com o nome no texto e remove a linha ao confirmar.
- Nada é consultado no DNS: verificar é só mudar o estado.

## Verificação
No build estático: a tela abriu com os dois domínios da semente (um Verificado com data, um
Pendente com "—"). A pílula "Pendentes" deixou só o segundo, e buscar "filial" também; "Limpar
filtros" devolveu os dois. Registrar `novo.exemplo.com.br` gravou a linha como Pendente; o olhinho
trouxe o TXT `seiri-verificacao=…` e o botão "Verificar Agora", que passou a linha para Verificado
com a data de hoje. Reabrir o já verificado não mostrou o botão. Remover mostrou o nome no diálogo
e deixou duas linhas.

## Diferenças em relação ao original
- O TXT é sorteado no navegador ao registrar; no original ele vem do servidor.
- Verificar não consulta DNS nenhum — e por isso nunca resulta em "Falha", que só existe na
  semente e no filtro.
- O corpo do modal de detalhe é inferido: o original o carrega do servidor e a conta verificada não
  tinha domínio.
