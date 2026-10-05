# /users/confirmar-plano — Behaviors

## Data (fase de lógica)
- O plano vem de `?id=`; sem id (ou com um id desconhecido) a tela cai no primeiro do catálogo.
- As frequências saem de `PLAN_PRICINGS[plano]`; chegar com `?frequencia=anual` já deixa a linha
  anual escolhida, que é o que o link do catálogo manda.
- O CPF só aparece em Pessoa Física e o CNPJ só em Pessoa Jurídica, com as máscaras compartilhadas
  de `shared/masks` — as mesmas que as telas de cliente usam.
- O CEP preenche endereço, bairro e complemento e resolve estado e município pela cascata
  `useGeoCascade`, igual ao formulário de unidade.
- "Prosseguir para Pagamento" só acende com frequência, tipo de pessoa e os termos marcados; o
  clone para aí e diz que o original seguiria para o provedor de pagamento.

## Verificação
No build estático: abrir `?id=4&frequencia=anual` trouxe "Plano Intermediário" com a frequência
`R$ 976,00 para pagamento Anual` já escolhida (`plan_pricing` = 10). Escolher Pessoa Jurídica
trocou o campo para CNPJ e digitar `12345678000199` virou `12.345.678/0001-99`; escolher Pessoa
Física trouxe o campo de CPF de volta. Marcar os termos liberou o botão e submeter mostrou o aviso
de que o clone para aqui. O CEP `01310-100` preencheu "Avenida Paulista" e "Bela Vista" e resolveu
estado e município.

## Diferenças em relação ao original
- Nada é cobrado nem gravado: o clone não tem provedor de pagamento nem assinatura.
- O formulário mantém o `novalidate` do original, que valida no servidor; aqui quem segura o envio
  é o próprio botão.
- O preço final não é somado em tela — o original também não soma, ele manda tudo para o provedor.
