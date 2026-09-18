"use client";

import { useRef, useState } from "react";
import { CardIcon, CaretDownIcon, CaretUpIcon, CheckReadIcon, InfoIcon } from "./icons";
import { Modal, ModalSubmit } from "./Modal";

const PRESETS = ["50000", "100000", "250000", "500000"];
const BONUS = [
  ["0 – 499999", "+0%"],
  ["500000 – 999999", "+10%"],
  ["1000000 – 2499999", "+20%"],
  ["2500000 – 4999999", "+30%"],
  ["5000000+", "+40%"],
];
// Price per coin on the live account (BRL), used for the monthly-recharge estimate.
const RATE = 0.0011;
// The live account has no balance and no monthly recharge yet.
const BALANCE = 0;
const CURRENT_MONTHLY_COINS = 0;

function Checkbox({ id, label, checked, onChange, small }: { id?: string; label?: string; checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  return (
    <label className={`hcheckbox${small ? " hcheckbox--sm" : ""}`}>
      <input type="checkbox" id={id} className={`${small ? "mt-0.5 " : ""}hcheckbox-input`} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="hcheckbox-box" aria-hidden="true">
        <CheckReadIcon className="hcheckbox-check w-3 h-3" />
        <span className="hcheckbox-dash" aria-hidden="true" />
      </span>
      {label && <span className="hcheckbox-label">{label}</span>}
    </label>
  );
}

/** "Adicionar Créditos": buy AgendaCoins, optionally as a monthly recharge. Opened from the Comunicação pages. */
export function AddCreditsModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const coins = parseFloat(amount) || 0;
  const monthlyValue = (coins * RATE).toFixed(2).replace(".", ",");
  // Same as the original's stepper: native stepUp/stepDown, so min/step apply.
  const step = (dir: 1 | -1) => {
    if (!input.current) return;
    if (dir > 0) input.current.stepUp();
    else input.current.stepDown();
    setAmount(input.current.value);
  };

  return (
    <Modal
      id="add-credits-modal"
      title="Adicionar Créditos"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <ModalSubmit id="add-credits-modal" form="add-credits-form" icon={<CardIcon />} label="Continuar para Pagamento" disabled={!accepted} />
        </>
      }
    >
      <form id="add-credits-form" onSubmit={(e) => e.preventDefault()}>
        <input type="hidden" name="is_recurring" value={recurring ? "1" : "0"} />
        <div className="space-y-4">
          <p className="text-sm text-gray-500 inter-regular">
            Saldo atual: <strong className="text-gray-900">{BALANCE}</strong> AgendaCoins
          </p>

          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_amount">
              Quantidade de AgendaCoins <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap hinput-wrap--number">
              <input
                ref={input}
                id="id_amount"
                min={50000}
                step={1000}
                placeholder="50000"
                className="hinput"
                type="number"
                name="amount"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="hinput-stepper" aria-hidden="true">
                <button type="button" tabIndex={-1} className="hinput-step hinput-step--up" onClick={() => step(1)}>
                  <CaretUpIcon />
                </button>
                <button type="button" tabIndex={-1} className="hinput-step hinput-step--down" onClick={() => step(-1)}>
                  <CaretDownIcon />
                </button>
              </span>
            </div>
            <p className="hinput-desc">Mínimo: 50.000 AgendaCoins</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p} type="button" className="hbtn hbtn--secondary hbtn--sm" onClick={() => setAmount(p)}>
                {Number(p).toLocaleString("pt-BR")}
              </button>
            ))}
          </div>

          <details>
            <summary className="hinput-desc inline-flex items-center gap-1.5 cursor-pointer select-none">
              <InfoIcon className="w-3.5 h-3.5" />
              Ver tabela de bônus
            </summary>
            <table className="mt-2 w-full text-xs">
              <thead>
                <tr className="text-gray-500">
                  <th className="py-1 text-left font-medium inter-regular">Faixa</th>
                  <th className="py-1 text-right font-medium inter-regular">Bônus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {BONUS.map(([range, bonus]) => (
                  <tr key={range}>
                    <td className="py-1.5 text-gray-700 inter-regular">{range}</td>
                    <td className="py-1.5 text-right font-semibold text-[color:var(--color-primary)] inter-regular">{bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>

          <div className="space-y-1.5">
            <Checkbox label="Ativar recarga mensal automática" checked={recurring} onChange={setRecurring} />
            <p className="hinput-desc">No próximo mês, o mesmo valor de AgendaCoins será incluído na sua assinatura e creditado automaticamente.</p>
            {/* Kept mounted like the original's x-show blocks (they affect the space-y margins). */}
            <p className="hinput-desc text-amber-600" style={recurring && CURRENT_MONTHLY_COINS > 0 ? undefined : { display: "none" }}>
              Você já tem <span>{CURRENT_MONTHLY_COINS.toLocaleString("pt-BR")}</span> coins/mês na assinatura — confirmar SUBSTITUI esse valor (não soma).
            </p>
            <p className="hinput-desc" style={recurring && coins > 0 ? undefined : { display: "none" }}>
              A partir do próximo mês: <span>{coins.toLocaleString("pt-BR")}</span> coins/mês = <span>BRL {monthlyValue}</span> incluídos na assinatura.
            </p>
            <div className="pt-1" style={CURRENT_MONTHLY_COINS > 0 ? undefined : { display: "none" }}>
              <button type="button" className="hbtn hbtn--danger-soft hbtn--sm">
                Cancelar recarga mensal ativa
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox id="add-credits-accept" checked={accepted} onChange={setAccepted} small />
            <span className="text-xs text-gray-600 inter-regular">
              Eu li e aceito as condições gerais da compra de AgendaCoins e os{" "}
              <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] hover:underline">
                Termos de Uso
              </a>
              .
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
