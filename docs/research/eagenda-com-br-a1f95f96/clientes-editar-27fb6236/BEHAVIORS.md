# /clientes/&lt;id&gt;/editar/ — Behaviors

## Data (fase de lógica)
- O cliente vem do `?id=` na URL, lido do navegador (docs/DATA-LAYER.md). Salvar grava no mesmo
  cadastro; o resto do app (lista, detalhes, relatórios) enxerga a mudança na hora.
- Esta é a única tela que preenche identidade, naturalidade, distrito e os dados da empresa. Por
  isso os filtros "Empresa" e "Documento da Empresa" da lista passaram a filtrar de verdade, e o
  card de detalhes deixou de mostrar "—" nesses campos.

## Click sweep
- **Gênero**: quatro pílulas; clicar troca a marcada.
- **CEP**: o botão azul (ou Enter no campo) consulta o CEP e preenche Logradouro, Bairro, Estado e
  Município, com a mensagem "Endereço preenchido automaticamente!". CEP inválido mostra o erro no
  `.hinput-error`. O original consulta o próprio backend; aqui é o ViaCEP, como nas outras telas.
- **Salvar** grava e o toast passa a "Alterações salvas".
- **Voltar** vai para a tela de detalhes do mesmo cliente.

## Per-state content
- O save bar só aparece flutuando quando há mudança e o rodapé do formulário está fora da tela —
  igual ao original, que carrega com o toast escondido.
- O "sujo" é calculado comparando o formulário com o que foi salvo, não marcando uma flag a cada
  evento: o campo de telefone se re-formata sozinho quando as regras do país carregam, e isso
  acendia o toast sem ninguém ter digitado.

## Responsive sweep
- **1440 e 1024:** duas colunas por seção; Nome, Gênero e Logradouro ocupam a linha inteira.
- **<768:** uma coluna.

## Verification
Medições contra o ao vivo em PAGE_TOPOLOGY.md. Testado no build estático: trocar Profissão acende
o toast; o CEP 01310-100 traz "Avenida Paulista"/"Bela Vista" e resolve São Paulo; Salvar persiste
profissão, empresa, CNPJ (mascarado 12.345.678/0001-90) e naturalidade; a lista filtrada por
Empresa "aurora" deixa só o cliente editado.
