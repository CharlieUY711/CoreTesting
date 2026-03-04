import React from 'react';
import { OrangeHeader } from '../OrangeHeader';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';
import { toast } from 'sonner';

const ORANGE = '#FF6835';
const TIPO_CFG: any = {
  propio:        { label: 'Propio',        color: '#059669', bg: '#ECFDF5' },
  tercero:       { label: 'Tercero',       color: '#2563EB', bg: '#EFF6FF' },
  cross_docking: { label: 'Cross-Docking', color: '#7C3AED', bg: '#F5F3FF' },
};
const EMPTY = { tipo: 'propio', activo: true };

export function DepositosView({ onNavigate }: any) {
  const supabase = useSupabaseClient();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState<any>(EMPTY);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data } = await supabase.from('depositos').select('*').order('nombre');
      setItems(data ?? []);
    }
    catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, []);

  const filtered = items.filter(d => d.nombre.toLowerCase().includes(search.toLowerCase()));

  const save = async () => {
    if (!supabase) return;
    if (!form.nombre || !form.direccion) return toast.error('Nombre y direccion requeridos');
    setSaving(true);
    try {
      if (editing) { await supabase.from('depositos').update(form).eq('id', editing); toast.success('Actualizado'); }
      else { await supabase.from('depositos').insert(form); toast.success('Creado'); }
      setShowForm(false); load();
    } catch { toast.error('Error'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <OrangeHeader title="Depositos" subtitle="Almacenes y centros de distribucion" onBack={() => onNavigate('logistica')} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar deposito..."
            style={{ flex: 1, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14 }} />
          <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); }}
            style={{ background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>
            + Nuevo
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {Object.entries(TIPO_CFG).map(([tipo, cfg]: any) => (
            <div key={tipo} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: cfg.color }}>{items.filter(d => d.tipo === tipo).length}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{cfg.label}</div>
            </div>
          ))}
        </div>
        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: ORANGE }} /></div>
          : filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>No hay depositos.</div>
            : <div style={{ display: 'grid', gap: 10 }}>
                {filtered.map((d: any) => {
                  const cfg = TIPO_CFG[d.tipo] || TIPO_CFG.propio;
                  return (
                    <div key={d.id} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{d.nombre}</div>
                        <div style={{ fontSize: 13, color: '#6B7280' }}>{d.direccion}{d.ciudad && ', ' + d.ciudad}</div>
                      </div>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{cfg.label}</span>
                      <button onClick={() => { setForm(d); setEditing(d.id); setShowForm(true); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}><Edit2 size={15} /></button>
                      <button onClick={async () => { if (supabase && confirm('Eliminar?')) { await supabase.from('depositos').delete().eq('id', d.id); load(); } }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}><Trash2 size={15} /></button>
                    </div>
                  );
                })}
              </div>
        }
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480 }}>
              <h3 style={{ margin: '0 0 20px' }}>{editing ? 'Editar' : 'Nuevo'} deposito</h3>
              {[['nombre','Nombre *'],['direccion','Direccion *'],['ciudad','Ciudad'],['responsable','Responsable'],['telefono','Telefono']].map(([k,l]) => (
                <div key={k} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>{l}</label>
                  <input value={form[k] || ''} onChange={e => setForm((p: any) => ({ ...p, [k]: e.target.value }))}
                    style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 4 }}>Tipo</label>
                <select value={form.tipo || 'propio'} onChange={e => setForm((p: any) => ({ ...p, tipo: e.target.value }))}
                  style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: 8, padding: '9px 12px', fontSize: 14 }}>
                  <option value="propio">Propio</option>
                  <option value="tercero">Tercero</option>
                  <option value="cross_docking">Cross-Docking</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                <button onClick={save} disabled={saving} style={{ padding: '9px 18px', background: ORANGE, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
