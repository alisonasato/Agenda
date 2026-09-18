import { PlayIcon } from "./icons";
import { ROUTES } from "./Sidebar";

/**
 * The four credit cards on top of the Comunicação pages. The first one is the general
 * balance, labelled "Créditos Gerais" on the rules page and "AgendaCoins" on the status page.
 * The live account has no credits of any kind.
 */
export function CreditCards({ balanceLabel }: { balanceLabel: string }) {
  const cards = [
    { label: balanceLabel, cta: "Extrato", href: ROUTES.extrato },
    { label: "SMS", cta: "Comprar", href: ROUTES.pacotesEnvio },
    { label: "Email", cta: "Comprar", href: ROUTES.pacotesEnvio },
    { label: "WhatsApp", cta: "Comprar", href: ROUTES.pacotesEnvio },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 hui-reveal">
      {cards.map((c) => (
        <a key={c.label} href={c.href} className="hui-card hui-card--flush hkpi hkpi--link hkpi--cta">
          <div className="hkpi-body hkpi-body--trend">
            <p className="hkpi-label">{c.label}</p>
            <div className="hkpi-value-row">
              <span className="hkpi-value">0</span>
            </div>
            <p className="hkpi-caption">&nbsp;</p>
          </div>
          <span className="hkpi-cta" aria-hidden="true">
            <span>{c.cta}</span>
            <PlayIcon className="w-4 h-4 hkpi-cta-arrow" />
          </span>
          <div className="hkpi-spark">
            <div className="hkpi-spark-empty" aria-hidden="true" />
          </div>
        </a>
      ))}
    </div>
  );
}
