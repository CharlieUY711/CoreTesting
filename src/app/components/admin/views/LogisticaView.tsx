import React, { useMemo } from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import { useOrchestrator } from '../../OrchestratorShell';
import {
  Truck, Map, Users, Package, ShoppingCart, Navigation,
  CheckCircle, Layers, TrendingUp, Clock, MapPin, BarChart2,
  Box, AlertCircle, Star, Car, Warehouse, Boxes, PackageCheck,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }

export function LogisticaView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);

  const { config } = useOrchestrator();
  const modulosConfig = config?.modulos ?? [];
  const todosHabilitados = modulosConfig.includes('*');

  const todasLasCards: HubCardDef[] = [
    {
      id: 'envios', icon: Truck, onClick: nav('envios'),
      gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)', color: '#FF6835',
      badge: 'Operativo', label: 'Envíos',
      description: 'Tracking operativo árbol pedido madre → envíos hijos. Acuse de recibo por transportista o destinatario.',
      stats: [{ icon: Truck, value: '—', label: 'Activos' }, { icon: Clock, value: '—', label: 'En tránsito' }, { icon: CheckCircle, value: '—', label: 'Entregados' }],
    },
    {
      id: 'transportistas', icon: Users, onClick: nav('transportistas'),
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)', color: '#0EA5E9',
      badge: 'Carriers', label: 'Transportistas',
      description: 'Catálogo de carriers, tramos, tarifas multi-carrier local, intercity e internacional. Simulador de tarifas.',
      stats: [{ icon: Users, value: '—', label: 'Carriers' }, { icon: MapPin, value: '—', label: 'Tramos' }, { icon: BarChart2, value: '—', label: 'Zonas activas' }],
    },
    {
      id: 'rutas', icon: Map, onClick: nav('rutas'),
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 100%)', color: '#6366F1',
      badge: 'Planificación', label: 'Rutas',
      description: 'Gestión de rutas standard y personalizadas por proyecto. Mapa de paradas y progreso de entrega.',
      stats: [{ icon: Map, value: '—', label: 'Rutas activas' }, { icon: MapPin, value: '—', label: 'Paradas' }, { icon: TrendingUp, value: '—', label: 'Completadas' }],
    },
    {
      id: 'vehiculos', icon: Car, onClick: nav('vehiculos'),
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#8B5CF6',
      badge: 'Flota', label: 'Vehículos',
      description: 'Flota de vehículos · asignación a rutas · estado y mantenimiento',
      stats: [{ icon: Car, value: '—', label: 'Vehículos' }, { icon: CheckCircle, value: '—', label: 'Disponibles' }, { icon: AlertCircle, value: '—', label: 'En mantenimiento' }],
    },
    {
      id: 'depositos', icon: Warehouse, onClick: nav('depositos'),
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)', color: '#14B8A6',
      badge: 'Almacenes', label: 'Depósitos',
      description: 'Almacenes propios, terceros y cross-docking',
      stats: [{ icon: Warehouse, value: '—', label: 'Depósitos' }, { icon: MapPin, value: '—', label: 'Ubicaciones' }, { icon: Box, value: '—', label: 'Capacidad' }],
    },
    {
      id: 'inventario', icon: Boxes, onClick: nav('inventario'),
      gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', color: '#F97316',
      badge: 'Stock', label: 'Inventario',
      description: 'Stock por depósito · alertas de mínimo · movimientos entrada/salida',
      stats: [{ icon: Boxes, value: '—', label: 'Artículos' }, { icon: AlertCircle, value: '—', label: 'Alertas' }, { icon: TrendingUp, value: '—', label: 'Movimientos' }],
    },
    {
      id: 'entregas', icon: PackageCheck, onClick: nav('entregas'),
      gradient: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)', color: '#22C55E',
      badge: 'Confirmación', label: 'Entregas',
      description: 'Confirmaciones de entrega · firma · fotos · motivos de no entrega',
      stats: [{ icon: PackageCheck, value: '—', label: 'Entregadas' }, { icon: CheckCircle, value: '—', label: 'Confirmadas' }, { icon: AlertCircle, value: '—', label: 'Pendientes' }],
    },
    {
      id: 'fulfillment', icon: Layers, onClick: nav('fulfillment'),
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', color: '#7C3AED',
      badge: 'Depósito', label: 'Fulfillment / Picking',
      description: 'Wave picking, lotes de pedidos, empaque y procesamiento de órdenes en el depósito.',
      stats: [{ icon: Layers, value: '—', label: 'Waves' }, { icon: Box, value: '—', label: 'En picking' }, { icon: Package, value: '—', label: 'Empacados' }],
    },
    {
      id: 'produccion', icon: Package, onClick: nav('produccion'),
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#10B981',
      badge: 'Armado · BOM', label: 'Producción / Armado',
      description: 'Órdenes de armado orientadas a ruta. BOM (Bill of Materials) para kits, canastas y combos.',
      stats: [{ icon: Package, value: '—', label: 'OA activas' }, { icon: AlertCircle, value: '—', label: 'Sin stock' }, { icon: CheckCircle, value: '—', label: 'Completadas' }],
    },
    {
      id: 'abastecimiento', icon: ShoppingCart, onClick: nav('abastecimiento'),
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#F59E0B',
      badge: 'MRP · OC', label: 'Abastecimiento',
      description: 'OC automáticas por faltantes de stock. MRP para cálculo de componentes necesarios por proyecto.',
      stats: [{ icon: AlertCircle, value: '—', label: 'Alertas críticas' }, { icon: ShoppingCart, value: '—', label: 'OC sugeridas' }, { icon: TrendingUp, value: '—', label: 'Valor a reponer' }],
    },
    {
      id: 'mapa-envios', icon: Navigation, onClick: nav('mapa-envios'),
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: '#EC4899',
      badge: 'Geográfico', label: 'Mapa de Envíos',
      description: 'Vista geográfica de envíos activos por ruta y estado. Mapa interactivo con marcadores en tiempo real.',
      stats: [{ icon: MapPin, value: '—', label: 'En mapa' }, { icon: Truck, value: '—', label: 'Por ruta' }, { icon: Navigation, value: '—', label: 'En camino' }],
    },
    {
      id: 'tracking-publico', icon: CheckCircle, onClick: nav('tracking-publico'),
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#059669',
      badge: 'Público', label: 'Tracking Público',
      description: 'Página pública de seguimiento. Destinatarios rastrean su envío sin login, con timeline y notificaciones.',
      stats: [{ icon: Users, value: '—', label: 'Consultas' }, { icon: Star, value: '—', label: 'Satisfacción' }, { icon: CheckCircle, value: '—', label: 'Entregados' }],
    },
  ];

  const cards = useMemo(() => {
    return todasLasCards.filter(card => {
      if (todosHabilitados || modulosConfig.length === 0) return true;
      return modulosConfig.includes(card.id);
    });
  }, [modulosConfig, todosHabilitados]);

  const comingSoon: HubComingSoonItem[] = [
    { icon: TrendingUp, label: 'Optimizador IA',     desc: 'Optimización de rutas con inteligencia artificial' },
    { icon: BarChart2,  label: 'Predicción demanda', desc: 'Forecasting de pedidos por temporada'              },
    { icon: MapPin,     label: 'GPS de flota',       desc: 'Integración con GPS de transportistas'            },
    { icon: Clock,      label: 'Notif. push',        desc: 'Notificaciones push al destinatario en tiempo real'},
  ];

  return (
    <HubView
      hubIcon={Truck}
      title="Logística"
      subtitle="Rutas · Envíos · Transportistas · Producción · Abastecimiento"
      sections={[{ cards }]}
      comingSoon={comingSoon}
      comingSoonText="Optimizador de rutas con IA, predicción de demanda, integración con GPS de flota y notificaciones push al destinatario."
    />
  );
}
