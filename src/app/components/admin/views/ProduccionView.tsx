/* =====================================================
   ProduccionView — Producción / Armado
   BOM · Órdenes de Armado · Kits y Canastas
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Factory, Package, Layers, Plus, Search, Clock,
  CheckCircle2, AlertCircle, ChevronRight, Edit2,
  BarChart3, GitBranch, Box, Wrench, Play,
  Loader2,
} from 'lucide-react';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

type EstadoOrden = 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';

interface ComponenteBOM {
  sku: string;
  descripcion: string;
  cantidad: number;
  unidad: string;
  stockActual: number;
  disponible: boolean;
}

interface ArticuloCompuesto {
  id: string;
  sku: string;
  nombre: string;
  tipo: 'kit' | 'canasta' | 'combo' | 'pack';
  descripcion: string;
  componentes: ComponenteBOM[];
  tiempoArmado: number; // minutos
  costoManoObra: number;
  activo: boolean;
}

interface OrdenArmado {
  id: string;
  numero: string;
  articuloId: string;
  articuloNombre: string;
  cantidad: number;
  estado: EstadoOrden;
  ruta?: string;
  operario?: string;
  fechaPedido: string;
  fechaEntrega: string;
  prioridad: 'alta' | 'normal' | 'baja';
  notas?: string;
}


type Tab = 'ordenes' | 'bom' | 'articulos';

const ESTADO_CFG: Record<EstadoOrden, { label: string; color: string; bg: string }> = {
  pendiente:  { label: 'Pendiente',   color: '#D97706', bg: '#FFFBEB' },
  en_proceso: { label: 'En proceso',  color: '#2563EB', bg: '#EFF6FF' },
  completada: { label: 'Completada',  color: '#059669', bg: '#ECFDF5' },
  cancelada:  { label: 'Cancelada',   color: '#DC2626', bg: '#FEF2F2' },
};

const TIPO_CFG: Record<string, { label: string; emoji: string; color: string }> = {
  kit:     { label: 'Kit',     emoji: '🎁', color: '#7C3AED' },
  canasta: { label: 'Canasta', emoji: '🧺', color: ORANGE    },
  combo:   { label: 'Combo',   emoji: '📦', color: '#2563EB' },
  pack:    { label: 'Pack',    emoji: '🗂️',  color: '#059669' },
};

export function ProduccionView({ onNavigate }: Props) {
  const supabase = useSupabaseClient();
  const [tab, setTab] = useState<Tab>('ordenes');
  const [search, setSearch] = useState('');
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloCompuesto | null>(null);
  const [selectedOrden, setSelectedOrden] = useState<OrdenArmado | null>(null);
  const [articulos, setArticulos] = useState<ArticuloCompuesto[]>([]);
  const [ordenesArmado, setOrdenesArmado] = useState<OrdenArmado[]>([]);
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
      const [{ data: rawArticulos, error: errArt }, { data: rawOrdenes, error: errOrd }] = await Promise.all([
        supabase.from('produccion_articulos').select('*').eq('activo', true).order('nombre'),
        supabase.from('produccion_ordenes_armado').select('*').order('created_at', { ascending: false }),
      ]);
      if (errArt) throw errArt;
      if (errOrd) throw errOrd;

      const articulosData = (rawArticulos ?? []) as any[];
      const ordenesData = (rawOrdenes ?? []) as any[];

      const adaptedArticulos: ArticuloCompuesto[] = articulosData.map(a => ({
        id: a.id,
        sku: a.sku,
        nombre: a.nombre,
        tipo: a.tipo,
        descripcion: a.descripcion,
        componentes: Array.isArray(a.componentes) ? a.componentes : [],
        tiempoArmado: a.tiempo_armado || 0,
        costoManoObra: a.costo_mano_obra || 0,
        activo: a.activo ?? true,
      }));

      const adaptedOrdenes: OrdenArmado[] = ordenesData.map(o => ({
        id: o.id,
        numero: o.numero || '',
        articuloId: o.articulo_id || '',
        articuloNombre: o.articulo_nombre || '',
        cantidad: o.cantidad,
        estado: o.estado,
        ruta: o.ruta,
        operario: o.operario,
        fechaPedido: o.fecha_pedido || '',
        fechaEntrega: o.fecha_entrega || '',
        prioridad: o.prioridad || 'normal',
        notas: o.notas,
      }));

      setArticulos(adaptedArticulos);
      setOrdenesArmado(adaptedOrdenes);
      if (adaptedArticulos.length > 0) setSelectedArticulo(adaptedArticulos[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error cargando producción:', err);
    } finally {
      setLoading(false);
    }
  };

  const ARTICULOS: ArticuloCompuesto[] = articulos;
  const ORDENES_ARMADO: OrdenArmado[] = ordenesArmado;

  const pendientes = ORDENES_ARMADO.filter(o => o.estado === 'pendiente').length;
  const enProceso  = ORDENES_ARMADO.filter(o => o.estado === 'en_proceso').length;
  const sinStock   = ARTICULOS.flatMap(a => a.componentes || []).filter((c: any) => !c.disponible).length;

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OrangeHeader
          icon={Package}
          title="Producción / Armado"
          subtitle="Cargando..."
          actions={[
            { label: '← Logística', onClick: () => onNavigate('logistica') },
          ]}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={32} color={ORANGE} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OrangeHeader
          icon={Package}
          title="Producción / Armado"
          subtitle={`Error: ${error}`}
          actions={[
            { label: '← Logística', onClick: () => onNavigate('logistica') },
            { label: '↻ Reintentar', primary: true, onClick: loadData },
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Package}
        title="Producción / Armado"
        subtitle={`${pendientes} órdenes pendientes · ${enProceso} en proceso · ${sinStock > 0 ? `⚠ ${sinStock} componentes sin stock` : 'Stock OK'}`}
        actions={[
          { label: '← Logística', onClick: () => onNavigate('logistica') },
          { label: '+ Nueva OA', primary: true },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', padding: '16px 20px 0' }}>
          {[
            { label: 'Artículos Compuestos', value: ARTICULOS.filter(a=>a.activo).length, icon: Layers, color: '#7C3AED' },
            { label: 'OA Pendientes',         value: pendientes,  icon: Clock, color: '#D97706' },
            { label: 'En Proceso',            value: enProceso,   icon: Factory, color: '#2563EB' },
            { label: 'Alertas de Stock',      value: sinStock,    icon: AlertCircle, color: sinStock > 0 ? '#DC2626' : '#059669' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={c.color} />
                </div>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{c.value}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 20px 0', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', marginTop: '12px' }}>
          {([['ordenes','📋 Órdenes de Armado'],['bom','🔩 BOM — Artículos'],['articulos','📦 Catálogo de Kits']] as [Tab,string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '10px 20px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: tab === id ? 700 : 500, color: tab === id ? ORANGE : '#6B7280', borderBottom: tab === id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Tab: Órdenes de Armado */}
          {tab === 'ordenes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ORDENES_ARMADO.map(orden => {
                const cfg = ESTADO_CFG[orden.estado];
                const articulo = ARTICULOS.find(a => a.id === orden.articuloId);
                const tipoCfg = articulo ? TIPO_CFG[articulo.tipo] : null;
                const faltaStock = articulo?.componentes.some(c => !c.disponible);
                return (
                  <div key={orden.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${faltaStock && orden.estado === 'pendiente' ? '#FCA5A5' : '#E5E7EB'}`, padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${ORANGE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      {tipoCfg?.emoji || '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#111', fontFamily: 'monospace' }}>{orden.numero}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: cfg.color, backgroundColor: cfg.bg, padding: '2px 8px', borderRadius: '10px' }}>{cfg.label}</span>
                        {faltaStock && orden.estado === 'pendiente' && <span style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '2px 8px', borderRadius: '10px' }}>⚠ Sin stock</span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{orden.articuloNombre}</div>
                      <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#9CA3AF', flexWrap: 'wrap' }}>
                        <span>📦 {orden.cantidad} unidades</span>
                        {orden.ruta && <span>🗺 {orden.ruta}</span>}
                        {orden.operario && <span>👤 {orden.operario}</span>}
                        <span>📅 Entrega: {orden.fechaEntrega}</span>
                      </div>
                      {orden.notas && (
                        <div style={{ marginTop: '6px', fontSize: '11px', color: '#92400E', backgroundColor: '#FFFBEB', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' }}>
                          ⚠ {orden.notas}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {orden.estado === 'pendiente' && (
                        <button style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', backgroundColor: faltaStock ? '#F3F4F6' : ORANGE, color: faltaStock ? '#9CA3AF' : '#fff', fontSize: '12px', fontWeight: 700, cursor: faltaStock ? 'not-allowed' : 'pointer' }}>
                          {faltaStock ? '⚠ Sin stock' : '▶ Iniciar'}
                        </button>
                      )}
                      {orden.estado === 'en_proceso' && (
                        <button style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', backgroundColor: '#059669', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          ✓ Completar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: BOM */}
          {tab === 'bom' && (
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Lista artículos */}
              <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {ARTICULOS.map(art => {
                  const tipoCfg = TIPO_CFG[art.tipo];
                  const faltaStock = art.componentes.some(c => !c.disponible);
                  const isSelected = selectedArticulo?.id === art.id;
                  return (
                    <div key={art.id} onClick={() => setSelectedArticulo(art)}
                      style={{ backgroundColor: '#fff', borderRadius: '10px', border: `1.5px solid ${isSelected ? ORANGE : '#E5E7EB'}`, padding: '12px 14px', cursor: 'pointer', boxShadow: isSelected ? `0 0 0 3px ${ORANGE}22` : 'none', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '20px' }}>{tipoCfg.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{art.nombre}</div>
                          <div style={{ fontSize: '10px', color: '#9CA3AF' }}>SKU: {art.sku}</div>
                        </div>
                        {faltaStock && <AlertCircle size={14} color="#DC2626" />}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6B7280' }}>{art.componentes.length} componentes · ⏱ {art.tiempoArmado} min</div>
                    </div>
                  );
                })}
              </div>
              {/* BOM del artículo seleccionado */}
              {selectedArticulo && (
                <div style={{ flex: 1 }}>
                  <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '28px' }}>{TIPO_CFG[selectedArticulo.tipo].emoji}</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111' }}>{selectedArticulo.nombre}</h3>
                        <div style={{ fontSize: '12px', color: '#6B7280' }}>{selectedArticulo.descripcion}</div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#374151', marginTop: '4px' }}>
                          <span>⏱ {selectedArticulo.tiempoArmado} min/u</span>
                          <span>💰 ${selectedArticulo.costoManoObra.toLocaleString('es-UY')} mano de obra</span>
                        </div>
                      </div>
                    </div>
                    <h4 style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bill of Materials</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                          {['SKU', 'Componente', 'Cant.', 'Unidad', 'Stock actual', 'Estado'].map(h => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedArticulo.componentes.map((comp, i) => (
                          <tr key={comp.sku} style={{ borderBottom: i < selectedArticulo.componentes.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                            <td style={{ padding: '10px 12px', fontSize: '11px', fontFamily: 'monospace', color: '#6B7280' }}>{comp.sku}</td>
                            <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 500, color: '#111' }}>{comp.descripcion}</td>
                            <td style={{ padding: '10px 12px', fontSize: '13px', fontWeight: 700, color: '#374151' }}>{comp.cantidad}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: '#6B7280' }}>{comp.unidad}</td>
                            <td style={{ padding: '10px 12px', fontSize: '12px', color: comp.stockActual === 0 ? '#DC2626' : '#374151', fontWeight: comp.stockActual < 20 ? 700 : 400 }}>{comp.stockActual}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', color: comp.disponible ? '#059669' : '#DC2626', backgroundColor: comp.disponible ? '#ECFDF5' : '#FEE2E2' }}>
                                {comp.disponible ? '✓ OK' : '⚠ Sin stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                      <button style={{ padding: '10px 20px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        Editar BOM
                      </button>
                      <button style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                        + Crear Orden de Armado
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Catálogo */}
          {tab === 'articulos' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '14px' }}>
              {ARTICULOS.map(art => {
                const tipoCfg = TIPO_CFG[art.tipo];
                const faltaStock = art.componentes.some(c => !c.disponible);
                return (
                  <div key={art.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1px solid ${faltaStock ? '#FCA5A5' : '#E5E7EB'}`, padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${tipoCfg.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                        {tipoCfg.emoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '3px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{art.nombre}</span>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: tipoCfg.color, backgroundColor: `${tipoCfg.color}18`, padding: '1px 7px', borderRadius: '10px' }}>{tipoCfg.label}</span>
                          {faltaStock && <span style={{ fontSize: '10px', fontWeight: 700, color: '#DC2626', backgroundColor: '#FEE2E2', padding: '1px 7px', borderRadius: '10px' }}>⚠ Stock</span>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF' }}>SKU: {art.sku}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '10px', lineHeight: '1.5' }}>{art.descripcion}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#374151' }}>🔩 {art.componentes.length} componentes</div>
                      <div style={{ fontSize: '11px', color: '#374151' }}>⏱ {art.tiempoArmado} min/u</div>
                      <div style={{ fontSize: '11px', color: '#374151' }}>💰 ${art.costoManoObra.toLocaleString()}</div>
                      <div style={{ fontSize: '11px', color: '#374151' }}>✅ {art.componentes.filter(c=>c.disponible).length}/{art.componentes.length} con stock</div>
                    </div>
                    <button onClick={() => { setTab('bom'); setSelectedArticulo(art); }}
                      style={{ width: '100%', padding: '9px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                      Ver BOM
                    </button>
                  </div>
                );
              })}
              <div style={{ backgroundColor: '#FAFAFA', borderRadius: '12px', border: '2px dashed #E5E7EB', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', cursor: 'pointer', minHeight: '200px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={22} color={ORANGE} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: ORANGE }}>Nuevo Artículo Compuesto</span>
                <span style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center' }}>Kit · Canasta · Combo · Pack</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}