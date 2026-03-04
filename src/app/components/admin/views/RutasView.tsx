/* =====================================================
   RutasView — Gestión de Rutas de Distribución
   Rutas Standard · Por Proyecto · Asignación
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Map, MapPin, Package, Truck, Clock, Plus,
  Search, CheckCircle2, AlertCircle, ChevronRight,
  Navigation, Users, Calendar, Edit2, Layers,
  ArrowRight, RotateCcw,
} from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

type TipoRuta = 'standard' | 'proyecto';
type EstadoRuta = 'activa' | 'pausada' | 'completada' | 'planificada';

const ESTADO_CFG: Record<EstadoRuta, { label: string; color: string; bg: string }> = {
  activa:       { label: 'Activa',       color: '#059669', bg: '#ECFDF5' },
  pausada:      { label: 'Pausada',      color: '#D97706', bg: '#FFFBEB' },
  planificada:  { label: 'Planificada',  color: '#2563EB', bg: '#EFF6FF' },
  completada:   { label: 'Completada',   color: '#6B7280', bg: '#F3F4F6' },
};

type Tab = 'todas' | 'standard' | 'proyecto';

interface Parada {
  id: string;
  orden: number;
  direccion: string;
  localidad: string;
  envios: number;
  estado: 'pendiente' | 'entregado' | 'fallido';
}

interface Ruta {
  id: string;
  nombre: string;
  tipo: TipoRuta;
  estado: EstadoRuta;
  carrier: string;
  zona: string;
  paradas: Parada[];
  enviosTotales: number;
  kmsEstimados: number;
  tiempoEstimado: string;
  frecuencia?: string;
  fechaProxima?: string;
  observaciones?: string;
}

export function RutasView({ onNavigate }: Props) {
  const supabase = useSupabaseClient();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('todas');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Ruta | null>(null);

  // Cargar rutas al montar
  useEffect(() => {
    if (!supabase) return;
    const loadRutas = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase.from('routes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        const rows = (data ?? []) as Ruta[];
        setRutas(rows);
        if (rows.length > 0) {
          setSelected(rows[0]);
        }
      } catch (err) {
        console.error('Error cargando rutas:', err);
        setError(err instanceof Error ? err.message : 'Error cargando rutas');
      } finally {
        setLoading(false);
      }
    };
    loadRutas();
  }, [supabase]);

  const filtered = rutas.filter(r => {
    if (tab === 'standard' && r.tipo !== 'standard') return false;
    if (tab === 'proyecto' && r.tipo !== 'proyecto') return false;
    if (search && !r.nombre.toLowerCase().includes(search.toLowerCase()) &&
        !r.zona.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalEnviosActivos = rutas.filter(r => r.estado === 'activa').reduce((s,r) => s + r.enviosTotales, 0);

  const handleCreateRuta = async () => {
    // TODO: Implementar modal de creación
    console.log('Crear nueva ruta');
  };

  const handleEditRuta = async (ruta: Ruta) => {
    // TODO: Implementar modal de edición
    console.log('Editar ruta:', ruta);
  };

  const handleDeleteRuta = async (id: string) => {
    if (!supabase) return;
    if (!confirm('¿Estás seguro de eliminar esta ruta?')) return;
    try {
      await supabase.from('routes').delete().eq('id', id);
      setRutas(rutas.filter(r => r.id !== id));
      if (selected?.id === id) {
        setSelected(null);
      }
    } catch (err) {
      console.error('Error eliminando ruta:', err);
      alert('Error al eliminar la ruta');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Map}
        title="Rutas de Distribución"
        subtitle={loading ? 'Cargando...' : error ? `Error: ${error}` : `${rutas.filter(r=>r.estado==='activa').length} rutas activas · ${totalEnviosActivos} envíos planificados`}
        actions={[
          { label: '← Logística', onClick: () => onNavigate('logistica') },
          { label: '+ Nueva Ruta', primary: true, onClick: handleCreateRuta },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
        {/* Lista de rutas */}
        <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #E5E7EB', backgroundColor: '#fff' }}>
          {/* Tabs + búsqueda */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar ruta o zona..."
                style={{ width: '100%', paddingLeft: '30px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '0', borderRadius: '8px', backgroundColor: '#F3F4F6', padding: '3px' }}>
              {([['todas','Todas'],['standard','Standard'],['proyecto','Proyecto']] as [Tab,string][]).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  style={{ flex: 1, padding: '6px 4px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, backgroundColor: tab === id ? '#fff' : 'transparent', color: tab === id ? '#111' : '#6B7280', boxShadow: tab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Lista */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
                Cargando rutas...
              </div>
            ) : error ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#DC2626', fontSize: '12px' }}>
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
                No hay rutas {search ? 'que coincidan con la búsqueda' : ''}
              </div>
            ) : (
              filtered.map((ruta) => {
              const estadoCfg = ESTADO_CFG[ruta.estado];
              const isSelected = selected?.id === ruta.id;
              const entregados = ruta.paradas.filter(p => p.estado === 'entregado').length;
              const pct = Math.round((entregados / ruta.paradas.length) * 100);
              return (
                <div key={ruta.id} onClick={() => setSelected(ruta)}
                  style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', backgroundColor: isSelected ? '#FFF4EC' : 'transparent', borderLeft: isSelected ? `3px solid ${ORANGE}` : '3px solid transparent', transition: 'all 0.1s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: ruta.tipo === 'proyecto' ? '#EFF6FF' : '#FFF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {ruta.tipo === 'proyecto' ? <Layers size={14} color="#2563EB" /> : <Navigation size={14} color={ORANGE} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: 1.3, marginBottom: '3px' }}>{ruta.nombre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: estadoCfg.color, backgroundColor: estadoCfg.bg, padding: '1px 6px', borderRadius: '8px' }}>{estadoCfg.label}</span>
                        <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{ruta.carrier}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#6B7280', marginBottom: '8px' }}>
                    <span>📍 {ruta.paradas.length} paradas</span>
                    <span>📦 {ruta.enviosTotales} envíos</span>
                    <span>🛣 {ruta.kmsEstimados} km</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct === 100 ? '#059669' : ORANGE, borderRadius: '2px', transition: 'width 0.3s' }} />
                  </div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '4px' }}>{entregados}/{ruta.paradas.length} entregados ({pct}%)</div>
                </div>
              );
              })
            )}
          </div>
        </div>

        {/* Detalle de ruta */}
        {selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header detalle */}
            <div style={{ backgroundColor: '#fff', padding: '20px 24px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111' }}>{selected.nombre}</h2>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: ESTADO_CFG[selected.estado].color, backgroundColor: ESTADO_CFG[selected.estado].bg, padding: '3px 8px', borderRadius: '10px' }}>
                      {ESTADO_CFG[selected.estado].label}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: selected.tipo === 'proyecto' ? '#2563EB' : ORANGE, backgroundColor: selected.tipo === 'proyecto' ? '#EFF6FF' : '#FFF4EC', padding: '3px 8px', borderRadius: '10px' }}>
                      {selected.tipo === 'proyecto' ? '📋 Proyecto' : '🔄 Standard'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '12px', color: '#6B7280', flexWrap: 'wrap' }}>
                    <span>🚚 {selected.carrier}</span>
                    <span>📍 {selected.zona}</span>
                    <span>🛣 {selected.kmsEstimados} km</span>
                    <span>⏱ {selected.tiempoEstimado}</span>
                    {selected.frecuencia && <span>📅 {selected.frecuencia}</span>}
                    {selected.fechaProxima && <span style={{ color: ORANGE, fontWeight: 700 }}>📆 Próxima: {selected.fechaProxima}</span>}
                  </div>
                  {selected.observaciones && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', backgroundColor: '#FFFBEB', borderRadius: '8px', fontSize: '12px', color: '#92400E', border: '1px solid #FDE68A' }}>
                      ⚠ {selected.observaciones}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleEditRuta(selected)} style={{ padding: '8px 16px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Editar
                  </button>
                  <button onClick={() => handleDeleteRuta(selected.id)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: '#DC2626', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                  {selected.estado !== 'activa' && (
                    <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      ▶ Iniciar ruta
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Paradas */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Paradas ({selected.paradas?.length || 0})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selected.paradas && selected.paradas.length > 0 ? selected.paradas.map((parada, idx) => {
                  const isDone = parada.estado === 'entregado';
                  const isFail = parada.estado === 'fallido';
                  return (
                    <div key={parada.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      {/* Número + línea conectora */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800,
                          backgroundColor: isDone ? '#D1FAE5' : isFail ? '#FEE2E2' : `${ORANGE}18`,
                          color: isDone ? '#059669' : isFail ? '#DC2626' : ORANGE,
                          border: `2px solid ${isDone ? '#A7F3D0' : isFail ? '#FCA5A5' : `${ORANGE}40`}`,
                        }}>
                          {isDone ? '✓' : parada.orden}
                        </div>
                        {idx < selected.paradas.length - 1 && (
                          <div style={{ width: '2px', height: '20px', backgroundColor: isDone ? '#A7F3D0' : '#E5E7EB', margin: '3px 0' }} />
                        )}
                      </div>
                      {/* Contenido */}
                      <div style={{
                        flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid #E5E7EB',
                        backgroundColor: isDone ? '#F0FDF4' : isFail ? '#FFF5F5' : '#fff',
                        marginBottom: idx < selected.paradas.length - 1 ? '0' : '0',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '3px' }}>{parada.direccion}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280' }}>{parada.localidad} · {parada.envios} envío{parada.envios > 1 ? 's' : ''}</div>
                          </div>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px',
                            color: isDone ? '#059669' : isFail ? '#DC2626' : '#D97706',
                            backgroundColor: isDone ? '#D1FAE5' : isFail ? '#FEE2E2' : '#FFFBEB',
                          }}>
                            {isDone ? '✓ Entregado' : isFail ? '✗ Fallido' : '⏳ Pendiente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280', fontSize: '12px' }}>
                    No hay paradas asignadas a esta ruta
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: '14px' }}>
            Seleccioná una ruta para ver el detalle
          </div>
        )}
      </div>
    </div>
  );
}