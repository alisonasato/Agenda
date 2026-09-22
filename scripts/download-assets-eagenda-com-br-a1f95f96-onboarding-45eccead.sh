#!/usr/bin/env bash
# Downloads the /onboarding/ page assets into public/sites/eagenda-com-br-a1f95f96/onboarding-45eccead/.
set -euo pipefail
D=public/sites/eagenda-com-br-a1f95f96/onboarding-45eccead
mkdir -p $D
# Welcome animation played by lottie-web on step 1.
curl -fsSL -o $D/hello.json "https://arquivos.eagenda.com.br/static/lotties/hello.json?v=2"
