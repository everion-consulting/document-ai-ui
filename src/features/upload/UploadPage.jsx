import React, { useMemo, useState } from "react";
import FileDropzone from "../../components/FileDropzone";
import FileList from "../../components/FileList";
import ResponsePanel from "../../components/ResponsePanel";
import { uploadFiles } from "../../services/uploadService";
import { UploadStatus } from "./uploadTypes";
import { bytesToHuman, createClientFileItem, isAllowedFile } from "../../utils/fileUtils";
import "../../styles/upload.css";

export default function UploadPage() {
    const [items, setItems] = useState([]);
    const [globalStatus, setGlobalStatus] = useState("idle"); 
    const [backendResponse, setBackendResponse] = useState(null);

    const totalSize = useMemo(
        () => items.reduce((sum, it) => sum + (it.file?.size || 0), 0),
        [items]
    );

    const canUpload = items.length > 0 && globalStatus !== "uploading";

    const addFiles = (fileList) => {
        const incoming = Array.from(fileList || []);
        const normalized = incoming
            .filter((f) => isAllowedFile(f))
            .map((f) => createClientFileItem(f));

        setItems((prev) => {
         
            const key = (f) => `${f.name}__${f.size}`;
            const existingKeys = new Set(prev.map((p) => key(p.file)));
            const merged = [...prev];

            for (const n of normalized) {
                if (!existingKeys.has(key(n.file))) merged.push(n);
            }
            return merged;
        });
    };

    const removeItem = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

    const clearAll = () => {
        setItems([]);
        setBackendResponse(null);
    };

    const uploadAll = async () => {
        if (!canUpload) return;

        setGlobalStatus("uploading");
        setBackendResponse(null);

       
        setItems((prev) =>
            prev.map((it) => ({
                ...it,
                status: UploadStatus.UPLOADING,
                progress: 0,
                error: null,
                result: null,
            }))
        );

        try {
            const files = items.map((x) => x.file);

            const res = await uploadFiles(files);


            setBackendResponse(res);

            setItems((prev) =>
                prev.map((it) => ({
                    ...it,
                    status: UploadStatus.SUCCESS,
                    progress: 100,
                    result: res,
                }))
            );
        } catch (err) {
            setBackendResponse(err);

            setItems((prev) =>
                prev.map((it) => ({
                    ...it,
                    status: UploadStatus.ERROR,
                    error: err?.message || "Upload başarısız",
                }))
            );
        } finally {
            setGlobalStatus("idle");
        }
    };

    return (
        <div className="page">
            <header className="topbar">
                <div className="brand">
                    <img
                        className="brandLogo"
                        src="/everion_logo_transparent.png"
                        alt="Document AI"
                        draggable="false"
                    />
                    <div className="logoMark" aria-hidden="true">
                        <span className="logoDot" />
                        <span className="logoRing" />
                    </div>

                    <div className="brandText">
                        <div className="brandTitleRow">
                            <div className="brandTitle shimmer">Document AI</div>
                            <div className="brandBadges">
                                <span className="badge">AI</span>
                                <span className="badge ghost">Multi Upload</span>
                            </div>
                        </div>

                        <div className="brandSub strongSub">
                            Dosya türünü hızlıca analiz et • Sonucu anında gör
                        </div>
                    </div>
                </div>


                <div className="actions">
                    <button className="btn secondary" onClick={clearAll} disabled={globalStatus === "uploading" || items.length === 0}>
                        Temizle
                    </button>
                    <button className="btn primary" onClick={uploadAll} disabled={!canUpload}>
                        {globalStatus === "uploading" ? "Yükleniyor..." : "Yükle"}
                    </button>
                </div>
            </header>

            <main className="grid">
                <section className="card">
                    <div className="cardHeader">
                        <div>
                            <div className="cardTitle">Dosya Seç</div>
                            <div className="cardSub">
                                Fotoğraf ve belgeleri sürükle-bırak veya seç. Toplam: <b>{bytesToHuman(totalSize)}</b>
                            </div>
                        </div>
                    </div>

                    <FileDropzone onFiles={addFiles} disabled={globalStatus === "uploading"} />

                    <div className="divider" />

                    <FileList items={items} onRemove={removeItem} />
                </section>

                <section className="card">
                    <div className="cardHeader">
                        <div>
                            <div className="cardTitle">Belge Türü</div>
                            <div className="cardSub">
                                Şimdilik mock. Backend gelince <code>uploadService.js</code> içindeki endpoint açılacak.
                            </div>
                        </div>
                    </div>

                    <ResponsePanel response={backendResponse} />
                </section>
            </main>

            <footer className="footer">
                <span>
                    Everion Consulting © {new Date().getFullYear()} • Dosyalarınız güvenli şekilde işlenir.
                </span>
            </footer>

        </div>
    );
}
