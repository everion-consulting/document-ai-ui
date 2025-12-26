import React, { useEffect, useMemo, useState } from "react";
import FileDropzone from "../../components/FileDropzone";
import FileList from "../../components/FileList";
import ResponsePanel from "../../components/ResponsePanel";
import { UploadStatus } from "./uploadTypes";
import { bytesToHuman, createClientFileItem, isAllowedFile } from "../../utils/fileUtils";
import "../../styles/upload.css";
import "../../styles/global.css";
import apiService from "../../services/uploadService";

export default function UploadPage() {
  const [items, setItems] = useState([]);
  const [globalStatus, setGlobalStatus] = useState("idle");


  const [uploadJson, setUploadJson] = useState(null);


  const [docsOpen, setDocsOpen] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docs, setDocs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);


  const [stats, setStats] = useState(null);

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
   
  };

 
  const fetchDocs = async () => {
    setDocsOpen(true);
    setDocsLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        apiService.listDocuments(),
        apiService.getStats(),
      ]);

      if (listRes?.success) setDocs(listRes.data?.results || []);
      if (statsRes?.success) setStats(statsRes.data);

 
      const count = listRes?.data?.count ?? 0;
      if (count === 0) {
        setSelectedId(null);
        setSelectedDoc(null);
      }
    } finally {
      setDocsLoading(false);
    }
  };

  const toggleDocs = async () => {
    if (docsOpen) {
      setDocsOpen(false);
      return;
    }
    await fetchDocs();
  };


  const openDetail = async (id) => {

  if (selectedId === id) {
    setSelectedId(null);
    setSelectedDoc(null);
    return;
  }

  setSelectedId(id);
  setSelectedDoc(null);

  const res = await apiService.getDocument(id);
  if (res?.success) setSelectedDoc(res.data);
};



  const doReprocess = async () => {
    if (!selectedId) return;
    setGlobalStatus("uploading");
    try {
      await apiService.reprocessDocument(selectedId);
      await openDetail(selectedId);
      await fetchDocs();
    } finally {
      setGlobalStatus("idle");
    }
  };


  const doDelete = async () => {
    if (!selectedId) return;
    setGlobalStatus("uploading");
    try {
      await apiService.deleteDocument(selectedId);
      setSelectedId(null);
      setSelectedDoc(null);
      await fetchDocs();
    } finally {
      setGlobalStatus("idle");
    }
  };

 
  const uploadAll = async () => {
    if (!canUpload) return;

    setGlobalStatus("uploading");

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
      const res = await apiService.uploadDocuments(files);

    
      if (res?.success) {
        const results = res?.data?.results || [];
        setUploadJson(results.length === 1 ? results[0] : results);
      } else {
        setUploadJson(res);
      }

      
      const results = res?.data?.results || [];
      setItems((prev) =>
        prev.map((it) => {
          const r = results.find((x) => x.filename === it.file?.name);
          const ok = r?.status === "success";
          return {
            ...it,
            status: ok ? UploadStatus.SUCCESS : UploadStatus.ERROR,
            progress: 100,
            error: ok ? null : (r?.error || res?.message || "Upload başarısız"),
            result: r || res,
          };
        })
      );

     
      if (docsOpen) await fetchDocs();
    } catch (err) {
      setUploadJson({ error: true, message: err?.message || "Upload başarısız" });
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

  useEffect(() => {
    apiService.getStats().then((r) => {
      if (r?.success) setStats(r.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <img className="brandLogo" src="/everion_logo_transparent.png" alt="Document AI" draggable="false" />
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
            <div className="brandSub strongSub">Dosya türünü hızlıca analiz et • Sonucu anında gör</div>
          </div>
        </div>

        <div className="actions">
        
          <button className="btn secondary" onClick={toggleDocs} disabled={globalStatus === "uploading"}>
            {docsOpen ? "Dosyaları Gizle" : "Dosyaları Getir"}
          </button>

          <button className="btn secondary" onClick={clearAll} disabled={globalStatus === "uploading" || items.length === 0}>
            Temizle
          </button>
          <button className="btn primary" onClick={uploadAll} disabled={!canUpload}>
            {globalStatus === "uploading" ? "Yükleniyor..." : "Yükle"}
          </button>
        </div>
      </header>

   
      <main className={`grid3 ${docsOpen ? "docsOpen" : ""}`}>
        {/* SOL */}
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

          <div className="divider" />
          <div>
            <div className="cardTitle" style={{ marginBottom: 6 }}>İstatistik</div>
            <div className="cardSub">Toplam: <b>{stats?.total ?? 0}</b></div>
          </div>
        </section>

       
        <section className="card">
          <div className="cardHeader">
            <div>
              <div className="cardTitle">Belge Türü</div>
              <div className="cardSub">Upload sonrası dönen sonuç burada (sadece son upload).</div>
            </div>
          </div>
          <ResponsePanel response={uploadJson} />
        </section>

     
        {docsOpen && (
          <aside className="card docsSide">
            <div className="cardHeader">
              <div>
                <div className="cardTitle">Dosyalar</div>
                <div className="cardSub">Backend’den gelen kayıtlar burada listelenir.</div>
              </div>

              <button className="btn secondary" onClick={fetchDocs} disabled={docsLoading || globalStatus === "uploading"}>
                {docsLoading ? "Yükleniyor..." : "Yenile"}
              </button>
            </div>

            <div className="divider" />

            <div className="docsScroll">
              {docs.length === 0 ? (
                <div className="empty">Kayıt yok.</div>
              ) : (
                <div className="docsList">
                  {docs.map((d) => (
                    <button
                      key={d.id}
                      className={`docRowBtn ${selectedId === d.id ? "active" : ""}`}
                      onClick={() => openDetail(d.id)}
                    >
                      <div className="docRowTop">
                        <span>#{d.id} • {d.doc_type} • {d.status}</span>
                        <span className="docRowDate">{new Date(d.created_at).toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="divider" />

              <div className="cardTitle" style={{ marginBottom: 6 }}>Detay</div>
              {!selectedDoc ? (
                <div className="cardSub">Detay için listeden belge seç.</div>
              ) : (
                <>
                  <div className="cardSub" style={{ marginBottom: 10 }}>
                    ID: <b>{selectedDoc.id}</b> • Tür: <b>{selectedDoc.doc_type}</b> • Durum: <b>{selectedDoc.status}</b>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    <button className="btn secondary" onClick={doReprocess} disabled={globalStatus === "uploading"}>
                      Yeniden İşle
                    </button>
                    <button className="btn secondary" onClick={doDelete} disabled={globalStatus === "uploading"}>
                      Sil
                    </button>
                    {selectedDoc.file_url && (
                      <a className="btn secondary" href={selectedDoc.file_url} target="_blank" rel="noreferrer">
                        Dosyayı Aç
                      </a>
                    )}
                  </div>

                  
                  <ResponsePanel response={selectedDoc} />
                </>
              )}
            </div>
          </aside>
        )}
      </main>

      <footer className="footer">
        <span>Everion Consulting © {new Date().getFullYear()} • Dosyalarınız güvenli şekilde işlenir.</span>
      </footer>
    </div>
  );
}
