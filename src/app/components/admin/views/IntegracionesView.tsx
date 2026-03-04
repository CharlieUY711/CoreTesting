import React, { useState, useEffect } from 'react';
import { HubView, HubCardDef, HubComingSoonItem } from '../HubView';
import type { MainSection } from '../../../AdminDashboard';
import {
  Plug, CreditCard, Truck, Store, Smartphone, Settings2, Globe,
  CheckCircle, BarChart2, Zap, TrendingUp, Shield, Package, Users, Key, Webhook,
} from 'lucide-react';
import { getIntegraciones } from '../../../services/integracionesApi';

interface Props { onNavigate: (s: MainSection) => void; }

export function IntegracionesView({ onNavigate }: Props) {
  const nav = (s: MainSection) => () => onNavigate(s);
  const [integraciones, setIntegraciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getIntegraciones();
        setIntegraciones(data);
      } catch (err) {
        console.error('Error cargando integraciones:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calcular contadores por tipo
  const getCountByTipo = (tipo: string) => integraciones.filter(i => i.tipo === tipo).length;
  const getActiveByTipo = (tipo: string) => integraciones.filter(i => i.tipo === tipo && i.estado === 'activo').length;

  const cards: HubCardDef[] = [
    {
      id: 'integraciones-pagos', icon: CreditCard, onClick: nav('integraciones-pagos'),
      gradient: 'linear-gradient(135deg, #FF6835 0%, #e04e20 100%)', color: '#FF6835',
      badge: '🇺🇾 Uruguay · 🌎 Global', label: 'Pasarela de Pagos',
      description: 'Plexo, OCA, Creditel, Abitab, RedPagos, Mercado Pago, PayPal, Stripe. Plexo recomendado para Uruguay.',
      stats: [
        { icon: CreditCard, value: loading ? '...' : String(getCountByTipo('pagos')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('pagos')), label: 'Conectadas' },
        { icon: Shield, value: 'UY', label: 'Foco inicial' }
      ],
    },
    {
      id: 'integraciones-logistica', icon: Truck, onClick: nav('integraciones-logistica'),
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#10B981',
      badge: '🇺🇾 Uruguay', label: 'Logística',
      description: 'Correo UY, Brixo, Mosca, PedidosYa, Fedex, DHL y más. Soporte sin API.',
      stats: [
        { icon: Truck, value: loading ? '...' : String(getCountByTipo('logistica')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('logistica')), label: 'Conectadas' },
        { icon: Package, value: 'UY', label: 'Foco inicial' }
      ],
    },
    {
      id: 'integraciones-marketplace', icon: Store, onClick: nav('integraciones-marketplace'),
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#3B82F6',
      badge: '🇺🇾 Uruguay · 🌎 Global', label: 'Marketplace',
      description: 'Mercado Libre, MercadoPago. Sincronización bidireccional de productos y pedidos.',
      stats: [
        { icon: Store, value: loading ? '...' : String(getCountByTipo('marketplace')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('marketplace')), label: 'Conectadas' },
        { icon: TrendingUp, value: '2w', label: 'Sincronización' }
      ],
    },
    {
      id: 'integraciones-comunicacion', icon: Smartphone, onClick: nav('integraciones-comunicacion'),
      gradient: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)', color: '#EC4899',
      badge: '🌎 Global', label: 'Comunicación',
      description: 'WhatsApp Business, Resend, Gmail/SMTP, Meta, Twilio SMS. Envío de mensajes y notificaciones.',
      stats: [
        { icon: Smartphone, value: loading ? '...' : String(getCountByTipo('comunicacion')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('comunicacion')), label: 'Conectadas' },
        { icon: Users, value: '—', label: 'Audiencia' }
      ],
    },
    {
      id: 'integraciones-identidad', icon: Shield, onClick: nav('integraciones-identidad'),
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#8B5CF6',
      badge: '🌎 Global', label: 'Identidad',
      description: 'MetaMap (KYC). Verificación de identidad y cumplimiento normativo.',
      stats: [
        { icon: Shield, value: loading ? '...' : String(getCountByTipo('identidad')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('identidad')), label: 'Conectadas' },
        { icon: Zap, value: '—', label: 'Verificaciones' }
      ],
    },
    {
      id: 'integraciones-analytics', icon: BarChart2, onClick: nav('integraciones-analytics'),
      gradient: 'linear-gradient(135deg, #0EA5E9 0%, #0369A1 100%)', color: '#0EA5E9',
      badge: '🌎 Global', label: 'Analytics',
      description: 'Google Analytics y más. Tracking de eventos y métricas de negocio.',
      stats: [
        { icon: BarChart2, value: loading ? '...' : String(getCountByTipo('analytics')), label: 'Proveedores' },
        { icon: CheckCircle, value: loading ? '...' : String(getActiveByTipo('analytics')), label: 'Conectadas' },
        { icon: TrendingUp, value: '—', label: 'Eventos/día' }
      ],
    },
    {
      id: 'integraciones-api-keys', icon: Key, onClick: nav('integraciones-api-keys'),
      gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#6366F1',
      badge: '🌎 Global', label: 'API Keys',
      description: 'Gestioná las API keys para dar acceso a terceros a tu plataforma.',
      stats: [
        { icon: Key, value: '—', label: 'Keys activas' },
        { icon: CheckCircle, value: '—', label: 'Permisos' },
        { icon: Shield, value: '—', label: 'Seguridad' }
      ],
    },
    {
      id: 'integraciones-webhooks', icon: Webhook, onClick: nav('integraciones-webhooks'),
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#F59E0B',
      badge: '🌎 Global', label: 'Webhooks',
      description: 'Configurá webhooks para recibir eventos externos y notificaciones en tiempo real.',
      stats: [
        { icon: Webhook, value: '—', label: 'Webhooks' },
        { icon: CheckCircle, value: '—', label: 'Activos' },
        { icon: Zap, value: '—', label: 'Eventos' }
      ],
    },
  ];

  const comingSoon: HubComingSoonItem[] = [
    { icon: Store,     label: 'App Marketplace',    desc: 'Instalación de apps en un clic'       },
    { icon: Zap,       label: 'Webhooks custom',    desc: 'Webhooks personalizados por evento'   },
    { icon: Shield,    label: 'Sandbox testing',    desc: 'Entorno de pruebas por integración'   },
    { icon: BarChart2, label: 'Health por API',     desc: 'Monitoreo de salud por integración'   },
  ];

  const intro = (
    <div style={{ padding: '12px 18px', backgroundColor: '#FFF4F0', border: '1.5px solid rgba(255,104,53,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '1.2rem' }}>🇺🇾</span>
      <div>
        <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#111827' }}>Uruguay First</span>
        <span style={{ fontSize: '0.8rem', color: '#6B7280', marginLeft: '8px' }}>
          Empezamos por los proveedores del mercado uruguayo y expandimos progresivamente a Brasil y Latam.
        </span>
      </div>
    </div>
  );

  return (
    <HubView
      hubIcon={Plug}
      title="Integraciones"
      subtitle="Conectá tu stack — Uruguay first · Expansión Latam progresiva · 65 proveedores"
      sections={[{ cards }]}
      intro={intro}
      comingSoon={comingSoon}
      comingSoonText="Marketplace de apps con instalación en un clic, webhooks personalizados, sandbox de testing y monitoreo de salud por integración."
    />
  );
}
