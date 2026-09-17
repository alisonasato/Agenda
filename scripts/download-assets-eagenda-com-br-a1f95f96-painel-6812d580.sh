#!/usr/bin/env bash
# Downloads the public static assets used by the eAgenda /painel clone.
set -euo pipefail
mkdir -p public/sites/eagenda-com-br-a1f95f96/shared/{images/flags,fonts}
D=public/sites/eagenda-com-br-a1f95f96/shared
B=https://arquivos.eagenda.com.br/static
curl -fsSL -o $D/images/logo.png          $B/img/new_test_logo.png &
curl -fsSL -o $D/images/logo-minimal.png  $B/img/new_minimal_logo.png &
curl -fsSL -o $D/images/favicon.png       $B/img/favicon.png &
curl -fsSL -o $D/fonts/nunito-latin.woff2 $B/fonts/nunito/nunito-latin.woff2 &
wait
curl -fsSL -o public/sites/eagenda-com-br-a1f95f96/shared/images/flags/england_flag.svg https://arquivos.eagenda.com.br/static/img/flags/england_flag.svg
curl -fsSL -o public/sites/eagenda-com-br-a1f95f96/shared/images/flags/germany_flag.svg https://arquivos.eagenda.com.br/static/img/flags/germany_flag.svg
curl -fsSL -o public/sites/eagenda-com-br-a1f95f96/shared/images/flags/spain_flag.svg https://arquivos.eagenda.com.br/static/img/flags/spain_flag.svg
curl -fsSL -o public/sites/eagenda-com-br-a1f95f96/shared/images/flags/france_flag.svg https://arquivos.eagenda.com.br/static/img/flags/france_flag.svg
curl -fsSL -o public/sites/eagenda-com-br-a1f95f96/shared/images/flags/brazil_flag.svg https://arquivos.eagenda.com.br/static/img/flags/brazil_flag.svg
