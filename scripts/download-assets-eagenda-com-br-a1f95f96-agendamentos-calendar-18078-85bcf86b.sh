#!/usr/bin/env bash
# Downloads assets used by the eAgenda calendar clone (shared logo/font come from the painel script).
set -euo pipefail
D=public/sites/eagenda-com-br-a1f95f96/shared
mkdir -p $D/fonts
# Inter (variable, latin subset) — the calendar island's .inter-* classes use it.
curl -fsSL -o $D/fonts/inter-latin.woff2 https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2
