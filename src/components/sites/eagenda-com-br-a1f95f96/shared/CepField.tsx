"use client";

import { useEffect, useState } from "react";
import { lookupCep } from "./useGeoCascade";

type CepStatus = { type: "loading" | "success" | "error"; msg: string } | null;
const CEP_COLORS = { loading: "#71717a", success: "#17c964", error: "#f31260" };
export type CepAddress = Awaited<ReturnType<typeof lookupCep>>;

/** Fills the uncontrolled street fields (#id_street, #id_neighbourhood, #id_complement) inside `root`. */
export function fillFromCep(root: HTMLElement | null, data: CepAddress) {
  const fill = (id: string, v?: string) => {
    const el = root?.querySelector<HTMLInputElement>(`#${id}`);
    if (el && v) el.value = v;
  };
  fill("id_street", data.logradouro);
  fill("id_neighbourhood", data.bairro);
  fill("id_complement", data.complemento);
}

/**
 * The original's CEP field: masks 00000-000 and, on blur, resolves the address with a status icon
 * and message. The original posts the CEP to its own backend; the prototype asks ViaCEP (public).
 */
export function CepField({ onFound }: { onFound: (address: CepAddress) => Promise<void> | void }) {
  const [cep, setCep] = useState("");
  const [status, setStatus] = useState<CepStatus>(null);

  useEffect(() => {
    if (!status || status.type === "loading") return;
    const t = setTimeout(() => setStatus(null), status.type === "success" ? 3000 : 5000);
    return () => clearTimeout(t);
  }, [status]);

  const lookup = async () => {
    if (cep.replace(/\D/g, "").length !== 8 || status?.type === "loading") return;
    setStatus({ type: "loading", msg: "Buscando..." });
    try {
      await onFound(await lookupCep(cep));
      setStatus({ type: "success", msg: "Endereço preenchido!" });
    } catch (e) {
      setStatus({ type: "error", msg: e instanceof Error ? e.message : "Erro ao consultar CEP" });
    }
  };

  return (
    <div className="hinput-field hinput-field--block">
      <label className="hinput-label" htmlFor="id_cep">
        CEP
      </label>
      <div className="hinput-wrap">
        <input
          id="id_cep"
          maxLength={9}
          className="hinput"
          type="text"
          name="cep"
          placeholder="00000-000"
          style={{ paddingRight: "2.25rem" }}
          value={cep}
          disabled={status?.type === "loading"}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 8);
            setCep(v.length > 5 ? v.replace(/^(\d{5})(\d{0,3})/, "$1-$2") : v);
          }}
          onBlur={lookup}
        />
        <div
          className={status ? undefined : "hidden"}
          style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", lineHeight: 0, fontSize: 0, pointerEvents: "none" }}
        >
          <svg className={`cep-loading animate-spin w-4 h-4 text-primary${status?.type === "loading" ? "" : " hidden"}`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <svg
            className={`cep-success w-4 h-4 text-success${status?.type === "success" ? "" : " hidden"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg className={`cep-error w-4 h-4 text-error${status?.type === "error" ? "" : " hidden"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div className="text-xs" hidden={!status}>
        {status && <span style={{ color: CEP_COLORS[status.type] }}>{status.msg}</span>}
      </div>
    </div>
  );
}
