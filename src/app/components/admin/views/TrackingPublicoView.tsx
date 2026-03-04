/* =====================================================
   TrackingPublicoView — Tracking Público de Envíos
   Búsqueda por número · Timeline de estados
   ===================================================== */
import React, { useState, useEffect } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Search, Package, Truck, MapPin, CheckCircle2,
  Clock, XCircle, Navigation, Bell, Globe, Copy,
  QrCode, ExternalLink, ArrowRight, Loader2,
} from 'lucide-react';
import { getTrackingEnvioByCodigo, type TrackingEnvio as TrackingEnvioApi, type TrackingEvento as TrackingEventoApi } from '../../../services/trackingApi';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

interface EventoTracking {
  fecha: string;
  hora: string;
  descripcion: string;
  ubicacion: string;
  tipo: 'creado' | 'despachado' | 'en_transito' | 'en_deposito' | 'en_reparto' | 'entregado' | 'fallido';
}

interface TrackingData {
  numero: string;
  trackingExterno: string;
  carrier: string;
  estado: string;
  estadoTipo: 'creado' | 'despachado' | 'en_transito' | 'en_deposito' | 'en_reparto' | 'entregado' | 'fallido';
  origen: string;
  destino: string;
  destinatario: string;
  peso: string;
  fechaEstimada: string;
  eventos: EventoTracking[];
}


const ESTADO_CFG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  creado:      { color: '#6B7280', bg: '#F3F4F6', icon: Package      },
  despachado:  { color: '#2563EB', bg: '#EFF6FF', icon: Truck        },
  en_transito: { color: '#7C3AED', bg: '#F5F3FF', icon: Navigation   },
  en_deposito: { color: '#D97706', bg: '#FFFBEB', icon: MapPin       },
  en_reparto:  { color: ORANGE,    bg: '#FFF4EC', icon: Truck        },
  entregado:   { color: '#059669', bg: '#ECFDF5', icon: CheckCircle2 },
  fallido:     { color: '#DC2626', bg: '#FEF2F2', icon: XCircle      },
};

// Vista pública de tracking (simulando cómo la ve el destinatario)
function TrackingPublico({ data, onCopy }: { data: TrackingData; onCopy: () => void }) {
  const estadoCfg = ESTADO_CFG[data.estadoTipo];
  const EstadoIcon = estadoCfg.icon;
  const pasos = ['creado', 'despachado', 'en_transito', 'en_deposito', 'en_reparto', 'entregado'];
  const pasoActual = pasos.indexOf(data.estadoTipo);
  const pasosLabels: Record<string, string> = {
    creado: 'Creado', despachado: 'Despachado', en_transito: 'En tránsito',
    en_deposito: 'En depósito', en_reparto: 'En reparto', entregado: 'Entregado',
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Card principal */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
        {/* Header estado */}
        <div style={{ backgroundColor: estadoCfg.bg, padding: '24px', borderBottom: `3px solid ${estadoCfg.color}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: estadoCfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <EstadoIcon size={24} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: estadoCfg.color, marginBottom: '3px' }}>{data.estado}</div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                {data.estadoTipo === 'entregado' ? '✓ Envío completado exitosamente' :
                 data.estadoTipo === 'en_reparto' ? '🚚 En camino a tu domicilio hoy' :
                 `Fecha estimada de entrega: ${data.fechaEstimada}`}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de progreso por pasos */}
        {data.estadoTipo !== 'fallido' && (
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {pasos.map((paso, i) => {
                const done = i <= pasoActual;
                const active = i === pasoActual;
                return (
                  <React.Fragment key={paso}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: i === 0 || i === pasos.length - 1 ? 0 : 1 }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        backgroundColor: done ? estadoCfg.color : '#E5E7EB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: active ? `3px solid ${estadoCfg.color}` : 'none',
                        boxShadow: active ? `0 0 0 3px ${estadoCfg.color}30` : 'none',
                        transition: 'all 0.2s', flexShrink: 0,
                      }}>
                        {done && !active ? <CheckCircle2 size={14} color="#fff" /> : <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: done ? '#fff' : '#D1D5DB' }} />}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: done ? 700 : 400, color: done ? estadoCfg.color : '#9CA3AF', marginTop: '4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {pasosLabels[paso]}
                      </div>
                    </div>
                    {i < pasos.length - 1 && (
                      <div style={{ flex: 1, height: '3px', backgroundColor: i < pasoActual ? estadoCfg.color : '#E5E7EB', transition: 'background 0.3s', marginBottom: '18px', minWidth: '20px' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Info del envío */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderBottom: '1px solid #F3F4F6' }}>
          {[
            ['📦 Número', data.numero],
            ['🚚 Carrier', data.carrier],
            ['📍 Origen', data.origen],
            ['🏠 Destino', data.destino],
            ['👤 Destinatario', data.destinatario],
            ['⚖ Peso', data.peso],
          ].map(([label, value]) => (
            <div key={label as string}>
              <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{label}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Timeline de eventos */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Historial</div>
          <div style={{ position: 'relative' }}>
            {data.eventos.map((ev, idx) => {
              const cfg = ESTADO_CFG[ev.tipo] || ESTADO_CFG.creado;
              const isFirst = idx === 0;
              const Icon = cfg.icon;
              return (
                <div key={idx} style={{ display: 'flex', gap: '14px', paddingBottom: '16px', position: 'relative' }}>
                  {idx < data.eventos.length - 1 && (
                    <div style={{ position: 'absolute', left: '14px', top: '28px', bottom: 0, width: '2px', backgroundColor: '#F3F4F6' }} />
                  )}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    backgroundColor: isFirst ? cfg.color : '#F3F4F6',
                    border: `2px solid ${isFirst ? cfg.color : '#E5E7EB'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1,
                  }}>
                    <Icon size={12} color={isFirst ? '#fff' : '#9CA3AF'} />
                  </div>
                  <div style={{ flex: 1, paddingTop: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: isFirst ? 700 : 500, color: isFirst ? '#111' : '#374151' }}>{ev.descripcion}</div>
                    <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>{ev.ubicacion} · {ev.fecha}, {ev.hora}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Link público */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Globe size={18} color={ORANGE} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Link de tracking público para el destinatario</div>
          <div style={{ fontSize: '12px', color: '#2563EB', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            https://tutienda.com/tracking/{data.numero}
          </div>
        </div>
        <button onClick={onCopy} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
          <Copy size={13} /> Copiar link
        </button>
      </div>
    </div>
  );
}

const EJEMPLOS = ['ENV-15000-001', 'AND789012', 'ENV-15001-001', 'CA123456789AR'];

export function TrackingPublicoView({ onNavigate }: Props) {
  const [query, setQuery] = useState('');
  const [resultado, setResultado] = useState<TrackingData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buscar = async (q: string) => {
    const codigo = q.trim();
    if (!codigo) return;
    
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const data = await getTrackingEnvioByCodigo(codigo);
      
      // Adaptar datos del backend al formato esperado
      const adaptedData: TrackingData = {
        numero: data.numero || data.codigo,
        trackingExterno: data.tracking_externo || '',
        carrier: data.carrier || '',
        estado: data.estado || '',
        estadoTipo: data.estado_tipo || 'creado',
        origen: data.origen || '',
        destino: data.destino || '',
        destinatario: data.destinatario || '',
        peso: data.peso || '',
        fechaEstimada: data.fecha_estimada || '',
        eventos: (data.eventos || []).map((e: TrackingEventoApi) => ({
          fecha: e.fecha ? new Date(e.fecha).toLocaleDateString('es-UY', { day: 'numeric', month: 'short' }) : '',
          hora: e.hora || (e.fecha ? new Date(e.fecha).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }) : ''),
          tipo: e.tipo || 'info',
          descripcion: e.descripcion,
          ubicacion: e.ubicacion || e.lugar || '',
        })),
      };
      
      setResultado(adaptedData);
      setNotFound(false);
    } catch (err) {
      setResultado(null);
      setNotFound(true);
      setError(err instanceof Error ? err.message : 'Error buscando envío');
      console.error('Error buscando tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  const copiar = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={MapPin}
        title="Tracking Público"
        subtitle="Seguimiento de envíos para destinatarios · Página pública de consulta"
        actions={[
          { label: '← Logística', onClick: () => onNavigate('logistica') },
          { label: '🌐 Ver página pública', primary: true },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F8F9FA', padding: '28px 20px' }}>
        {/* Buscador */}
        <div style={{ maxWidth: '640px', margin: '0 auto 24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#111' }}>¿Dónde está mi paquete?</h2>
            <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#6B7280' }}>Ingresá el número de envío o código de seguimiento del carrier</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && buscar(query)}
                  placeholder="Ej: ENV-15000-001 o CA123456789AR"
                  style={{ width: '100%', paddingLeft: '44px', paddingRight: '14px', paddingTop: '12px', paddingBottom: '12px', border: '1.5px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <button onClick={() => buscar(query)} disabled={loading}
                style={{ padding: '12px 22px', border: 'none', borderRadius: '10px', backgroundColor: loading ? '#9CA3AF' : ORANGE, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={15} />} {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {/* Ejemplos */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Ejemplos:</span>
              {EJEMPLOS.map(e => (
                <button key={e} onClick={() => { setQuery(e); buscar(e); }}
                  style={{ fontSize: '11px', fontWeight: 600, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '3px 8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'monospace' }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resultado */}
        {resultado && !loading && <TrackingPublico data={resultado} onCopy={copiar} />}

        {/* No encontrado */}
        {notFound && !loading && (
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Package size={28} color="#DC2626" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#111' }}>Envío no encontrado</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#6B7280', lineHeight: '1.6' }}>No encontramos un envío con el número <strong>"{query}"</strong>. Verificá el número e intentá de nuevo.</p>
            <button onClick={() => { setQuery(''); setNotFound(false); }} style={{ padding: '10px 24px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Buscar otro
            </button>
          </div>
        )}

        {/* Estado inicial */}
        {!resultado && !notFound && !loading && (
          <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* Cómo funciona */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cómo funciona el tracking público</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { icon: Globe, title: 'Página pública', desc: 'Los destinatarios pueden ver el estado sin loguearse' },
                  { icon: Bell, title: 'Notificaciones', desc: 'Email y WhatsApp automáticos en cada cambio de estado' },
                  { icon: QrCode, title: 'QR de seguimiento', desc: 'QR en cada paquete para escaneo inmediato' },
                  { icon: Navigation, title: 'Tiempo real', desc: 'El estado se actualiza automáticamente con el carrier' },
                ].map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: '#FFF4EC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color={ORANGE} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{f.title}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px', lineHeight: '1.4' }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Config de notificaciones */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notificaciones automáticas al destinatario</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { estado: '📦 Despachado', activo: true, canales: 'Email + WhatsApp' },
                  { estado: '🚚 En reparto', activo: true, canales: 'WhatsApp' },
                  { estado: '✓ Entregado', activo: true, canales: 'Email + WhatsApp' },
                  { estado: '⚠ Intento fallido', activo: true, canales: 'Email + WhatsApp + SMS' },
                ].map(n => (
                  <div key={n.estado} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', flex: 1 }}>{n.estado}</span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>{n.canales}</span>
                    <div style={{ width: '32px', height: '18px', borderRadius: '9px', backgroundColor: n.activo ? ORANGE : '#E5E7EB', display: 'flex', alignItems: 'center', padding: '0 2px', justifyContent: n.activo ? 'flex-end' : 'flex-start' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#fff' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {copied && (
          <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#111', color: '#fff', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, zIndex: 999 }}>
            ✓ Link copiado al portapapeles
          </div>
        )}
      </div>
    </div>
  );
}