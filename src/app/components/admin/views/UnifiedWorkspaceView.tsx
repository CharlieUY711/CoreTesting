/* =====================================================
   UnifiedWorkspaceView — Espacio de trabajo unificado
   Docs · Tareas · Notas · Calendario · Chat
   ===================================================== */
import React, { useState, useRef } from 'react';
import {
  LayoutGrid, FileText, CheckSquare, StickyNote, Calendar,
  MessageCircle, Plus, X, Trash2, Edit3, Send, Check,
  Circle, ChevronLeft, ChevronRight, Clock, Flag,
  Smile, Paperclip, Hash, Bold, Italic, List,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';

interface Props { onNavigate: (s: MainSection) => void; }

const ORANGE = '#FF6835';
const META_BLUE = '#1877F2';

type Section = 'docs' | 'tareas' | 'notas' | 'calendario' | 'chat';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Doc { id: string; title: string; content: string; updatedAt: Date; }
interface Task { id: string; title: string; status: 'todo' | 'doing' | 'done'; priority: 'low' | 'medium' | 'high'; assignee: string; }
interface Note { id: string; content: string; color: string; createdAt: Date; }
interface Message { id: string; author: string; avatar: string; text: string; time: Date; }

const NOTE_COLORS = ['#FEF9C3', '#DCFCE7', '#DBEAFE', '#FCE7F3', '#FEF3C7', '#F3E8FF'];
const PRIORITY_COLOR = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' } as const;
const PRIORITY_LABEL = { low: 'Baja', medium: 'Media', high: 'Alta' } as const;

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const INIT_DOCS: Doc[] = [
  { id: '1', title: 'Plan de lanzamiento Q1', content: 'Resumen ejecutivo del plan de lanzamiento para el primer trimestre...', updatedAt: new Date('2026-02-18') },
  { id: '2', title: 'Guía de onboarding',      content: 'Proceso de incorporación para nuevos usuarios del sistema...', updatedAt: new Date('2026-02-15') },
  { id: '3', title: 'Propuesta módulo Auth',   content: 'Especificaciones técnicas del módulo de autenticación...', updatedAt: new Date('2026-02-20') },
];

const INIT_TASKS: Task[] = [
  { id: '1', title: 'Definir flujos de auth',         status: 'done',  priority: 'high',   assignee: 'Carlos' },
  { id: '2', title: 'Integrar Meta Pixel',            status: 'doing', priority: 'high',   assignee: 'Ana'    },
  { id: '3', title: 'Subir catálogo productos',       status: 'doing', priority: 'medium', assignee: 'Lucía'  },
  { id: '4', title: 'Revisar diseño Unified WS',      status: 'todo',  priority: 'medium', assignee: 'Carlos' },
  { id: '5', title: 'Documentar API endpoints',       status: 'todo',  priority: 'low',    assignee: 'Pedro'  },
  { id: '6', title: 'Configurar bucket Supabase',     status: 'done',  priority: 'high',   assignee: 'Ana'    },
];

const INIT_NOTES: Note[] = [
  { id: '1', content: '🎯 Prioridad para el próximo sprint:\n→ Auth + Carga Masiva', color: NOTE_COLORS[0], createdAt: new Date() },
  { id: '2', content: 'Reunión con cliente el martes 24/02 a las 15:00 hs', color: NOTE_COLORS[2], createdAt: new Date() },
  { id: '3', content: 'Revisar integración con Meta Catalog API\n— access token caduca en 60 días', color: NOTE_COLORS[4], createdAt: new Date() },
];

const INIT_MESSAGES: Message[] = [
  { id: '1', author: 'Ana García',    avatar: 'AG', text: 'El módulo de auth quedó listo 🎉', time: new Date('2026-02-20T10:15') },
  { id: '2', author: 'Carlos López',  avatar: 'CL', text: 'Perfecto, ahora vamos con Carga Masiva', time: new Date('2026-02-20T10:18') },
  { id: '3', author: 'Lucía Martín',  avatar: 'LM', text: '¿Alguien revisó el Píxel de Meta?', time: new Date('2026-02-20T11:02') },
  { id: '4', author: 'Ana García',    avatar: 'AG', text: 'Sí, está activo y disparando PageView correctamente', time: new Date('2026-02-20T11:05') },
];

const CALENDAR_EVENTS: { date: number; title: string; color: string }[] = [
  { date: 24, title: 'Reunión cliente',       color: META_BLUE    },
  { date: 24, title: 'Demo Auth módulo',      color: ORANGE       },
  { date: 28, title: 'Sprint review',         color: '#22C55E'    },
  { date: 3,  title: 'Deploy producción',     color: '#8B5CF6'    },
];

export function UnifiedWorkspaceView({ onNavigate }: Props) {
  const [section, setSection] = useState<Section>('docs');

  // Docs state
  const [docs, setDocs]           = useState<Doc[]>(INIT_DOCS);
  const [activeDoc, setActiveDoc] = useState<Doc | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Tasks state
  const [tasks, setTasks]     = useState<Task[]>(INIT_TASKS);
  const [newTask, setNewTask] = useState('');

  // Notes state
  const [notes, setNotes]       = useState<Note[]>(INIT_NOTES);
  const [newNote, setNewNote]   = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);

  // Chat state
  const [messages, setMessages] = useState<Message[]>(INIT_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Calendar state
  const [calMonth, setCalMonth] = useState(1); // February = 1
  const [calYear, setCalYear]   = useState(2026);

  // ── Docs handlers ──────────────────────────────────────────────────────────
  const openDoc = (doc: Doc) => { setActiveDoc(doc); setEditTitle(doc.title); setEditContent(doc.content); };
  const saveDoc = () => {
    if (!activeDoc) return;
    setDocs(d => d.map(x => x.id === activeDoc.id ? { ...x, title: editTitle, content: editContent, updatedAt: new Date() } : x));
    setActiveDoc(null);
  };
  const newDoc = () => {
    const doc: Doc = { id: Date.now().toString(), title: 'Nuevo documento', content: '', updatedAt: new Date() };
    setDocs(d => [doc, ...d]);
    openDoc(doc);
  };
  const deleteDoc = (id: string) => { setDocs(d => d.filter(x => x.id !== id)); if (activeDoc?.id === id) setActiveDoc(null); };

  // ── Task handlers ──────────────────────────────────────────────────────────
  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(t => [...t, { id: Date.now().toString(), title: newTask, status: 'todo', priority: 'medium', assignee: 'Yo' }]);
    setNewTask('');
  };
  const moveTask = (id: string, status: Task['status']) => setTasks(t => t.map(x => x.id === id ? { ...x, status } : x));
  const deleteTask = (id: string) => setTasks(t => t.filter(x => x.id !== id));

  // ── Notes handlers ─────────────────────────────────────────────────────────
  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(n => [{ id: Date.now().toString(), content: newNote, color: noteColor, createdAt: new Date() }, ...n]);
    setNewNote('');
  };
  const deleteNote = (id: string) => setNotes(n => n.filter(x => x.id !== id));

  // ── Chat handler ───────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(m => [...m, { id: Date.now().toString(), author: 'Yo', avatar: 'YO', text: chatInput, time: new Date() }]);
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDay    = new Date(calYear, calMonth, 1).getDay();

  const NAV_ITEMS = [
    { id: 'docs',      icon: FileText,      label: 'Documentos'  },
    { id: 'tareas',    icon: CheckSquare,   label: 'Tareas'      },
    { id: 'notas',     icon: StickyNote,    label: 'Notas'       },
    { id: 'calendario',icon: Calendar,      label: 'Calendario'  },
    { id: 'chat',      icon: MessageCircle, label: 'Chat'        },
  ] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      {/* Top Bar */}
      <div style={{
        height: '56px', flexShrink: 0, backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: '14px',
      }}>
        <LayoutGrid size={20} color={ORANGE} />
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111' }}>Unified Workspace</h1>
        <span style={{ fontSize: '0.7rem', backgroundColor: `${ORANGE}15`, color: ORANGE, padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
          5 herramientas
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left sidebar ── */}
        <div style={{
          width: '200px', flexShrink: 0, backgroundColor: '#fff',
          borderRight: '1px solid #E5E7EB', padding: '16px 10px',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                backgroundColor: isActive ? `${ORANGE}12` : 'transparent',
                color: isActive ? ORANGE : '#6B7280',
                fontSize: '0.83rem', fontWeight: isActive ? '700' : '500',
                transition: 'all 0.12s',
              }}>
                <item.icon size={15} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* ─── DOCS ─── */}
          {section === 'docs' && (
            activeDoc ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '14px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => setActiveDoc(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', display: 'flex' }}>
                    <ChevronLeft size={20} />
                  </button>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    style={{ flex: 1, fontSize: '1.2rem', fontWeight: '800', color: '#111', border: 'none', outline: 'none', backgroundColor: 'transparent' }} />
                  <button onClick={saveDoc} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    backgroundColor: ORANGE, color: '#fff', fontSize: '0.8rem', fontWeight: '700',
                  }}>
                    <Check size={13} /> Guardar
                  </button>
                </div>
                {/* Toolbar */}
                <div style={{ display: 'flex', gap: '4px', padding: '6px 8px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  {[Bold, Italic, List, Hash].map((Icon, i) => (
                    <button key={i} style={{ padding: '5px 8px', borderRadius: '5px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#6B7280' }}>
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
                <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                  placeholder="Comenzá a escribir..."
                  style={{
                    flex: 1, minHeight: '400px', padding: '16px', borderRadius: '10px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.88rem', lineHeight: '1.7',
                    color: '#374151', resize: 'none', outline: 'none', fontFamily: 'inherit',
                  }} />
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
                  <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>Documentos ({docs.length})</h2>
                  <div style={{ flex: 1 }} />
                  <button onClick={newDoc} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    backgroundColor: ORANGE, color: '#fff', fontSize: '0.8rem', fontWeight: '700',
                  }}>
                    <Plus size={13} /> Nuevo doc
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {docs.map(doc => (
                    <div key={doc.id} style={{
                      backgroundColor: '#fff', borderRadius: '10px', padding: '14px 16px',
                      border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '12px',
                      cursor: 'pointer',
                    }} onClick={() => openDoc(doc)}>
                      <FileText size={18} color={ORANGE} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.85rem', color: '#111' }}>{doc.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>
                          Editado {doc.updatedAt.toLocaleDateString('es-UY')} · {doc.content.slice(0, 60)}...
                        </p>
                      </div>
                      <button onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={14} color="#9CA3AF" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* ─── TAREAS ─── */}
          {section === 'tareas' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Add task */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input value={newTask} onChange={e => setNewTask(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTask()}
                  placeholder="Nueva tarea... (Enter para agregar)"
                  style={{ flex: 1, padding: '9px 14px', borderRadius: '9px', border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none' }} />
                <button onClick={addTask} style={{
                  padding: '9px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  backgroundColor: ORANGE, color: '#fff', fontSize: '0.82rem', fontWeight: '700',
                }}>
                  <Plus size={15} />
                </button>
              </div>

              {/* Kanban columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                {([
                  { status: 'todo',  label: 'Por hacer',    color: '#6B7280', bg: '#F9FAFB' },
                  { status: 'doing', label: 'En progreso',  color: '#F59E0B', bg: '#FFFBEB' },
                  { status: 'done',  label: 'Completado',   color: '#22C55E', bg: '#F0FDF4' },
                ] as const).map(col => {
                  const colTasks = tasks.filter(t => t.status === col.status);
                  return (
                    <div key={col.status}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#374151' }}>{col.label}</span>
                        <span style={{ fontSize: '0.72rem', color: '#9CA3AF', backgroundColor: '#F3F4F6', padding: '1px 7px', borderRadius: '20px' }}>{colTasks.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '120px', backgroundColor: col.bg, borderRadius: '12px', padding: '10px' }}>
                        {colTasks.map(task => (
                          <div key={task.id} style={{ backgroundColor: '#fff', borderRadius: '9px', padding: '10px 12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <button onClick={() => moveTask(task.id, col.status === 'done' ? 'todo' : col.status === 'todo' ? 'doing' : 'done')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '1px', flexShrink: 0 }}>
                                {task.status === 'done' ? <CheckSquare size={14} color="#22C55E" /> : <Circle size={14} color="#D1D5DB" />}
                              </button>
                              <p style={{ margin: 0, flex: 1, fontSize: '0.8rem', fontWeight: '600', color: task.status === 'done' ? '#9CA3AF' : '#111', textDecoration: task.status === 'done' ? 'line-through' : 'none', lineHeight: '1.3' }}>
                                {task.title}
                              </p>
                              <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                <X size={12} color="#D1D5DB" />
                              </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                              <span style={{
                                fontSize: '0.65rem', fontWeight: '700', padding: '1px 6px', borderRadius: '4px',
                                backgroundColor: `${PRIORITY_COLOR[task.priority]}20`,
                                color: PRIORITY_COLOR[task.priority],
                              }}>
                                {PRIORITY_LABEL[task.priority]}
                              </span>
                              <span style={{ fontSize: '0.65rem', color: '#9CA3AF', marginLeft: 'auto' }}>{task.assignee}</span>
                            </div>
                          </div>
                        ))}
                        {colTasks.length === 0 && (
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#D1D5DB', textAlign: 'center', paddingTop: '20px' }}>Sin tareas</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── NOTAS ─── */}
          {section === 'notas' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Add note */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="Escribí una nota..."
                  rows={3}
                  style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.85rem', resize: 'none', fontFamily: 'inherit', color: '#374151', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  {NOTE_COLORS.map(c => (
                    <button key={c} onClick={() => setNoteColor(c)} style={{
                      width: '22px', height: '22px', borderRadius: '50%', border: noteColor === c ? '2.5px solid #374151' : '2px solid transparent',
                      backgroundColor: c, cursor: 'pointer', padding: 0,
                    }} />
                  ))}
                  <div style={{ flex: 1 }} />
                  <button onClick={addNote} style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    backgroundColor: ORANGE, color: '#fff', fontSize: '0.8rem', fontWeight: '700',
                  }}>
                    Agregar
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {notes.map(note => (
                  <div key={note.id} style={{
                    backgroundColor: note.color, borderRadius: '12px', padding: '16px',
                    border: '1px solid rgba(0,0,0,0.06)', minHeight: '120px',
                    display: 'flex', flexDirection: 'column', position: 'relative',
                  }}>
                    <p style={{ margin: 0, flex: 1, fontSize: '0.82rem', color: '#374151', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#9CA3AF' }}>{note.createdAt.toLocaleDateString('es-UY')}</span>
                      <button onClick={() => deleteNote(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
                        <Trash2 size={13} color="#9CA3AF" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── CALENDARIO ─── */}
          {section === 'calendario' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
                  <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <ChevronLeft size={18} color="#374151" />
                  </button>
                  <h2 style={{ flex: 1, textAlign: 'center', margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#111' }}>
                    {MONTHS_ES[calMonth]} {calYear}
                  </h2>
                  <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                    <ChevronRight size={18} color="#374151" />
                  </button>
                </div>

                {/* Day headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #F3F4F6' }}>
                  {DAYS_ES.map(d => (
                    <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: '0.72rem', fontWeight: '700', color: '#9CA3AF' }}>{d}</div>
                  ))}
                </div>

                {/* Days grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ minHeight: '80px', borderRight: '1px solid #F9FAFB', borderBottom: '1px solid #F9FAFB', backgroundColor: '#FAFAFA' }} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const today = day === 20 && calMonth === 1 && calYear === 2026;
                    const evs = CALENDAR_EVENTS.filter(e => e.date === day);
                    return (
                      <div key={day} style={{
                        minHeight: '80px', padding: '8px', borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6',
                        backgroundColor: today ? `${ORANGE}05` : '#fff',
                      }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex',
                          alignItems: 'center', justifyContent: 'center',
                          backgroundColor: today ? ORANGE : 'transparent',
                          color: today ? '#fff' : '#374151',
                          fontSize: '0.8rem', fontWeight: today ? '700' : '400',
                          marginBottom: '4px',
                        }}>
                          {day}
                        </div>
                        {evs.map((ev, j) => (
                          <div key={j} style={{
                            backgroundColor: ev.color, color: '#fff',
                            fontSize: '0.65rem', fontWeight: '600',
                            padding: '2px 6px', borderRadius: '4px',
                            marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          }}>
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ─── CHAT ─── */}
          {section === 'chat' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Channel header */}
              <div style={{ padding: '12px 20px', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={14} color="#6B7280" />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#111' }}>general</span>
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>· 4 miembros</span>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {messages.map(msg => {
                  const isMe = msg.author === 'Yo';
                  return (
                    <div key={msg.id} style={{ display: 'flex', gap: '10px', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      {!isMe && (
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: ORANGE, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: '700',
                        }}>
                          {msg.avatar}
                        </div>
                      )}
                      <div style={{ maxWidth: '65%' }}>
                        {!isMe && <p style={{ margin: '0 0 3px', fontSize: '0.72rem', color: '#6B7280', fontWeight: '600' }}>{msg.author}</p>}
                        <div style={{
                          padding: '9px 13px', borderRadius: isMe ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                          backgroundColor: isMe ? ORANGE : '#fff',
                          border: isMe ? 'none' : '1px solid #E5E7EB',
                          color: isMe ? '#fff' : '#374151',
                          fontSize: '0.83rem', lineHeight: '1.4',
                        }}>
                          {msg.text}
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '0.65rem', color: '#9CA3AF', textAlign: isMe ? 'right' : 'left' }}>
                          {msg.time.toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: '14px 20px', backgroundColor: '#fff', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Paperclip size={16} color="#9CA3AF" /></button>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Escribí un mensaje..."
                  style={{
                    flex: 1, padding: '9px 14px', borderRadius: '22px',
                    border: '1.5px solid #E5E7EB', fontSize: '0.85rem', outline: 'none',
                  }}
                />
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}><Smile size={16} color="#9CA3AF" /></button>
                <button onClick={sendMessage} disabled={!chatInput.trim()} style={{
                  width: '36px', height: '36px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  backgroundColor: chatInput.trim() ? ORANGE : '#E5E7EB',
                  color: chatInput.trim() ? '#fff' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}