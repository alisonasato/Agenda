"use client";

import { useEffect, useRef, useState } from "react";
import { CloseCircleIcon, GalleryIcon, SheetIcon } from "./icons";

const MB = 1048576;

type FilePickerProps = {
  name: string;
  label: string;
  desc?: string;
  /** The picker takes images by default; the client import asks for a spreadsheet instead. */
  kind?: "image" | "sheet";
  accept?: string;
  /** Cap in MB, the number the "muito grande" message repeats. */
  maxMb?: number;
  /** The chosen file, for the forms that read it themselves. */
  onFile?: (file: File | null) => void;
};

/**
 * .hfilepicker cell (port of the original's inline Alpine component): click or drop to pick,
 * a size cap, a preview, and a discard button for a pending pick. Nothing is uploaded.
 */
export function FilePicker({ name, label, desc, kind = "image", accept, maxMb = 1, onFile }: FilePickerProps) {
  const MAX_BYTES = maxMb * MB;
  const isImage = kind === "image";
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const handle = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setError(`O arquivo é muito grande. Máximo de ${maxMb} MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    setError("");
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
    onFile?.(f);
  };

  const revert = () => {
    if (inputRef.current) inputRef.current.value = "";
    setPreview("");
    setFileName("");
    setError("");
    onFile?.(null);
    // Tell listeners (the save bar) the field changed back.
    inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const browse = () => inputRef.current?.click();

  return (
    <div className="hfilepicker">
      <input
        ref={inputRef}
        type="file"
        className="hfilepicker-input"
        name={name}
        id={`id_${name}`}
        accept={accept ?? "image/*"}
        onChange={(e) => handle(e.target.files?.[0])}
      />
      <div
        className={`hfilepicker-cell${dragging ? " is-dragging" : ""}`}
        role="button"
        tabIndex={0}
        onClick={browse}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), browse())}
        onDragOver={(e) => (e.preventDefault(), setDragging(true))}
        onDragLeave={(e) => (e.preventDefault(), setDragging(false))}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const files = e.dataTransfer.files;
          if (!files[0]) return;
          if (inputRef.current) inputRef.current.files = files;
          handle(files[0]);
          inputRef.current?.dispatchEvent(new Event("change", { bubbles: true }));
        }}
      >
        <span className="hfilepicker-label">{label}</span>
        <span className={`hfilepicker-value${preview ? "" : " hfilepicker-value--empty"}`}>
          {preview ? fileName || (isImage ? "Imagem atual" : "Arquivo atual") : isImage ? "Selecionar imagem" : "Selecionar arquivo"}
        </span>
        <span className="hfilepicker-thumb">
          {preview && isImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="" />
          ) : (
            <span className="hfilepicker-thumb-icon">{isImage ? <GalleryIcon className="w-3.5 h-3.5" /> : <SheetIcon className="w-3.5 h-3.5" />}</span>
          )}
        </span>
        {preview && (
          <button type="button" className="hfilepicker-discard" aria-label="Descartar seleção" onClick={(e) => (e.stopPropagation(), revert())}>
            <CloseCircleIcon className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {desc && <p className="hfilepicker-desc">{desc}</p>}
      {error && <p className="hfilepicker-error">{error}</p>}
    </div>
  );
}
