"use client";

import { useState, type CSSProperties } from "react";
import { ChevronLeftIcon, PlaneIcon, UploadIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { nextId, update, useData } from "@/lib/seiri/store";
import { IMPORT_STATUSES, type ClientImport as ImportRow } from "@/lib/seiri/types";

const COLUMNS = ["Usuário", "Nome do Arquivo", "Enviado em", "Status"];
const SLOTS = 10;
const OWNER = "contato@exemplo.com.br";

/** "Importar Clientes": send a sheet of clients, and the log of what was sent before. */
export function ClientImport() {
  const data = useData();
  const [file, setFile] = useState<File | null>(null);

  const rows = data.clientImports;

  const send = () => {
    if (!file) return;
    update((d) => {
      const row: ImportRow = {
        id: nextId("ci", d.clientImports),
        user: OWNER,
        fileName: file.name,
        at: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }).replace(",", ""),
        // Nothing reads the file: the row stays on the state the original starts from.
        status: "PROCESSING",
      };
      return { ...d, clientImports: [row, ...d.clientImports] };
    });
    setFile(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <div className="flex flex-wrap items-center justify-start gap-3 hui-reveal">
        <a href={ROUTES.acessoIndividual} className="hbtn hbtn--secondary">
          <ChevronLeftIcon className="w-4 h-4" />
          Voltar
        </a>
      </div>

      <div className="mt-6 hui-reveal" style={{ animationDelay: ".03s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Importação de arquivo</h2>
            <p className="hwidget-desc">
              Envie um CSV (UTF-8) ou XLSX com as colunas: Cliente ID, Nome, Email, CPF, Telefone, CNPJ, Limite de Agendamentos, Período, Data limite de
              Agendamento. Preencha ao menos uma forma de identificar o cliente (nome, email, cpf ou telefone). O Limite de Agendamentos aceita DIA, SEMANA,
              MES, 15D ou 30D, ou pode ficar vazio. Para importar mais de 10000 clientes, entre em contato com o suporte.
            </p>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div className="imp-content mt-4">
          <section className="imp-group">
            <form
              className="flex flex-col gap-4 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                send();
                // The original posts and comes back on an empty form; the file input is uncontrolled,
                // so clearing the state alone would leave the chosen name on screen.
                e.currentTarget.reset();
              }}
            >
              <div className="hinput-field hinput-field--block">
                <label className="hinput-label" htmlFor="id_file">
                  Escolha o arquivo CSV ou XLSX
                </label>
                <input
                  id="id_file"
                  name="file"
                  type="file"
                  required
                  accept=".csv,.xlsx,.xls"
                  className="hinput mt-1.5"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button type="submit" className="hbtn hbtn--primary">
                  <PlaneIcon />
                  Enviar
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <div className="mt-6 hui-reveal" style={{ animationDelay: ".05s" }}>
        <div className="hwidget-head">
          <div className="hwidget-titles">
            <h2 className="hwidget-title">Histórico de Importação</h2>
          </div>
          <div className="hwidget-actions" />
        </div>

        <div id="client-import-table" className="mt-4">
          <div className={`htable${rows.length ? "" : " htable-is-empty"}`} style={{ "--htable-row-h": "3.5rem" } as CSSProperties}>
            <div className="htable-scroll">
              <table className="htable-table w-full">
                <thead>
                  <tr>
                    {COLUMNS.map((c) => (
                      <th key={c} className={`htable-col${c === "Enviado em" ? " whitespace-nowrap" : ""}`}>
                        {c}
                      </th>
                    ))}
                    <th className="htable-col htable-col--end">Arquivo</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="htable-cell">
                        <span className="text-sm text-gray-700 inter-regular">{row.user}</span>
                      </td>
                      <td className="htable-cell">
                        <span className="text-sm font-semibold text-gray-900 inter-semibold">{row.fileName}</span>
                      </td>
                      <td className="htable-cell whitespace-nowrap">
                        <span className="text-sm text-gray-700 inter-regular">{row.at}</span>
                      </td>
                      <td className="htable-cell">
                        <span className={`hchip ${IMPORT_STATUSES[row.status].tone} hchip--primary hchip--sm`}>{IMPORT_STATUSES[row.status].label}</span>
                      </td>
                      <td className="htable-cell htable-cell--end">
                        {/* The original links the stored file; nothing is kept here. */}
                        <span className="inline-flex items-center justify-end text-gray-300" title="O arquivo enviado não fica guardado neste protótipo">
                          <UploadIcon className="w-4 h-4" />
                        </span>
                      </td>
                    </tr>
                  ))}
                  {Array.from({ length: Math.max(0, SLOTS - rows.length) }, (_, i) => (
                    <tr key={i} className="htable-row--empty" aria-hidden="true">
                      {Array.from({ length: COLUMNS.length + 1 }, (_, j) => (
                        <td key={j} className="htable-cell" />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <div className="htable-empty" role="status" aria-live="polite">
                <div className="hempty hempty--inline hui-reveal">
                  <UploadIcon className="hempty-icon" />
                  <h3 className="hempty-title nunito-bold">Nenhum arquivo importado ainda</h3>
                  <p className="hempty-desc inter-regular">Os arquivos que você enviar aparecem aqui com o andamento do processamento.</p>
                </div>
              </div>
            )}
            <div className="htable-footer" />
          </div>
        </div>
      </div>
    </div>
  );
}
