"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { ClassicEditor } from "ckeditor5";
import { ChipMultiSelect } from "../shared/ChipMultiSelect";
import { FilePicker } from "../shared/FilePicker";
import { SaveBar } from "../shared/SaveBar";
import { CheckCircleIcon, SaveIcon } from "../shared/icons";
import { ROUTES } from "../shared/Sidebar";
import { nextId, update, useData } from "@/lib/seiri/store";
import type { AgendaGroup } from "@/lib/seiri/types";

// The editor only runs in the browser, like the other forms that embed it.
const RichTextEditor = dynamic(() => import("../shared/RichTextEditor").then((m) => m.RichTextEditor), { ssr: false });

const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** "Novo Grupo de Agendas": one step of the public booking screen. */
export function AgendaGroupForm() {
  const data = useData();
  const id = useSearchParams().get("id");
  const group = data.agendaGroups.find((g) => g.id === id);

  const [label, setLabel] = useState(group?.label ?? "");
  const [slug, setSlug] = useState(group?.slug ?? "");
  const [order, setOrder] = useState(group?.order != null ? String(group.order) : "");
  const [agendas, setAgendas] = useState<string[]>(group?.agendaIds ?? []);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const editor = useRef<ClassicEditor | null>(null);

  const touch =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setDirty(true);
    };

  const save = () => {
    if (!label.trim()) return;
    update((d) => {
      const row: AgendaGroup = {
        id: group?.id ?? nextId("ag", d.agendaGroups),
        label: label.trim(),
        // The original fills the link from the name when the field is left empty.
        slug: slug.trim() || slugify(label),
        order: Number(order) || 0,
        agendaIds: agendas,
        description: editor.current?.getData() ?? group?.description ?? "",
      };
      return { ...d, agendaGroups: group ? d.agendaGroups.map((g) => (g.id === group.id ? row : g)) : [...d.agendaGroups, row] };
    });
    setDirty(false);
    setSaved(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1550px] px-6 py-8 lg:px-10 min-w-0">
      <form
        id="grupo-form"
        className="max-w-4xl"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h4 className="gfields-title mb-4">Dados Gerais</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_label">
              Nome do Grupo <span className="hinput-req">*</span>
            </label>
            <div className="hinput-wrap">
              <input
                id="id_label"
                className="hinput"
                type="text"
                name="label"
                placeholder="Nome do grupo"
                required
                value={label}
                onChange={(e) => touch(setLabel)(e.target.value)}
              />
            </div>
            <p className="hinput-desc">É o nome que será exibido na tela de agendamento</p>
          </div>

          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_slug">
              Nome para o Link
            </label>
            <div className="hinput-wrap">
              <input
                id="id_slug"
                className="hinput"
                type="text"
                name="slug"
                placeholder="Link do grupo (opcional)"
                value={slug}
                onChange={(e) => touch(setSlug)(slugify(e.target.value))}
              />
            </div>
            <p className="hinput-desc">O link de acesso direto ao grupo é https://minhaempresa.seiri.com.br/agendas/...</p>
          </div>

          <div className="hinput-field hinput-field--block">
            <label className="hinput-label" htmlFor="id_order">
              Ordem
            </label>
            <div className="hinput-wrap hinput-wrap--number">
              <input
                id="id_order"
                className="hinput"
                type="number"
                name="order"
                placeholder="0"
                value={order}
                onChange={(e) => touch(setOrder)(e.target.value)}
              />
            </div>
            <p className="hinput-desc">Se houver mais de um grupo em uma mesma etapa, eles serão ordenados conforme esse campo</p>
          </div>
        </div>

        <div className="mt-6">
          <ChipMultiSelect
            id="id_agendas"
            label="Agendas"
            placeholder="Selecione as agendas..."
            options={data.agendas.map((a) => ({ id: a.id, label: a.name }))}
            values={agendas}
            onChange={touch(setAgendas)}
          />
          <p className="hinput-desc">Selecione as agendas que pertencem à esse grupo. Deixe esse campo em branco caso a escolha seja entre outros grupos</p>
        </div>

        <h4 className="gfields-title mb-4 mt-8">Imagens</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FilePicker name="imagem" label="Imagem reduzida" desc="Imagem reduzida, formato 400x400 pixels" onFile={() => setDirty(true)} />
          <FilePicker name="wide_img" label="Imagem de Destaque" desc="Imagem de fundo, formato 1920x1080 pixels" onFile={() => setDirty(true)} />
        </div>

        <h4 className="gfields-title mb-4 mt-8">Texto da Tela</h4>
        <div>
          <label htmlFor="id_desc" className="hinput-label" style={{ float: "none" }}>
            Texto da Tela do Grupo
          </label>
          <RichTextEditor editorRef={editor} name="desc" id="id_desc" wordCount initialData={group?.description} />
        </div>
        <SaveBar
          backHref={`${ROUTES.telaAgendamento}/?tab=groups`}
          saveLabel="Salvar"
          saveIcon={<SaveIcon />}
          dirty={dirty}
          forceToast={saved}
          toastIcon={<CheckCircleIcon />}
          toastTitle="Grupo salvo"
          toastSub="A etapa já aparece na tela de agendamento."
        />
      </form>
    </div>
  );
}
