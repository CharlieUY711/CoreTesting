/* =====================================================
   CargaMasivaView — Upload masivo de archivos
   Drag & drop · Queue · Supabase Storage
   ===================================================== */
import React, { useState, useRef, useCallback } from 'react';
import {
  Upload, File, Image, FileText, FileSpreadsheet,
  Trash2, CheckCircle, AlertCircle, X, FolderOpen,
  Download, RefreshCw, HardDrive,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

interface Props { onNavigate: (s: MainSection) => void; }

const ORANGE = '#FF6835';
const API = `https://${projectId}.supabase.co/functions/v1/api/carga-masiva`;
const HEADERS = { Authorization: `Bearer ${publicAnonKey}` };

interface QueueFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;
  signedUrl?: string;
  errorMsg?: string;
}

interface RemoteFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  signedUrl: string | null;
  path: string;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function fileIcon(mime: string) {
  if (mime.startsWith('image/'))       return <Image size={16} color="#8B5CF6" />;
  if (mime.includes('spreadsheet') || mime.includes('csv')) return <FileSpreadsheet size={16} color="#22C55E" />;
  if (mime.includes('pdf'))           return <FileText size={16} color="#EF4444" />;
  return <File size={16} color="#6B7280" />;
}

export function CargaMasivaView({ onNavigate }: Props) {
  const [queue, setQueue]         = useState<QueueFile[]>([]);
  const [remotes, setRemotes]     = useState<RemoteFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loadingRemotes, setLoadingRemotes] = useState(false);
  const [tab, setTab]             = useState<'upload' | 'files'>('upload');
  const inputRef                  = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: QueueFile[] = Array.from(files).map(f => ({
      id: `${Date.now()}_${Math.random()}`,
      file: f,
      status: 'pending',
      progress: 0,
    }));
    setQueue(q => [...q, ...newItems]);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }, []);

  const uploadOne = async (item: QueueFile) => {
    setQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'uploading', progress: 10 } : x));
    try {
      const fd = new FormData();
      fd.append('file', item.file);
      const res = await fetch(`${API}/upload`, { method: 'POST', headers: HEADERS, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al subir');
      setQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'done', progress: 100, signedUrl: data.signedUrl } : x));
    } catch (err: any) {
      setQueue(q => q.map(x => x.id === item.id ? { ...x, status: 'error', progress: 0, errorMsg: err.message } : x));
    }
  };

  const uploadAll = async () => {
    const pending = queue.filter(q => q.status === 'pending');
    for (const item of pending) await uploadOne(item);
    loadRemotes();
  };

  const loadRemotes = async () => {
    setLoadingRemotes(true);
    try {
      const res = await fetch(`${API}/files`, { headers: HEADERS });
      const data = await res.json();
      if (data.files) setRemotes(data.files);
    } catch (e) {
      console.log('Error cargando archivos remotos:', e);
    } finally {
      setLoadingRemotes(false);
      setTab('files');
    }
  };

  const deleteRemote = async (path: string) => {
    try {
      const res = await fetch(`${API}/file`, {
        method: 'DELETE',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });
      if (res.ok) setRemotes(r => r.filter(f => f.path !== path));
    } catch (e) { console.log('Error eliminando:', e); }
  };

  const removeFromQueue = (id: string) => setQueue(q => q.filter(x => x.id !== id));
  const clearDone = () => setQueue(q => q.filter(x => x.status !== 'done'));

  const pendingCount  = queue.filter(q => q.status === 'pending').length;
  const doneCount     = queue.filter(q => q.status === 'done').length;
  const errorCount    = queue.filter(q => q.status === 'error').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* Top Bar */}
      <div style={{
        height: '56px', flexShrink: 0, backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: '14px',
      }}>
        <Upload size={20} color={ORANGE} />
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111' }}>
          Carga Masiva de Archivos
        </h1>
        <div style={{ flex: 1 }} />
        {(['upload', 'files'] as const).map(t => (
          <button key={t} onClick={() => { if (t === 'files') loadRemotes(); else setTab('upload'); }} style={{
            padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '0.82rem', fontWeight: '600',
            backgroundColor: tab === t ? ORANGE : 'transparent',
            color: tab === t ? '#fff' : '#6B7280',
          }}>
            {t === 'upload' ? '⬆ Subir archivos' : '📁 Mis archivos'}
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {tab === 'upload' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>

          {/* Drop Zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? ORANGE : '#D1D5DB'}`,
              borderRadius: '16px',
              backgroundColor: isDragging ? `${ORANGE}08` : '#fff',
              padding: '48px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
              marginBottom: '24px',
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              backgroundColor: isDragging ? `${ORANGE}20` : '#F3F4F6',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Upload size={24} color={isDragging ? ORANGE : '#9CA3AF'} />
            </div>
            <p style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '700', color: '#111' }}>
              {isDragging ? 'Soltá los archivos aquí' : 'Arrastrá archivos o hacé clic para seleccionar'}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9CA3AF' }}>
              Imágenes, PDF, CSV, XLSX, DOCX · Sin límite de cantidad
            </p>
            <input ref={inputRef} type="file" multiple hidden onChange={e => addFiles(e.target.files)} />
          </div>

          {/* Stats bar */}
          {queue.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              marginBottom: '16px',
              padding: '12px 16px', backgroundColor: '#fff',
              borderRadius: '10px', border: '1px solid #E5E7EB',
            }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                <b style={{ color: '#111' }}>{queue.length}</b> archivo{queue.length !== 1 ? 's' : ''} en cola
              </span>
              {pendingCount > 0 && <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: '600' }}>· {pendingCount} pendientes</span>}
              {doneCount > 0    && <span style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: '600' }}>· {doneCount} subidos</span>}
              {errorCount > 0   && <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: '600' }}>· {errorCount} con error</span>}
              <div style={{ flex: 1 }} />
              {doneCount > 0 && (
                <button onClick={clearDone} style={{ fontSize: '0.75rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Limpiar completados
                </button>
              )}
              {pendingCount > 0 && (
                <button onClick={uploadAll} style={{
                  padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  backgroundColor: ORANGE, color: '#fff',
                  fontSize: '0.82rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Upload size={14} /> Subir todo ({pendingCount})
                </button>
              )}
            </div>
          )}

          {/* Queue list */}
          {queue.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {queue.map(item => (
                <div key={item.id} style={{
                  backgroundColor: '#fff', borderRadius: '10px', padding: '12px 14px',
                  border: `1.5px solid ${
                    item.status === 'done'     ? '#86EFAC' :
                    item.status === 'error'    ? '#FCA5A5' :
                    item.status === 'uploading'? `${ORANGE}50` : '#E5E7EB'
                  }`,
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  {fileIcon(item.file.type)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.file.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#9CA3AF' }}>
                      {formatSize(item.file.size)} · {item.file.type || 'desconocido'}
                    </p>
                    {item.status === 'uploading' && (
                      <div style={{ marginTop: '6px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: '60%', backgroundColor: ORANGE, borderRadius: '2px', transition: 'width 0.3s' }} />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#EF4444' }}>{item.errorMsg}</p>
                    )}
                  </div>

                  {/* Status icon */}
                  {item.status === 'done'     && <CheckCircle size={18} color="#22C55E" />}
                  {item.status === 'error'    && <AlertCircle size={18} color="#EF4444" />}
                  {item.status === 'uploading'&& <RefreshCw size={16} color={ORANGE} style={{ animation: 'spin 1s linear infinite' }} />}
                  {item.status === 'pending'  && (
                    <button onClick={() => uploadOne(item)} style={{
                      padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      backgroundColor: `${ORANGE}15`, color: ORANGE,
                      fontSize: '0.75rem', fontWeight: '700',
                    }}>
                      Subir
                    </button>
                  )}
                  <button onClick={() => removeFromQueue(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <X size={15} color="#9CA3AF" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {queue.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
              <HardDrive size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>La cola está vacía. Arrastrá archivos para comenzar.</p>
            </div>
          )}
        </div>
      )}

      {/* ── FILES TAB ── */}
      {tab === 'files' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
              <b style={{ color: '#111' }}>{remotes.length}</b> archivos almacenados en Supabase Storage
            </p>
            <div style={{ flex: 1 }} />
            <button onClick={loadRemotes} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '8px',
              border: '1.5px solid #E5E7EB', backgroundColor: '#fff',
              fontSize: '0.78rem', fontWeight: '600', color: '#374151', cursor: 'pointer',
            }}>
              <RefreshCw size={13} /> Actualizar
            </button>
          </div>

          {loadingRemotes ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
              <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
              <p style={{ margin: 0 }}>Cargando archivos...</p>
            </div>
          ) : remotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
              <FolderOpen size={36} style={{ marginBottom: '12px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No hay archivos subidos aún.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {remotes.map(f => (
                <div key={f.id} style={{
                  backgroundColor: '#fff', borderRadius: '10px', padding: '12px 16px',
                  border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  {fileIcon(f.mimeType)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {f.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.7rem', color: '#9CA3AF' }}>
                      {formatSize(f.size)} · {new Date(f.createdAt).toLocaleDateString('es-UY')}
                    </p>
                  </div>
                  {f.signedUrl && (
                    <a href={f.signedUrl} download target="_blank" rel="noreferrer" style={{ color: '#6B7280', display: 'flex' }}>
                      <Download size={15} />
                    </a>
                  )}
                  <button onClick={() => deleteRemote(f.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                    <Trash2 size={15} color="#EF4444" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

