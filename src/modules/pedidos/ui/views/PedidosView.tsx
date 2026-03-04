/* =====================================================
   PedidosView — Módulo Pedidos con Supabase directo
   Patrón: useSupabaseClient + DrawerForm
   ===================================================== */
import React, { useState, useEffect, useCallback } from 'react';
import { OrangeHeader } from '../../../../app/components/admin/OrangeHeader';
import type { MainSection } from '../../../../app/AdminDashboard';
import { toast } from 'sonner';
import { useSupabaseClient } from '../../../../shells/DashboardShell/app/hooks/useSupabaseClient';
import { DrawerForm } from '../../../../app/components/admin/DrawerForm';
import type { SheetDef } from '../../../../app/components/admin/DrawerForm';
import {
  ShoppingCart, Loader2, RefreshCw, Clock, CheckCircle,
  Package, Truck, XCircle, RotateCcw, DollarSign,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

const ORANGE = '#FF6835';

interface Pedido {
  id: string;
  numero_pedido: string;
  estado: string;
  estado_pago: string;
  total: number;
  subtotal?: number;
  descuento?: number;
  impuestos?: number;
  notas?: string;
  created_at: string;
}

// ── Estado config ──────────────────────────────────────────────────────────────
const ESTADO_CFG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente:      { label: 'Pendiente',      color: '#D97706', bg: '#FEF3C7', icon: Clock        },
  confirmado:     { label: 'Confirmado',     color: '#2563EB', bg: '#EFF6FF', icon: CheckCircle  },
  en_preparacion: { label: 'En preparación', color: '#7C3AED', bg: '#F5F3FF', icon: Package      },
  enviado:        { label: 'Enviado',        color: '#0891B2', bg: '#ECFEFF', icon: Truck        },
  entregado:      { label: 'Entregado',      color: '#059669', bg: '#D1FAE5', icon: CheckCircle  },
  cancelado:      { label: 'Cancelado',      color: '#DC2626', bg: '#FEE2E2', icon: XCircle      },
};

const PAGO_CFG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente:   { label: 'Pago pendiente', color: '#D97706', bg: '#FEF3C7' },
  pagado:      { label: 'Pagado',         color: '#059669', bg: '#D1FAE5' },
  parcial:     { label: 'Parcial',        color: '#7C3AED', bg: '#F5F3FF' },
  reembolsado: { label: 'Reembolsado',    color: '#6B7280', bg: '#F3F4F6' },
};

// ── Sheets para DrawerForm ─────────────────────────────────────────────────────
const PEDIDO_SHEETS: SheetDef[] = [
  {
    id: 'datos',
    title: 'Datos del pedido',
    subtitle: 'Información principal del pedido',
    fields: [
      {
        id: 'numero_pedido',
        label: 'Número de pedido',
        type: 'text',
        placeholder: 'Ej: PED-0001',
      },
      {
        id: 'estado',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'pendiente',      label: 'Pendiente'      },
          { value: 'confirmado',     label: 'Confirmado'     },
          { value: 'en_preparacion', label: 'En preparación' },
          { value: 'enviado',        label: 'Enviado'        },
          { value: 'entregado',      label: 'Entregado'      },
          { value: 'cancelado',      label: 'Cancelado'      },
        ],
        row: 'row1',
      },
      {
        id: 'estado_pago',
        label: 'Estado de pago',
        type: 'select',
        options: [
          { value: 'pendiente',   label: 'Pendiente'   },
          { value: 'pagado',      label: 'Pagado'      },
          { value: 'parcial',     label: 'Parcial'     },
          { value: 'reembolsado', label: 'Reembolsado' },
        ],
        row: 'row1',
      },
      {
        id: 'notas',
        label: 'Notas',
        type: 'textarea',
        placeholder: 'Observaciones o instrucciones especiales…',
      },
    ],
  },
  {
    id: 'montos',
    title: 'Montos',
    subtitle: 'Desglose de importes del pedido',
    fields: [
      { id: 'subtotal',   label: 'Subtotal',   type: 'number', placeholder: '0.00', row: 'row1' },
      { id: 'descuento',  label: 'Descuento',  type: 'number', placeholder: '0.00', row: 'row1' },
      { id: 'impuestos',  label: 'Impuestos',  type: 'number', placeholder: '0.00', row: 'row2' },
      { id: 'total',      label: 'Total',      type: 'number', placeholder: '0.00', row: 'row2' },
    ],
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export function PedidosView({ onNavigate }: Props) {
  const supabase = useSupabaseClient();

  const [pedidos,     setPedidos]     = useState<Pedido[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [drawerOpen,  setDrawerOpen]  = useState(false);
  const [saving,      setSaving]      = useState(false);

  // ── Cargar pedidos ───────────────────────────────────────────────────────────
  const loadPedidos = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('id, numero_pedido, estado, estado_pago, total, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos((data ?? []) as Pedido[]);
    } catch (err) {
      console.error('[PedidosView] Error cargando pedidos:', err);
      toast.error('Error al cargar los pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  // ── Guardar nuevo pedido ─────────────────────────────────────────────────────
  const handleSave = async (formData: Record<string, unknown>) => {
    if (!supabase) return;
    setSaving(true);
    try {
      const { error: insertError } = await supabase.from('pedidos').insert({
        numero_pedido: formData.numero_pedido as string ?? '',
        estado:        formData.estado        as string ?? 'pendiente',
        estado_pago:   formData.estado_pago   as string ?? 'pendiente',
        notas:         formData.notas         as string ?? null,
        subtotal:      formData.subtotal   ? Number(formData.subtotal)  : 0,
        descuento:     formData.descuento  ? Number(formData.descuento) : 0,
        impuestos:     formData.impuestos  ? Number(formData.impuestos) : 0,
        total:         formData.total      ? Number(formData.total)     : 0,
      });

      if (insertError) throw insertError;

      toast.success('Pedido creado exitosamente');
      setDrawerOpen(false);
      await loadPedidos();
    } catch (err) {
      console.error('[PedidosView] Error guardando pedido:', err);
      toast.error(`Error al guardar el pedido: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Stats rápidas ────────────────────────────────────────────────────────────
  const total      = pedidos.length;
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const enCurso    = pedidos.filter(p => ['confirmado', 'en_preparacion', 'enviado'].includes(p.estado)).length;
  const entregados = pedidos.filter(p => p.estado === 'entregado').length;
  const facturado  = pedidos.reduce((s, p) => s + (p.total ?? 0), 0);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OrangeHeader
          icon={ShoppingCart}
          title="Pedidos"
          subtitle="Cargando…"
          actions={[{ label: '← eCommerce', onClick: () => onNavigate('ecommerce') }]}
        />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader2 size={32} color={ORANGE} style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6B7280', marginTop: 12, fontSize: '0.875rem' }}>Cargando pedidos…</p>
          </div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={ShoppingCart}
        title="Pedidos"
        subtitle={`${total} pedidos · ${pendientes} pendientes · ${enCurso} en curso`}
        actions={[
          { label: '← eCommerce', onClick: () => onNavigate('ecommerce') },
          { label: '↻ Actualizar', onClick: () => loadPedidos() },
          { label: '+ Nuevo pedido', primary: true, onClick: () => setDrawerOpen(true) },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

        {/* ── KPIs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', padding: '20px 20px 0' }}>
          {[
            { label: 'Total pedidos', value: total,                                    icon: ShoppingCart, color: ORANGE     },
            { label: 'Pendientes',    value: pendientes,                               icon: Clock,        color: '#D97706'  },
            { label: 'En curso',      value: enCurso,                                  icon: Truck,        color: '#2563EB'  },
            { label: 'Entregados',    value: entregados,                               icon: CheckCircle,  color: '#059669'  },
            { label: 'Facturado',     value: `$${facturado.toLocaleString('es-UY')}`,  icon: DollarSign,   color: '#7C3AED'  },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={c.color} />
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#111', lineHeight: 1 }}>{c.value}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '3px' }}>{c.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Tabla ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {pedidos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <ShoppingCart size={44} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#374151' }}>No hay pedidos aún</p>
              <p style={{ fontSize: '0.875rem', marginTop: 6 }}>Creá el primero con "+ Nuevo pedido"</p>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['N° Pedido', 'Estado', 'Pago', 'Total', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 700, color: '#6B7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map((p, i) => {
                    const eCfg  = ESTADO_CFG[p.estado]      ?? ESTADO_CFG.pendiente;
                    const pgCfg = PAGO_CFG[p.estado_pago]   ?? PAGO_CFG.pendiente;
                    const EIcon = eCfg.icon;
                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: i < pedidos.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#FAFAFA'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
                      >
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontWeight: 700, color: ORANGE, fontFamily: 'monospace', fontSize: '0.84rem' }}>{p.numero_pedido}</span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', backgroundColor: eCfg.bg, color: eCfg.color, whiteSpace: 'nowrap' }}>
                            <EIcon size={11} /> {eCfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', backgroundColor: pgCfg.bg, color: pgCfg.color, whiteSpace: 'nowrap' }}>
                            {pgCfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                            ${(p.total ?? 0).toLocaleString('es-UY')}
                          </span>
                        </td>
                        <td style={{ padding: '13px 16px', color: '#9CA3AF', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                          {new Date(p.created_at).toLocaleDateString('es-UY')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── DrawerForm — Nuevo Pedido ── */}
      <DrawerForm
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        title="Nuevo Pedido"
        icon={ShoppingCart}
        sheets={PEDIDO_SHEETS}
        loading={saving}
      />

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
