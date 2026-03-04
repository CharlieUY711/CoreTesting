/* =====================================================
   VehiculosView — Flota de Vehículos
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { Truck, Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Loader2, Car, Package } from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';

interface Vehiculo {
  id: string;
  patente: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  capacidad_kg?: number;
  capacidad_m3?: number;
  activo: boolean;
}
import { toast } from 'sonner';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

const TIPO_CFG: Record<string, { label: string; emoji: string }> = {
  moto:      { label: 'Moto',      emoji: '🏍️' },
  auto:      { label: 'Auto',      emoji: '🚗' },
  furgon:    { label: 'Furgón',    emoji: '🚐' },
  camioneta: { label: 'Camioneta', emoji: '🛻' },
  camion:    { label: 'Camión',    emoji: '🚚' },
};

const EMPTY: Partial<Vehiculo> = { tipo: 'moto', activo: true };

export function VehiculosView({ onNavigate }: Props) {
  const supabase = useSupabaseClient();
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<Vehiculo>>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('vehiculos').select('*').order('created_at', { ascending: false });
      setItems(data ?? []);
    }
    catch { toast.error('Error cargando vehículos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter(v =>
    v.patente.toLowerCase().includes(search.toLowerCase()) ||
    (v.marca || '').toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (v: Vehiculo) => { setForm(v); setEditing(v.id); setShowForm(true); };

  const save = async () => {
    if (!supabase) return;
    if (!form.patente || !form.tipo) return toast.error('Patente y tipo son requeridos');
    setSaving(true);
    try {
      if (editing) {
        await supabase.from('vehiculos').update(form).eq('id', editing);
        toast.success('Vehículo actualizado');
      } else {
        await supabase.from('vehiculos').insert(form);
        toast.success('Vehículo creado');
      }
      setShowForm(false);
      load();
    } catch { toast.error('Error guardando'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!supabase) return;
    if (!confirm('¿Eliminar vehículo?')) return;
    await supabase.from('vehiculos').delete().eq('id', id);
    toast.success('Eliminado');
    load();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <OrangeHeader title="Vehículos" subtitle="Flota propia y de transportistas" onBack={() => onNavigate('logistica')} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por patente o marca..."
              style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 10, paddingBottom: 10, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <button onClick={openNew}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            <Plus size={16} /> Nuevo
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
          {Object.entries(TIPO_CFG).map(([tipo, cfg]) => {
            const count = items.filter(v => v.tipo === tipo).length;
            return (
              <div key={tipo} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 24 }}>{cfg.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#111' }}>{count}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{cfg.label}</div>
              </div>
            );
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: ORANGE, animation: 'spin 1s linear infinite' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>
            <Truck size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
            <p>No hay vehículos{search ? ' que coincidan' : '. Agregá el primero.'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map(v => (
              <div key={v.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 28, minWidth: 40, textAlign: 'center' }}>{TIPO_CFG[v.tipo]?.emoji || '🚗'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{v.patente}</div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>{TIPO_CFG[v.tipo]?.label} {v.marca && `· ${v.marca}`} {v.modelo && v.modelo} {v.anio && `(${v.anio})`}</div>
                  {(v.capacidad_kg || v.capacidad_m3) && (
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                      {v.capacidad_kg && `${v.capacidad_kg} kg`} {v.capacidad_m3 && `· ${v.capacidad_m3} m³`}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {v.activo
                    ? <span style={{ background: '#ECFDF5', color: '#059669', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Activo</span>
                    : <span style={{ background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>Inactivo</span>
                  }
                  <button onClick={() => openEdit(v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 6 }}><Edit2 size={15} /></button>
                  <button onClick={() => remove(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 6 }}><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 700 }}>{editing ? 'Editar vehículo' : 'Nuevo vehículo'}</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              {[
                { key: 'patente', label: 'Patente *', type: 'text' },
                { key: 'marca', label: 'Marca', type: 'text' },
                { key: 'modelo', label: 'Modelo', type: 'text' },
                { key: 'anio', label: 'Año', type: 'number' },
                { key: 'capacidad_kg', label: 'Capacidad (kg)', type: 'number' },
                { key: 'capacidad_m3', label: 'Capacidad (m³)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>Tipo *</label>
                <select value={form.tipo || 'moto'} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as any }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
                  {Object.entries(TIPO_CFG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.activo ?? true} onChange={e => setForm(p => ({ ...p, activo: e.target.checked }))} />
                <span style={{ fontSize: 14 }}>Activo</span>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancelar</button>
              <button onClick={save} disabled={saving}
                style={{ padding: '9px 18px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
