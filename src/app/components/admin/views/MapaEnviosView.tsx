/* =====================================================
   MapaEnviosView — Mapa Visual de Envíos Activos
   Vista geográfica por ruta y estado
   ===================================================== */
import React, { useState, useEffect, useMemo } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  MapPin, Truck, Package, Navigation, CheckCircle2,
  AlertCircle, Filter, RefreshCw, Eye, Clock,
  ZoomIn, ZoomOut, Layers, Circle, Loader2,
} from 'lucide-react';
import { getPuntosMapa, type PuntoMapa as PuntoMapaApi } from '../../../services/mapaEnviosApi';
import { GoogleMap, type MapMarker } from '../../ui/GoogleMap';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

interface PuntoMapa {
  id: string;
  tipo: 'deposito' | 'en_transito' | 'entregado' | 'fallido' | 'en_reparto';
  numero: string;
  x?: number; // % horizontal (para SVG legacy)
  y?: number; // % vertical (para SVG legacy)
  lat?: number; // Latitud (para Google Maps)
  lng?: number; // Longitud (para Google Maps)
  cliente: string;
  carrier: string;
  localidad: string;
  provincia: string;
}

// Centro por defecto: Montevideo, Uruguay
const MONTEVIDEO_CENTER = { lat: -34.9011, lng: -56.1645 };
const DEFAULT_ZOOM = 12;


const TIPO_CFG: Record<string, { color: string; label: string; icon: React.ElementType; size: number }> = {
  deposito:    { color: '#374151', label: 'Depósito',     icon: Package,      size: 18 },
  en_transito: { color: '#7C3AED', label: 'En tránsito',  icon: Truck,        size: 14 },
  en_reparto:  { color: ORANGE,    label: 'En reparto',   icon: Navigation,   size: 14 },
  entregado:   { color: '#059669', label: 'Entregado',    icon: CheckCircle2, size: 13 },
  fallido:     { color: '#DC2626', label: 'Fallido',      icon: AlertCircle,  size: 14 },
};

// Función SVG mapa removida - ahora usamos Google Maps

export function MapaEnviosView({ onNavigate }: Props) {
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [selectedPunto, setSelectedPunto] = useState<PuntoMapa | null>(null);
  const [puntos, setPuntos] = useState<PuntoMapa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const puntosData = await getPuntosMapa();
      
      const adaptedPuntos: PuntoMapa[] = puntosData.map(p => ({
        id: p.id,
        tipo: p.tipo,
        numero: p.numero || '',
        lat: p.lat || (p.x ? undefined : MONTEVIDEO_CENTER.lat), // Usar lat si existe, sino centro de Montevideo
        lng: p.lng || (p.y ? undefined : MONTEVIDEO_CENTER.lng), // Usar lng si existe, sino centro de Montevideo
        x: p.x, // Mantener para compatibilidad
        y: p.y, // Mantener para compatibilidad
        cliente: p.cliente || '',
        carrier: p.carrier || '',
        localidad: p.localidad || '',
        provincia: p.provincia || '',
      }));

      setPuntos(adaptedPuntos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos');
      console.error('Error cargando mapa de envíos:', err);
    } finally {
      setLoading(false);
    }
  };

  const PUNTOS: PuntoMapa[] = puntos;

  const counts = {
    en_transito: PUNTOS.filter(p => p.tipo === 'en_transito').length,
    en_reparto:  PUNTOS.filter(p => p.tipo === 'en_reparto').length,
    entregado:   PUNTOS.filter(p => p.tipo === 'entregado').length,
    fallido:     PUNTOS.filter(p => p.tipo === 'fallido').length,
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <OrangeHeader
          icon={Navigation}
          title="Mapa de Envíos"
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
          icon={Navigation}
          title="Mapa de Envíos"
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
        icon={Navigation}
        title="Mapa de Envíos"
        subtitle={`${counts.en_transito} en tránsito · ${counts.en_reparto} en reparto · ${counts.entregado} entregados · ${counts.fallido} fallidos`}
        actions={[
          { label: '← Logística', onClick: () => onNavigate('logistica') },
          { label: '↻ Actualizar', onClick: loadData },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
        {/* Panel lateral izquierdo */}
        <div style={{ width: '260px', flexShrink: 0, backgroundColor: '#fff', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filtros */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filtrar por estado</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'todos',       label: 'Todos los envíos', count: PUNTOS.filter(p=>p.tipo!=='deposito').length },
                { id: 'en_transito', label: 'En tránsito',     count: counts.en_transito },
                { id: 'en_reparto',  label: 'En reparto',      count: counts.en_reparto  },
                { id: 'entregado',   label: 'Entregados',      count: counts.entregado   },
                { id: 'fallido',     label: 'Fallidos',        count: counts.fallido     },
              ].map(f => {
                const cfg = f.id !== 'todos' ? TIPO_CFG[f.id] : { color: '#374151' };
                const isActive = filtroTipo === f.id;
                return (
                  <button key={f.id} onClick={() => setFiltroTipo(f.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: `1px solid ${isActive ? cfg.color : '#E5E7EB'}`, borderRadius: '8px', backgroundColor: isActive ? `${cfg.color}12` : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cfg.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, color: isActive ? cfg.color : '#374151', flex: 1, textAlign: 'left' }}>{f.label}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '1px 6px', borderRadius: '8px' }}>{f.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leyenda */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB' }}>
            <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Leyenda</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(TIPO_CFG).filter(([k])=>k!=='deposito').map(([tipo, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={10} color="#fff" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#374151' }}>{cfg.label}</span>
                  </div>
                );
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={10} color="#fff" />
                </div>
                <span style={{ fontSize: '12px', color: '#374151' }}>Depósito / origen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: ORANGE, boxShadow: `0 0 0 4px ${ORANGE}30`, flexShrink: 0, marginLeft: '5px' }} />
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginLeft: '5px' }}>Pulso = en reparto activo</span>
              </div>
            </div>
          </div>

          {/* Lista de puntos (scrollable) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {PUNTOS.filter(p => p.tipo !== 'deposito' && (filtroTipo === 'todos' || p.tipo === filtroTipo)).map(punto => {
              const cfg = TIPO_CFG[punto.tipo];
              const isSelected = selectedPunto?.id === punto.id;
              return (
                <div key={punto.id} onClick={() => setSelectedPunto(isSelected ? null : punto)}
                  style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px 16px', cursor: 'pointer', backgroundColor: isSelected ? '#FFF4EC' : 'transparent', borderLeft: isSelected ? `3px solid ${ORANGE}` : '3px solid transparent' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <cfg.icon size={11} color="#fff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{punto.numero}</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{punto.localidad} · {punto.carrier}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mapa */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Google Maps con marcadores de envíos */}
          {(() => {
            const puntosFiltrados = PUNTOS.filter(p => 
              p.tipo !== 'deposito' && 
              (filtroTipo === 'todos' || p.tipo === filtroTipo) &&
              p.lat !== undefined && p.lng !== undefined
            );

            const markers: MapMarker[] = puntosFiltrados.map(p => {
              const cfg = TIPO_CFG[p.tipo];
              return {
                id: p.id,
                lat: p.lat!,
                lng: p.lng!,
                title: `${p.numero} - ${cfg.label}`,
                color: cfg.color,
                onClick: () => setSelectedPunto(p),
              };
            });

            // Agregar depósitos también
            const depositos = PUNTOS.filter(p => p.tipo === 'deposito' && p.lat !== undefined && p.lng !== undefined);
            depositos.forEach(p => {
              markers.push({
                id: p.id,
                lat: p.lat!,
                lng: p.lng!,
                title: `Depósito ${p.numero}`,
                color: '#374151',
                onClick: () => setSelectedPunto(p),
              });
            });

            // Calcular centro del mapa basado en los puntos visibles
            let mapCenter = MONTEVIDEO_CENTER;
            let mapZoom = DEFAULT_ZOOM;

            if (markers.length > 0) {
              const lats = markers.map(m => m.lat);
              const lngs = markers.map(m => m.lng);
              const minLat = Math.min(...lats);
              const maxLat = Math.max(...lats);
              const minLng = Math.min(...lngs);
              const maxLng = Math.max(...lngs);
              
              mapCenter = {
                lat: (minLat + maxLat) / 2,
                lng: (minLng + maxLng) / 2,
              };
              
              // Calcular zoom aproximado basado en el área cubierta
              const latDiff = maxLat - minLat;
              const lngDiff = maxLng - minLng;
              const maxDiff = Math.max(latDiff, lngDiff);
              
              if (maxDiff > 0.5) mapZoom = 10;
              else if (maxDiff > 0.2) mapZoom = 11;
              else if (maxDiff > 0.1) mapZoom = 12;
              else if (maxDiff > 0.05) mapZoom = 13;
              else mapZoom = 14;
            }

            return (
              <GoogleMap
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
                height="100%"
                onMarkerClick={(marker) => {
                  const punto = PUNTOS.find(p => p.id === marker.id);
                  if (punto) setSelectedPunto(punto);
                }}
              />
            );
          })()}

          {/* Tooltip del punto seleccionado */}
          {selectedPunto && selectedPunto.tipo !== 'deposito' && (
            <div style={{
              position: 'absolute', bottom: '20px', right: '20px',
              backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB',
              padding: '16px', width: '240px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: TIPO_CFG[selectedPunto.tipo].color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(TIPO_CFG[selectedPunto.tipo].icon, { size: 13, color: '#fff' })}
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{selectedPunto.numero}</div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{TIPO_CFG[selectedPunto.tipo].label}</div>
                </div>
                <button onClick={() => setSelectedPunto(null)} style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: '16px', lineHeight: 1 }}>×</button>
              </div>
              {[
                ['Cliente', selectedPunto.cliente],
                ['Carrier', selectedPunto.carrier],
                ['Localidad', selectedPunto.localidad],
                ['Provincia', selectedPunto.provincia],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '5px' }}>
                  <span style={{ color: '#9CA3AF', width: '65px', flexShrink: 0 }}>{k}</span>
                  <span style={{ color: '#111', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <button onClick={() => onNavigate('envios')} style={{ marginTop: '10px', width: '100%', padding: '8px', border: `1.5px solid ${ORANGE}`, borderRadius: '8px', backgroundColor: 'transparent', color: ORANGE, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Ver detalle del envío →
              </button>
            </div>
          )}

          {/* Stats superpuestos */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(counts).map(([tipo, cnt]) => {
              if (cnt === 0) return null;
              const cfg = TIPO_CFG[tipo];
              return (
                <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '5px 10px', borderRadius: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: `1px solid ${cfg.color}30` }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.color }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: cfg.color }}>{cnt}</span>
                  <span style={{ fontSize: '11px', color: '#374151' }}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}