"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Modal } from "../shared/Modal";
import { DownloadIcon } from "../shared/icons";

/** Clone of the "QR Code" modal a link's third button opens. */
export function QrModal({ url, onClose }: { url: string; onClose: () => void }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    let live = true;
    QRCode.toDataURL(url, { width: 512, margin: 1 })
      .then((data) => live && setImage(data))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [url]);

  return (
    <Modal
      id="qr-preview-modal"
      title="QR Code"
      size="md"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="hbtn hbtn--tertiary" onClick={onClose}>
            Fechar
          </button>
          <a href={image || undefined} id="qrDownloadBtn" download="qr.png" className="hbtn hbtn--primary">
            <DownloadIcon className="w-4 h-4" />
            Baixar
          </a>
        </>
      }
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-center bg-[color:var(--color-surface-secondary)] rounded-xl p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="qrPreviewImage" src={image} alt="Pré-visualização do QR Code" className="w-64 h-64 rounded-lg" />
        </div>
        <p id="qrPreviewUrl" className="text-xs text-gray-500 inter-regular text-center break-all">
          {url}
        </p>
      </div>
    </Modal>
  );
}
