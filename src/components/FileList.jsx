import React, { useState, useEffect } from "react";
import { bytesToHuman, isImageFile } from "../utils/fileUtils";
import { UploadStatusLabel } from "../features/upload/uploadTypes";
import "../styles/global.css";

export default function FileList({ items, onRemove }) {

  const [removeModal, setRemoveModal] = useState({
    open: false,
    id: null,
    name: "",
  });
  const [closing, setClosing] = useState(false);

  const openRemoveModal = (id, name = "") => {
    setClosing(false);
    setRemoveModal({ open: true, id, name });
  };

  const closeRemoveModal = () => {
    setClosing(true);
   
    setTimeout(() => {
      setRemoveModal({ open: false, id: null, name: "" });
      setClosing(false);
    }, 180); 
  };


  const confirmRemove = () => {
    if (removeModal.id == null) return;
    onRemove?.(removeModal.id);
    closeRemoveModal();
  };

 
  useEffect(() => {
    if (!removeModal.open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeRemoveModal();
      if (e.key === "Enter") confirmRemove();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [removeModal.open]);
  if (!items?.length) {
    return <div className="empty">Henüz dosya eklenmedi.</div>;
  }

  return (
    <div className="fileList">
      {items.map((it) => (
        <div key={it.id} className="fileRow">
          <div className="fileLeft">
            <div className="thumb">
              {isImageFile(it.file) ? (
                <img
                  alt={it.file.name}
                  src={URL.createObjectURL(it.file)}
                  onLoad={(e) => {
                    
                    URL.revokeObjectURL(e.currentTarget.src);
                  }}
                />
              ) : (
                <span className="docIcon">DOC</span>
              )}
            </div>

            <div className="meta">
              <div className="name" title={it.file.name}>{it.file.name}</div>
              <div className="sub">
                {bytesToHuman(it.file.size)} • {it.file.type || "type yok"}
              </div>

              <div className="statusLine">
                <span className={`pill ${it.status}`}>{UploadStatusLabel[it.status] || it.status}</span>

                {it.status === "uploading" && (
                  <div className="progressWrap" aria-label="progress">
                    <div className="progressBar" style={{ width: `${it.progress || 0}%` }} />
                  </div>
                )}

                {it.status === "error" && (
                  <span className="errorText">{it.error || "Hata"}</span>
                )}
              </div>
            </div>
          </div>

          <button
            className="iconBtn"
            onClick={() => openRemoveModal(it.id, it.name)}
            title="Kaldır"
          >
            ✕
          </button>

        </div>
      ))}
     {removeModal.open && (
        <div
          className={`modalOverlay ${closing ? "closing" : ""}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeRemoveModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`modalCard ${closing ? "closing" : ""}`}>
            <div className="modalTitle">Kaldırmayı onayla</div>

            <div className="modalText">
              {removeModal.name
                ? `"${removeModal.name}" dosyasını kaldırmak istiyor musun?`
                : "Bu öğeyi kaldırmak istiyor musun?"}
              <div className="modalSub">Bu işlem geri alınamaz.</div>
            </div>

            <div className="modalActions">
              <button className="btnGhost" onClick={closeRemoveModal}>
                Vazgeç
              </button>
              <button className="btnDanger" onClick={confirmRemove} autoFocus>
                Evet, kaldır
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
