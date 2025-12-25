import React, { useRef, useState } from "react";

export default function FileDropzone({ onFiles, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => { // dosya seçici aç
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange = (e) => { //açılan pencereden dosya seçebilmek için
    if (disabled) return;
    onFiles?.(e.target.files);
    e.target.value = "";  //sıfırlama sebebi aynı dosyayı seçmek istersen seçebilesin diye
  };

  const onDrop = (e) => { //dosyayı sürükle bırak yapabilmek için
    e.preventDefault();
    if (disabled) return;
    setDragOver(false);
    if (e.dataTransfer?.files?.length) onFiles?.(e.dataTransfer.files);
  };
  //dataTransfer = sürüklenen verileri tutar

  return (
    <div
      className={`dropzone ${dragOver ? "dragOver" : ""} ${disabled ? "disabled" : ""}`}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
        style={{ display: "none" }}
       
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
      />

      <div className="dropzoneInner">
        <div className="dropTitle">Sürükle & Bırak</div>
        <div className="dropSub">veya dosya seçmek için tıkla</div>
        <div className="dropHint">
          Desteklenen: resimler, PDF, Office dosyaları, TXT
        </div>
      </div>
    </div>
  );
}
