/* =====================================================
   FulfillmentView — Fulfillment / Picking
   Wave Picking · Lotes · Empaque · Procesamiento
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Box, CheckCircle2, Clock, AlertCircle, Package,
  Layers, BarChart3, Play, Pause, Check, X,
  Search, Filter, Plus, Zap, RotateCcw,
  ArrowRight, Users, TrendingUp, Archive,
  Loader2,
} from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

type EstadoOrden = 'pendiente' | 'en_picking' | 'listo_empacar' | 'empacado' | 'despachado';
type PrioridadOrden = 'urgente' | 'alta' | 'normal' | 'baja';

interface LineaOrden {
  sku: string;
  descripcion: string;
  cantidad: number;
  ubicacion: string;
  pickeado: boolean;
}

interface OrdenFulfillment {
  id: string;
  numero: string;
  pedido: string;
  cliente: string;
  estado: EstadoOrden;
  prioridad: PrioridadOrden;
  items: number;
  lineas: LineaOrden[];
  operario?: string;
  zona: string;
  tiempoEstimado: string;
  fechaCreacion: string;
  wave?: string;
}

interface Wave {
  id: string;
  nombre: string;
  ordenes: number;
  items: number;
  estado: 'abierta' | 'en_proceso' | 'completada';
  operarios: number;
  inicio?: string;
}

export function FulfillmentView({ onNavigate }: Props) {
  const supabase = useSupabaseClient();
  const [tab, setTab] = useState<Tab>('ordenes');
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState<EstadoOrden | 'todos'>('todos');
  const [selectedOrden, setSelectedOrden] = useState<OrdenFulfillment | null>(null);
  const [ordenes, setOrdenes] = useState<OrdenFulfillment[]>([]);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const [{ data: rawOrdenes, error: errOrdenes }, { data: rawWaves, error: errWaves }] = await Promise.all([
        supabase.from('fulfillment_ordenes').select('*').order('created_at', { ascending: false }),
        supabase.from('fulfillment_waves').select('*').order('created_at', { ascending: false }),
      ]);
      if (errOrdenes) throw errOrdenes;
      if (errWaves) throw errWaves;

      const ordenesData = (rawOrdenes ?? []) as any[];
      const wavesData = (rawWaves ?? []) as any[];

      const adaptedOrdenes: OrdenFulfillment[] = ordenesData.map(o => ({
        id: o.id,
        numero: o.numero || '',
        pedido: o.pedido || '',
        cliente: o.cliente,
        estado: o.estado,
        prioridad: o.prioridad || 'normal',
        items: o.items || 0,
        zona: o.zona || '',
        tiempoEstimado: o.tiempo_estimado || '—',
        fechaCreacion: o.fecha_creacion || o.created_at || '',
        wave: o.wave_id,
        operario: o.operario,
        lineas: Array.isArray(o.lineas) ? o.lineas : [],
      }));

      const adaptedWaves: Wave[] = wavesData.map(w => ({
        id: w.id,
        nombre: w.nombre,
        ordenes: Array.isArray(w.ordenes) ? w.ordenes.length : 0,
        items: 0,
        estado: w.estado,
        operarios: w.operarios || 0,
        inicio: w.inicio,
      }));

      setOrdenes(adaptedOrdenes);
      setWaves(adaptedWaves);
      if (adaptedOrdenes.length > 0) setSelectedOrden(adaptedOrdenes[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error cargando fulfillment:', err);
    } finally {
      setLoading(false);
    }
  };

  const ORDENES: OrdenFulfillment[] = ordenes;
  const WAVES: Wave[] = waves;

const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente:      { label: 'Pendiente',       color: '#6B7280', bg: '#F3F4F6', icon: Clock       },
  en_picking:     { label: 'En Picking',      color: '#2563EB', bg: '#EFF6FF', icon: Package     },
  listo_empacar:  { label: 'Listo Empacar',   color: ORANGE,    bg: '#FFF4EC', icon: Box         },
  empacado:       { label: 'Empacado',         color: '#7C3AED', bg: '#F5F3FF', icon: Archive     },
  despachado:     { label: 'Despachado',       color: '#059669', bg: '#ECFDF5', icon: CheckCircle2},
};

const PRIO_CFG: Record<PrioridadOrden, { label: string; color: string }> = {
  urgente: { label: '🔴 Urgente', color: '#DC2626' },
  alta:    { label: '🟠 Alta',    color: ORANGE    },
  normal:  { label: '🟡 Normal',  color: '#D97706' },
  baja:    { label: '⚪ Baja',    color: '#6B7280' },
};

type Tab = 'ordenes' | 'waves' | 'empaque';


  const filtered = ORDENES.filter(o => {
    if (filterEstado !== 'todos' && o.estado !== filterEstado) return false;
    if (search && !o.numero.toLowerCase().includes(search.toLowerCase()) &&
        !o.cliente.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pendientes:    ORDENES.filter(o => o.estado === 'pendiente').length,
    en_picking:    ORDENES.filter(o => o.estado === 'en_picking').length,
    listo_empacar: ORDENES.filter(o => o.estado === 'listo_empacar').length,
    empacado:      ORDENES.filter(o => o.estado === 'empacado').length,
    despachado:    ORDENES.filter(o => o.estado === 'despachado').length,
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Layers}
        title="Fulfillment / Picking"
        subtitle={`${stats.pendientes} pendientes · ${stats.en_picking} en picking · ${stats.listo_empacar} listos para empacar`}
        actions={[
          { label: '← Logística', onClick: () => onNavigate('logistica') },
          { label: '⚡ Crear Wave', primary: true },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
        {/* KPIs de flujo */}
        <div style={{ display: 'flex', gap: '0', padding: '16px 20px 0', overflowX: 'auto' }}>
          {Object.entries(ESTADO_CFG).map(([estado, cfg], i) => {
            const cnt = ORDENES.filter(o => o.estado === estado).length;
            const Icon = cfg.icon;
            return (
              <React.Fragment key={estado}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fff', borderRadius: i === 0 ? '12px 0 0 12px' : i === 4 ? '0 12px 12px 0' : '0', border: '1px solid #E5E7EB', borderLeft: i > 0 ? '0' : '1px solid #E5E7EB', minWidth: '120px', flex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: cfg.color }}>{cnt}</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textAlign: 'center', marginTop: '2px' }}>{cfg.label}</div>
                </div>
                {i < 4 && <div style={{ display: 'flex', alignItems: 'center', zIndex: 1 }}><ArrowRight size={14} color="#D1D5DB" /></div>}
              </React.Fragment>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 20px 0', gap: '0', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', marginTop: '12px' }}>
          {([['ordenes','📋 Órdenes'],['waves','⚡ Waves'],['empaque','📦 Empaque']] as [Tab,string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: tab === id ? 700 : 500, color: tab === id ? ORANGE : '#6B7280', borderBottom: tab === id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Tab: Órdenes */}
          {tab === 'ordenes' && (
            <>
              {/* Lista órdenes */}
              <div style={{ width: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', borderRight: '1px solid #E5E7EB' }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar orden..."
                      style={{ width: '100%', paddingLeft: '28px', paddingRight: '8px', paddingTop: '7px', paddingBottom: '7px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <select value={filterEstado} onChange={e => setFilterEstado(e.target.value as any)}
                    style={{ padding: '7px 10px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', backgroundColor: '#fff' }}>
                    <option value="todos">Todos</option>
                    {Object.entries(ESTADO_CFG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {filtered.map(orden => {
                    const cfg = ESTADO_CFG[orden.estado];
                    const prioCfg = PRIO_CFG[orden.prioridad];
                    const Icon = cfg.icon;
                    const isSelected = selectedOrden?.id === orden.id;
                    return (
                      <div key={orden.id} onClick={() => setSelectedOrden(orden)}
                        style={{ padding: '12px 14px', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', backgroundColor: isSelected ? '#FFF4EC' : 'transparent', borderLeft: isSelected ? `3px solid ${ORANGE}` : '3px solid transparent' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={13} color={cfg.color} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{orden.numero}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{orden.cliente} · Zona {orden.zona}</div>
                          </div>
                          <span style={{ fontSize: '10px', color: prioCfg.color, fontWeight: 700, flexShrink: 0 }}>{prioCfg.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.color, backgroundColor: cfg.bg, padding: '2px 8px', borderRadius: '8px' }}>{cfg.label}</span>
                          <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#9CA3AF' }}>
                            <span>📦 {orden.items} items</span>
                            {orden.operario && <span>👤 {orden.operario}</span>}
                            {orden.tiempoEstimado !== '—' && <span>⏱ {orden.tiempoEstimado}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detalle orden + picking */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {selectedOrden ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111' }}>{selectedOrden.numero}</h2>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: ESTADO_CFG[selectedOrden.estado].color, backgroundColor: ESTADO_CFG[selectedOrden.estado].bg, padding: '3px 10px', borderRadius: '10px' }}>
                        {ESTADO_CFG[selectedOrden.estado].label}
                      </span>
                      <span style={{ fontSize: '11px', color: PRIO_CFG[selectedOrden.prioridad].color, fontWeight: 700 }}>
                        {PRIO_CFG[selectedOrden.prioridad].label}
                      </span>
                      <div style={{ flex: 1 }} />
                      {selectedOrden.estado === 'pendiente' && (
                        <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: '#2563EB', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          ▶ Iniciar Picking
                        </button>
                      )}
                      {selectedOrden.estado === 'listo_empacar' && (
                        <button style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          📦 Empacar
                        </button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '20px' }}>
                      {[
                        ['Pedido', selectedOrden.pedido],
                        ['Cliente', selectedOrden.cliente],
                        ['Zona depósito', `Zona ${selectedOrden.zona}`],
                        ['Wave', selectedOrden.wave ? WAVES.find(w=>w.id===selectedOrden.wave)?.nombre || '—' : '—'],
                        ['Operario', selectedOrden.operario || 'Sin asignar'],
                        ['T. estimado', selectedOrden.tiempoEstimado],
                      ].map(([k,v]) => (
                        <div key={k} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '10px 12px' }}>
                          <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{k}</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {selectedOrden.lineas.length > 0 && (
                      <>
                        <h3 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Líneas de Picking</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedOrden.lineas.map((linea, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${linea.pickeado ? '#A7F3D0' : '#E5E7EB'}`, backgroundColor: linea.pickeado ? '#F0FDF4' : '#fff' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: linea.pickeado ? '#D1FAE5' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {linea.pickeado ? <Check size={14} color="#059669" /> : <Package size={14} color="#9CA3AF" />}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{linea.descripcion}</div>
                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>SKU: {linea.sku} · Ubicación: <strong style={{ color: '#2563EB' }}>{linea.ubicacion}</strong></div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>×{linea.cantidad}</span>
                                <button style={{ width: '28px', height: '28px', borderRadius: '8px', border: `1.5px solid ${linea.pickeado ? '#059669' : '#E5E7EB'}`, backgroundColor: linea.pickeado ? '#059669' : '#fff', color: linea.pickeado ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                  <Check size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: '#9CA3AF' }}>
                    Seleccioná una orden para ver el detalle
                  </div>
                )}
              </div>
            </>
          )}

          {/* Tab: Waves */}
          {tab === 'waves' && (
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
                {WAVES.map(wave => {
                  const cfg = { abierta: { color: '#2563EB', bg: '#EFF6FF', label: 'Abierta' }, en_proceso: { color: ORANGE, bg: '#FFF4EC', label: 'En proceso' }, completada: { color: '#059669', bg: '#ECFDF5', label: 'Completada' } }[wave.estado];
                  return (
                    <div key={wave.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${wave.estado === 'en_proceso' ? ORANGE : '#E5E7EB'}`, padding: '20px', boxShadow: wave.estado === 'en_proceso' ? `0 0 0 3px ${ORANGE}22` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: '#111', marginBottom: '4px' }}>{wave.nombre}</div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.color, backgroundColor: cfg.bg, padding: '2px 8px', borderRadius: '10px' }}>{cfg.label}</span>
                        </div>
                        {wave.inicio && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>⏰ {wave.inicio}</span>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        {[
                          ['Órdenes', wave.ordenes, '📋'],
                          ['Items', wave.items, '📦'],
                          ['Operarios', wave.operarios || '—', '👤'],
                        ].map(([label, value, emoji]) => (
                          <div key={label as string} style={{ textAlign: 'center', padding: '8px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111' }}>{emoji} {value}</div>
                            <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{label}</div>
                          </div>
                        ))}
                      </div>
                      {wave.estado !== 'completada' && (
                        <button style={{ width: '100%', padding: '10px', border: 'none', borderRadius: '8px', backgroundColor: wave.estado === 'abierta' ? ORANGE : '#F3F4F6', color: wave.estado === 'abierta' ? '#fff' : '#6B7280', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {wave.estado === 'abierta' ? <><Play size={13} /> Iniciar Wave</> : <><Pause size={13} /> Pausar</>}
                        </button>
                      )}
                    </div>
                  );
                })}
                {/* Crear wave */}
                <div style={{ backgroundColor: '#FAFAFA', borderRadius: '12px', border: '2px dashed #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', minHeight: '180px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={22} color={ORANGE} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: ORANGE }}>Nueva Wave</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Empaque */}
          {tab === 'empaque' && (
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '700px' }}>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Cola de Empaque</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {ORDENES.filter(o => ['listo_empacar', 'empacado'].includes(o.estado)).map(orden => {
                      const cfg = ESTADO_CFG[orden.estado];
                      const Icon = cfg.icon;
                      return (
                        <div key={orden.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: '10px', backgroundColor: orden.estado === 'listo_empacar' ? '#FFFBEB' : '#F0FDF4' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} color={cfg.color} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{orden.numero} — {orden.cliente}</div>
                            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{orden.items} items · Zona {orden.zona}</div>
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.color, backgroundColor: cfg.bg, padding: '3px 10px', borderRadius: '10px' }}>{cfg.label}</span>
                          {orden.estado === 'listo_empacar' && (
                            <button style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                              📦 Empacar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 800, color: '#111' }}>Materiales de Empaque</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {[
                      { nombre: 'Caja 30×20×15 cm', stock: 124, alerta: false },
                      { nombre: 'Caja 40×30×20 cm', stock: 78, alerta: false },
                      { nombre: 'Sobre burbuja A4', stock: 23, alerta: true },
                      { nombre: 'Cinta de embalar', stock: 8, alerta: true },
                      { nombre: 'Film stretch', stock: 5, alerta: true },
                      { nombre: 'Relleno biodegradable', stock: 340, alerta: false },
                    ].map(m => (
                      <div key={m.nombre} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: `1px solid ${m.alerta ? '#FCA5A5' : '#E5E7EB'}`, borderRadius: '8px', backgroundColor: m.alerta ? '#FFF5F5' : '#fff' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: m.alerta ? '#EF4444' : '#059669', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#111' }}>{m.nombre}</div>
                          <div style={{ fontSize: '11px', color: m.alerta ? '#DC2626' : '#9CA3AF' }}>Stock: {m.stock} u. {m.alerta ? '⚠ Bajo' : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}