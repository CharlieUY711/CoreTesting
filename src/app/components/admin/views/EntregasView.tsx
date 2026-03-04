import React from 'react';
import { OrangeHeader } from '../OrangeHeader';
import { CheckCircle2, XCircle, Clock, Search, Loader2 } from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';
import { toast } from 'sonner';

const ORANGE = '#FF6835';
const ESTADO_CFG: any = {
  entregado:    { label: 'Entregado',    color: '#059669', bg: '#ECFDF5', Icon: CheckCircle2 },
  no_entregado: { label: 'No entregado', color: '#EF4444', bg: '#FEF2F2', Icon: XCircle },
  parcial:      { label: 'Parcial',      color: '#D97706', bg: '#FFFBEB', Icon: Clock },
  devuelto:     { label: 'Devuelto',     color: '#6B7280', bg: '#F3F4F6', Icon: XCircle },
};

export function EntregasView({ onNavigate }: any) {
  const supabase = useSupabaseClient();
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filtroEstado, setFiltroEstado] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<string | null>(null);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      let query = supabase.from('entregas').select('*, envios(numero, destinatario, destino)').order('fecha_entrega', { ascending: false });
      if (filtroEstado) query = query.eq('estado', filtroEstado);
      const { data } = await query;
      setItems(data ?? []);
    }
    catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { load(); }, [filtroEstado]);

  const filtered = items.filter((e: any) =>
    !search ||
    (e.envios?.numero || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.envios?.destinatario || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <OrangeHeader title="Entregas" subtitle="Confirmaciones y acuses de recibo" onBack={() => onNavigate('logistica')} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
          {Object.entries(ESTADO_CFG).map(([k, s]: any) => {
            const { Icon } = s;
            return (
              <button key={k} onClick={() => setFiltroEstado(filtroEstado === k ? '' : k)}
                style={{ background: filtroEstado === k ? s.bg : '#fff', border: '2px solid ' + (filtroEstado === k ? s.color : '#E5E7EB'), borderRadius: 10, padding: 14, textAlign: 'center', cursor: 'pointer' }}>
                <Icon size={20} style={{ color: s.color, marginBottom: 6 }} />
                <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{items.filter((e: any) => e.estado === k).length}</div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{s.label}</div>
              </button>
            );
          })}
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar envio o destinatario..."
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }}
        />

        {loading
          ? <div style={{ textAlign: 'center', padding: 60 }}><Loader2 size={32} style={{ color: ORANGE }} /></div>
          : filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: 60, color: '#9CA3AF' }}>No hay entregas.</div>
            : (
              <div style={{ display: 'grid', gap: 10 }}>
                {filtered.map((e: any) => {
                  const cfg = ESTADO_CFG[e.estado] || ESTADO_CFG.entregado;
                  const { Icon } = cfg;
                  const isOpen = selected === e.id;
                  return (
                    <div key={e.id} onClick={() => setSelected(isOpen ? null : e.id)}
                      style={{ background: '#fff', border: '1px solid ' + (isOpen ? ORANGE : '#E5E7EB'), borderRadius: 10, padding: '16px 20px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={18} style={{ color: cfg.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>
                            {e.envios?.numero || e.envio_id.slice(0, 8)}
                            <span style={{ marginLeft: 8, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{cfg.label}</span>
                          </div>
                          <div style={{ fontSize: 13, color: '#6B7280' }}>
                            {e.envios?.destinatario}{e.envios?.destino && ' - ' + e.envios.destino}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 12, color: '#9CA3AF' }}>
                          <div>{new Date(e.fecha_entrega).toLocaleDateString('es-UY')}</div>
                          <div>{new Date(e.fecha_entrega).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      {isOpen && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #F3F4F6', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
                          {e.firmado_por && <div><span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>Firmado por</span><strong>{e.firmado_por}</strong></div>}
                          {e.notas && <div><span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>Notas</span><span style={{ fontSize: 13 }}>{e.notas}</span></div>}
                          {e.motivo_no_entrega && <div><span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>Motivo</span><span style={{ fontSize: 13, color: '#EF4444' }}>{e.motivo_no_entrega}</span></div>}
                          {e.foto_url && <div><span style={{ fontSize: 11, color: '#9CA3AF', display: 'block' }}>Foto</span><a href={e.foto_url} target="_blank" rel="noopener noreferrer" style={{ color: ORANGE, fontSize: 13 }}>Ver foto</a></div>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>
    </div>
  );
}
