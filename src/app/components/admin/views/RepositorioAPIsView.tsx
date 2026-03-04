/**
 * Repositorio de APIs — Catálogo centralizado de todas las APIs del sistema
 */
import React, { useState, useMemo } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Search, ExternalLink, Copy, CheckCircle2, XCircle, AlertCircle,
  Clock, Key, Globe, Zap, RefreshCw, ChevronDown, ChevronRight,
  Database, Shield, Activity,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props { onNavigate: (s: MainSection) => void; }

type APIStatus = 'connected' | 'not-configured' | 'error' | 'partial';
type AuthType  = 'api-key' | 'oauth2' | 'bearer' | 'webhook' | 'none';
type Category  = 'pagos' | 'tiendas' | 'logistica' | 'mensajeria' | 'rrss' | 'ia' | 'backend' | 'marketing' | 'finanzas' | 'mapas';

interface APIEntry {
  id: string;
  name: string;
  logo: string;
  category: Category;
  status: APIStatus;
  authType: AuthType;
  baseUrl: string;
  docsUrl: string;
  description: string;
  envKey?: string;
  latency?: number;
  flag: string;
  sandbox?: boolean;
}

const CATEGORY_INFO: Record<Category, { label: string; color: string; bg: string }> = {
  pagos:      { label: 'Pagos',       color: '#FF6835', bg: '#FFF4F0' },
  tiendas:    { label: 'Tiendas',     color: '#3B82F6', bg: '#EFF6FF' },
  logistica:  { label: 'Logística',   color: '#10B981', bg: '#F0FDF8' },
  mensajeria: { label: 'Mensajería',  color: '#8B5CF6', bg: '#F5F3FF' },
  rrss:       { label: 'RRSS',        color: '#EC4899', bg: '#FDF2F8' },
  ia:         { label: 'IA',          color: '#F59E0B', bg: '#FFFBEB' },
  backend:    { label: 'Backend',     color: '#059669', bg: '#ECFDF5' },
  marketing:  { label: 'Marketing',   color: '#EF4444', bg: '#FEF2F2' },
  finanzas:   { label: 'Finanzas',    color: '#0EA5E9', bg: '#F0F9FF' },
  mapas:      { label: 'Mapas',       color: '#6366F1', bg: '#EEF2FF' },
};

const STATUS_META: Record<APIStatus, { label: string; color: string; icon: any }> = {
  connected:      { label: 'Conectada',       color: '#059669', icon: CheckCircle2 },
  'not-configured': { label: 'Sin configurar', color: '#9CA3AF', icon: Clock },
  error:          { label: 'Error',            color: '#EF4444', icon: XCircle    },
  partial:        { label: 'Parcial',          color: '#F59E0B', icon: AlertCircle },
};

const AUTH_META: Record<AuthType, { label: string; color: string }> = {
  'api-key': { label: 'API Key',  color: '#6366F1' },
  oauth2:    { label: 'OAuth 2.0', color: '#3B82F6' },
  bearer:    { label: 'Bearer',   color: '#8B5CF6' },
  webhook:   { label: 'Webhook',  color: '#F59E0B' },
  none:      { label: 'Sin auth', color: '#9CA3AF' },
};

const APIS: APIEntry[] = [
  // ── Backend
  { id: 'supabase',     name: 'Supabase',           logo: '🗄️',  category: 'backend',    status: 'connected',       authType: 'api-key', baseUrl: 'https://supabase.co/rest/v1',        docsUrl: 'https://supabase.com/docs',              description: 'Base de datos PostgreSQL + Auth + Storage + Edge Functions', envKey: 'SUPABASE_URL', flag: '🌎', latency: 42 },
  // ── Pagos
  { id: 'plexo',        name: 'Plexo UV',            logo: '💳',  category: 'pagos',      status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.plexo.com.uy',           docsUrl: 'https://docs.plexo.com.uy',              description: 'Procesamiento de tarjetas para Uruguay — Visa, Master, OCA, Creditel', envKey: 'PLEXO_API_KEY', flag: '🇺🇾', sandbox: true },
  { id: 'mercadopago',  name: 'MercadoPago',          logo: '💰',  category: 'pagos',      status: 'not-configured',  authType: 'bearer',  baseUrl: 'https://api.mercadopago.com',        docsUrl: 'https://www.mercadopago.com.ar/developers/es/docs', description: 'Pasarela de pagos líder en Latinoamérica', envKey: 'MP_ACCESS_TOKEN', flag: '🌎 Latam', sandbox: true },
  { id: 'paypal',       name: 'PayPal',               logo: '🅿️',  category: 'pagos',      status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://api-m.paypal.com',           docsUrl: 'https://developer.paypal.com',           description: 'Pagos internacionales con tarjetas y cuenta PayPal', envKey: 'PAYPAL_CLIENT_ID', flag: '🌎 Global', sandbox: true },
  { id: 'stripe',       name: 'Stripe',               logo: '💠',  category: 'pagos',      status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.stripe.com/v1',          docsUrl: 'https://stripe.com/docs',                description: 'Procesamiento de tarjetas internacional — Visa/Mastercard', envKey: 'STRIPE_SECRET_KEY', flag: '🌎 Global', sandbox: true },
  // ── Tiendas
  { id: 'mercadolibre', name: 'MercadoLibre',         logo: '🛒',  category: 'tiendas',    status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://api.mercadolibre.com',       docsUrl: 'https://developers.mercadolibre.com.ar', description: 'Sincronización de productos, stock y órdenes con MercadoLibre', envKey: 'ML_CLIENT_ID', flag: '🌎 Latam' },
  { id: 'tiendanube',   name: 'TiendaNube',           logo: '☁️',  category: 'tiendas',    status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://api.tiendanube.com/v1',      docsUrl: 'https://tiendanube.github.io/api-documentation', description: 'Sincronización con tiendas TiendaNube', envKey: 'TN_CLIENT_ID', flag: '🌎 Latam' },
  { id: 'woocommerce',  name: 'WooCommerce',          logo: '🛍️',  category: 'tiendas',    status: 'not-configured',  authType: 'api-key', baseUrl: '',                                   docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs', description: 'REST API de WooCommerce (Consumer Key + Secret)', envKey: 'WC_CONSUMER_KEY', flag: '🌎 Global' },
  { id: 'shopify',      name: 'Shopify',              logo: '🏪',  category: 'tiendas',    status: 'not-configured',  authType: 'api-key', baseUrl: '',                                   docsUrl: 'https://shopify.dev/api',                description: 'API de Shopify Admin para tiendas', envKey: 'SHOPIFY_API_KEY', flag: '🌎 Global' },
  // ── Logística
  { id: 'correo-uy',    name: 'Correo Uruguayo',      logo: '📬',  category: 'logistica',  status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.correo.com.uy',          docsUrl: 'https://correo.com.uy/empresas',         description: 'Envíos y cotizaciones del Correo Uruguayo', envKey: 'CORREO_UY_KEY', flag: '🇺🇾' },
  { id: 'brixo',        name: 'Brixo',                logo: '🚚',  category: 'logistica',  status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.brixo.com.uy',           docsUrl: 'https://brixo.com.uy',                   description: 'Último kilómetro en Uruguay', envKey: 'BRIXO_API_KEY', flag: '🇺🇾' },
  { id: 'fedex',        name: 'FedEx',                logo: '📫',  category: 'logistica',  status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://apis.fedex.com',             docsUrl: 'https://developer.fedex.com',            description: 'Envíos internacionales FedEx', envKey: 'FEDEX_CLIENT_ID', flag: '🌎 Global' },
  // ── Mensajería
  { id: 'twilio',       name: 'Twilio',               logo: '📱',  category: 'mensajeria', status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.twilio.com/2010-04-01',  docsUrl: 'https://www.twilio.com/docs',            description: 'SMS y WhatsApp Business — notificaciones automáticas', envKey: 'TWILIO_ACCOUNT_SID', flag: '🌎 Global' },
  { id: 'resend',       name: 'Resend',               logo: '✉️',  category: 'mensajeria', status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.resend.com',             docsUrl: 'https://resend.com/docs',                description: 'Emails transaccionales con alta entregabilidad', envKey: 'RESEND_API_KEY', flag: '🌎 Global' },
  { id: 'sendgrid',     name: 'SendGrid',             logo: '📧',  category: 'mensajeria', status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.sendgrid.com/v3',        docsUrl: 'https://docs.sendgrid.com',              description: 'Email marketing y transaccional — alta escala', envKey: 'SENDGRID_API_KEY', flag: '🌎 Global' },
  // ── RRSS
  { id: 'meta',         name: 'Meta Business Suite',  logo: '🔵',  category: 'rrss',       status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://graph.facebook.com/v19.0',  docsUrl: 'https://developers.facebook.com',        description: 'Instagram Shopping, WhatsApp Business, Facebook Shops', envKey: 'META_APP_ID', flag: '🌎 Global' },
  // ── IA
  { id: 'replicate',    name: 'Replicate AI',         logo: '🤖',  category: 'ia',         status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.replicate.com/v1',       docsUrl: 'https://replicate.com/docs',             description: 'Modelos IA generativos — procesamiento de imágenes', envKey: 'REPLICATE_API_TOKEN', flag: '🌎 Global' },
  { id: 'removebg',     name: 'Remove.bg',            logo: '✂️',  category: 'ia',         status: 'not-configured',  authType: 'api-key', baseUrl: 'https://api.remove.bg/v1.0',         docsUrl: 'https://www.remove.bg/api',              description: 'Eliminación automática de fondo en imágenes', envKey: 'REMOVEBG_API_KEY', flag: '🌎 Global' },
  // ── Marketing
  { id: 'google-analytics', name: 'Google Analytics 4', logo: '📊', category: 'marketing', status: 'not-configured', authType: 'oauth2',  baseUrl: 'https://analyticsdata.googleapis.com/v1beta', docsUrl: 'https://developers.google.com/analytics', description: 'Métricas de sitio web y comportamiento de usuarios', envKey: 'GA4_PROPERTY_ID', flag: '🌎 Global' },
  { id: 'google-ads',   name: 'Google Ads',           logo: '📢',  category: 'marketing',  status: 'not-configured',  authType: 'oauth2',  baseUrl: 'https://googleads.googleapis.com',   docsUrl: 'https://developers.google.com/google-ads', description: 'Gestión de campañas Google Ads', envKey: 'GOOGLE_ADS_CUSTOMER_ID', flag: '🌎 Global' },
  // ── Finanzas
  { id: 'fixer',        name: 'Fixer / ExchangeRate', logo: '💱',  category: 'finanzas',   status: 'not-configured',  authType: 'api-key', baseUrl: 'https://data.fixer.io/api',          docsUrl: 'https://fixer.io/documentation',         description: 'Tipos de cambio en tiempo real — soporte multi-moneda', envKey: 'FIXER_API_KEY', flag: '🌎 Global' },
  // ── Mapas
  { id: 'google-maps',  name: 'Google Maps',          logo: '🗺️',  category: 'mapas',      status: 'not-configured',  authType: 'api-key', baseUrl: 'https://maps.googleapis.com/maps/api', docsUrl: 'https://developers.google.com/maps',     description: 'Geocodificación, rutas y mapa interactivo para logística', envKey: 'GOOGLE_MAPS_API_KEY', flag: '🌎 Global' },
];

export function RepositorioAPIsView({ onNavigate }: Props) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<APIStatus | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => APIS.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) &&
        !a.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter !== 'all' && a.category !== catFilter) return false;
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    return true;
  }), [search, catFilter, statusFilter]);

  const stats = {
    total: APIS.length,
    connected: APIS.filter(a => a.status === 'connected').length,
    categories: Object.keys(CATEGORY_INFO).length,
    sandboxAvail: APIS.filter(a => a.sandbox).length,
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado al portapapeles'));
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Globe}
        title="Repositorio de APIs"
        subtitle="Catálogo centralizado de todas las integraciones disponibles en el sistema"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: '#F8F9FA' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'APIs registradas',  value: stats.total,       icon: Database, color: '#FF6835' },
            { label: 'Conectadas',         value: stats.connected,   icon: CheckCircle2, color: '#059669' },
            { label: 'Categorías',         value: stats.categories,  icon: Globe,  color: '#3B82F6' },
            { label: 'Con sandbox',        value: stats.sandboxAvail, icon: Shield, color: '#8B5CF6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ backgroundColor: '#fff', borderRadius: 12, padding: '16px 20px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar API..."
              style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.82rem', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
            />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value as any)}
            style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.82rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
            <option value="all">Todas las categorías</option>
            {Object.entries(CATEGORY_INFO).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: '0.82rem', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
            <option value="all">Todos los estados</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', flexShrink: 0 }}>{filtered.length} resultados</span>
        </div>

        {/* API List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(api => {
            const cat   = CATEGORY_INFO[api.category];
            const sm    = STATUS_META[api.status];
            const auth  = AUTH_META[api.authType];
            const isExp = expandedId === api.id;
            const StatusIcon = sm.icon;

            return (
              <div key={api.id} style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', transition: 'box-shadow 0.15s' }}>
                {/* Main row */}
                <button
                  onClick={() => setExpandedId(isExp ? null : api.id)}
                  style={{ width: '100%', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  {/* Logo + name */}
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                    {api.logo}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#111827' }}>{api.name}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 7px', borderRadius: 20, backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
                      {api.sandbox && (
                        <span style={{ fontSize: '0.6rem', fontWeight: '700', padding: '2px 6px', borderRadius: 20, backgroundColor: '#F0FDF8', color: '#059669', border: '1px solid #A7F3D0' }}>SANDBOX</span>
                      )}
                      <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{api.flag}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{api.description}</p>
                  </div>

                  {/* Auth badge */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, backgroundColor: `${auth.color}12`, border: `1px solid ${auth.color}30` }}>
                      <Key size={11} color={auth.color} />
                      <span style={{ fontSize: '0.68rem', fontWeight: '700', color: auth.color }}>{auth.label}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, minWidth: 120, justifyContent: 'flex-end' }}>
                    <StatusIcon size={14} color={sm.color} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: sm.color }}>{sm.label}</span>
                    {api.latency && <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>{api.latency}ms</span>}
                    {isExp ? <ChevronDown size={14} color="#9CA3AF" /> : <ChevronRight size={14} color="#9CA3AF" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExp && (
                  <div style={{ borderTop: '1px solid #F3F4F6', padding: '16px 18px', backgroundColor: '#FAFAFA' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 14 }}>
                      {/* Base URL */}
                      {api.baseUrl && (
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Base URL</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: '0.72rem', color: '#3B82F6', flex: 1, wordBreak: 'break-all' }}>{api.baseUrl}</code>
                            <button onClick={() => copyToClipboard(api.baseUrl)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                              <Copy size={12} color="#9CA3AF" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Env variable */}
                      {api.envKey && (
                        <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Variable de entorno</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ fontSize: '0.72rem', color: '#8B5CF6', flex: 1 }}>{api.envKey}=<span style={{ color: '#9CA3AF' }}>••••••••</span></code>
                            <button onClick={() => copyToClipboard(api.envKey!)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                              <Copy size={12} color="#9CA3AF" />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Status detail */}
                      <div style={{ backgroundColor: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #E5E7EB' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 4 }}>Estado actual</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusIcon size={14} color={sm.color} />
                          <span style={{ fontSize: '0.78rem', fontWeight: '600', color: sm.color }}>{sm.label}</span>
                          {api.status === 'not-configured' && (
                            <span style={{ fontSize: '0.68rem', color: '#6B7280' }}>→ Configurar en Supabase secrets</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a href={api.docsUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', fontSize: '0.75rem', fontWeight: '600', color: '#374151', textDecoration: 'none', cursor: 'pointer' }}>
                        <ExternalLink size={12} /> Documentación oficial
                      </a>
                      <button
                        onClick={() => toast.info(`Test de conexión para ${api.name} — pendiente de implementar`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', fontSize: '0.75rem', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                        <Activity size={12} /> Test de conexión
                      </button>
                      <button
                        onClick={() => toast.info(`Abrí Supabase → Settings → Secrets y configurá ${api.envKey ?? 'las variables requeridas'}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #FF6835', backgroundColor: '#FFF4F0', fontSize: '0.75rem', fontWeight: '600', color: '#FF6835', cursor: 'pointer' }}>
                        <Key size={12} /> Configurar secret
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
              <Globe size={40} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: 0, fontWeight: '600' }}>No se encontraron APIs</p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 24, padding: '14px 18px', backgroundColor: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <RefreshCw size={14} color="#0EA5E9" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#0369A1', lineHeight: 1.6 }}>
              <strong>Para conectar una API</strong>: configurá la variable de entorno en <strong>Supabase → Project Settings → Edge Functions → Secrets</strong>, luego implementá la lógica en el servidor Hono correspondiente bajo <code style={{ backgroundColor: '#E0F2FE', padding: '1px 4px', borderRadius: 3 }}>/supabase/functions/server/</code>. Las variables <code style={{ backgroundColor: '#E0F2FE', padding: '1px 4px', borderRadius: 3 }}>SUPABASE_URL</code>, <code style={{ backgroundColor: '#E0F2FE', padding: '1px 4px', borderRadius: 3 }}>SUPABASE_ANON_KEY</code> y <code style={{ backgroundColor: '#E0F2FE', padding: '1px 4px', borderRadius: 3 }}>SUPABASE_SERVICE_ROLE_KEY</code> ya están configuradas.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}