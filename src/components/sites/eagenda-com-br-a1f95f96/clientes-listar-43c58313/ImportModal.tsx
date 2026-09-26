"use client";

import { useState } from "react";
import { Modal } from "../shared/Modal";
import { FilePicker } from "../shared/FilePicker";
import { CheckCircleIcon, DownloadIcon, InfoIcon, UploadIcon } from "../shared/icons";
import { download, parseCsv, toCsv } from "@/lib/seiri/csv";
import { fold } from "@/lib/seiri/select";
import { nextId, update } from "@/lib/seiri/store";
import type { Client } from "@/lib/seiri/types";

/** The columns the original lists as chips, and the order its template uses. */
const COLUMNS = ["cliente_id", "nome", "email", "telefone", "cpf", "dt_nascimento", "genero", "nacionalidade", "profissao"];

type Notice = { tone: "accent" | "success"; text: string } | null;

/** Reads the sheet into clients, skipping whoever the list already has. */
function ingest(rows: string[][]) {
  const header = rows[0]?.map(fold) ?? [];
  const known = COLUMNS.some((c) => header.includes(c));
  const at = (row: string[], column: string) => (known ? (row[header.indexOf(column)] ?? "") : "").trim();
  const body = known ? rows.slice(1) : rows;
  let added = 0;
  let skipped = 0;
  let ignored = 0;

  update((d) => {
    const clients = [...d.clients];
    body.forEach((row) => {
      const name = known ? at(row, "nome") : (row[0] ?? "").trim();
      const email = known ? at(row, "email") : (row[1] ?? "").trim();
      const cpf = known ? at(row, "cpf") : (row[3] ?? "").trim();
      // The original asks for "no mínimo nome, email ou cpf em cada linha".
      if (!name && !email && !cpf) return void ignored++;
      if (clients.some((c) => (name && fold(c.name) === fold(name)) || (email && fold(c.email) === fold(email)) || (cpf && c.cpf === cpf)))
        return void skipped++;
      const gender = fold(known ? at(row, "genero") : "");
      const client: Client = {
        id: nextId("c", clients),
        name: name || email || cpf,
        email,
        phone: known ? at(row, "telefone") : (row[2] ?? "").trim(),
        cpf: cpf || undefined,
        gender: gender.startsWith("f") ? "Feminino" : gender.startsWith("m") ? "Masculino" : undefined,
        birthday: (known && at(row, "dt_nascimento")) || undefined,
        nationality: (known && at(row, "nacionalidade")) || undefined,
        profession: (known && at(row, "profissao")) || undefined,
      };
      clients.push(client);
      added++;
    });
    return { ...d, clients };
  });
  return { added, skipped, ignored };
}

/** "Importar Clientes": the original's file picker, the expected columns and the template link. */
export function ImportModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const send = async () => {
    if (!file) return setNotice({ tone: "accent", text: "Selecione um arquivo CSV para importar." });
    const { added, skipped, ignored } = ingest(parseCsv(await file.text()));
    const parts = [`${added} ${added === 1 ? "cliente importado" : "clientes importados"}`];
    if (skipped) parts.push(`${skipped} já ${skipped === 1 ? "existia" : "existiam"}`);
    if (ignored) parts.push(`${ignored} ${ignored === 1 ? "linha ignorada" : "linhas ignoradas"}`);
    setNotice({ tone: added ? "success" : "accent", text: `${parts.join(" · ")}.` });
    setFile(null);
  };

  return (
    <Modal
      id="import-modal"
      title="Importar Clientes"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="hbtn hbtn--primary" onClick={() => void send()}>
            <UploadIcon className="w-4 h-4" />
            Enviar
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {notice && (
          <div className={`halert halert--${notice.tone}`} role="alert">
            <span className="halert-indicator" aria-hidden="true">
              {notice.tone === "success" ? <CheckCircleIcon className="w-5 h-5" /> : <InfoIcon className="w-5 h-5" />}
            </span>
            <div className="halert-content">
              <p className="halert-description">{notice.text}</p>
            </div>
            <div className="halert-actions" />
          </div>
        )}

        <div>
          <FilePicker
            name="csv_file"
            label="Arquivo"
            kind="sheet"
            accept=".csv,text/csv"
            maxMb={5}
            onFile={setFile}
            desc="Planilha CSV de até 5 MB — arraste aqui ou clique para escolher."
          />
        </div>

        <div>
          <p className="hinput-label">Colunas esperadas no arquivo</p>
          <div id="columns-list" className="mt-2 flex flex-wrap gap-1.5">
            {COLUMNS.map((column) => (
              <span key={column} data-import-column={column} className="hchip hchip--default hchip--soft hchip--sm">
                {column}
              </span>
            ))}
          </div>
        </div>

        <ul className="text-xs text-gray-500 inter-regular space-y-1 list-disc list-inside">
          <li>Codificação UTF-8. Preencha no mínimo nome, email ou cpf em cada linha.</li>
          <li>Quem já está na lista com o mesmo nome, e-mail ou CPF é ignorado.</li>
          <li>Para importar mais de 1000 clientes, entre em contato com o suporte.</li>
        </ul>

        <div>
          <button
            type="button"
            className="hbtn hbtn--secondary hbtn--sm"
            onClick={() =>
              download(
                "modelo-clientes.csv",
                toCsv(COLUMNS, [["", "Maria Souza", "maria@exemplo.com.br", "+55 11 98888-1010", "", "", "Feminino", "Brasileira", ""]]),
              )
            }
          >
            <DownloadIcon className="w-4 h-4" />
            Baixar modelo (.csv)
          </button>
        </div>
      </div>
    </Modal>
  );
}
