/**
 * 🏪 Integraciones Tiendas
 * Marketplaces y plataformas de eCommerce — sincronización de catálogo
 */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import { ExternalLink, Settings2, CheckCircle2, AlertCircle, Clock, Zap, RefreshCw, Package } from 'lucide-react';
import { Store } from 'lucide-react';

interface Props { onNavigate: (section: MainSection) => void; }
const ORANGE = '#FF6835';
type Status = 'connected' | 'sandbox' | 'pending' | 'coming-soon';

interface Platform {
  id: string; emoji: string; name: string;
  description: string; countries: string[];
  status: Status; syncFeatures: string[];
  badge?: string; recommended?: boolean;
  docsUrl?: string; category: 'marketplace' | 'platform';
}

const PLATFORMS: Platform[] = [
  // Marketplaces
  {
    id: 'ml', emoji: '🛒', name: 'Mercado Libre',
    description: 'El marketplace más grande de Latam. Sincronización de productos, stock e inventario en tiempo real.',
    countries: ['🇺🇾', '🇦🇷', '🇧🇷', '🌎'], status: 'pending',
    syncFeatures: ['Productos', 'Stock', 'Pedidos', 'Precios'], recommended: true,
    category: 'marketplace', docsUrl: 'https://developers.mercadolibre.com',
    badge: 'API oficial',
  },
  {
    id: 'tiendanube', emoji: '☁️', name: 'TiendaNube',
    description: 'Plataforma de eCommerce líder en Uruguay y Latam. Webhooks en tiempo real.',
    countries: ['🇺🇾', '🇦🇷'], status: 'pending',
    syncFeatures: ['Productos', 'Stock', 'Pedidos', 'Clientes'],
    category: 'platform', docsUrl: 'https://tiendanube.com/api-developers',
    badge: 'UY + AR',
  },
  // Platforms
  {
    id: 'woocommerce', emoji: '🟣', name: 'WooCommerce',
    description: 'Plugin de WordPress más usado a nivel global. API REST estable con autenticación OAuth.',
    countries: ['🌎'], status: 'pending',
    syncFeatures: ['Productos', 'Stock', 'Pedidos', 'Categorías'],
    category: 'platform', docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs',
  },
  {
    id: 'shopify', emoji: '🟢', name: 'Shopify',
    description: 'Plataforma de eCommerce global. GraphQL + REST API, webhooks y muy bien documentada.',
    countries: ['🌎'], status: 'pending',
    syncFeatures: ['Productos', 'Variantes', 'Stock', 'Pedidos'],
    category: 'platform', docsUrl: 'https://shopify.dev/docs/api',
  },
  {
    id: 'vtex', emoji: '🔵', name: 'VTEX',
    description: 'Plataforma enterprise para grandes retailers en Latam. API REST de alto rendimiento.',
    countries: ['🇺🇾', '🇦🇷', '🇧🇷', '🌎'], status: 'coming-soon',
    syncFeatures: ['Catálogo', 'SKUs', 'Inventario', 'Pedidos'],
    category: 'platform', docsUrl: 'https://developers.vtex.com',
    badge: 'Enterprise',
  },
  {
    id: 'magento', emoji: '🟠', name: 'Magento / Adobe Commerce',
    description: 'Plataforma open-source para grandes catálogos. API REST y GraphQL disponibles.',
    countries: ['🌎'], status: 'coming-soon',
    syncFeatures: ['Productos', 'Categorías', 'Stock', 'Órdenes'],
    category: 'platform', docsUrl: 'https://developer.adobe.com/commerce',
  },
  {
    id: 'prestashop', emoji: '🟡', name: 'PrestaShop',
    description: 'Plataforma open-source popular en Europa y Latam. API REST con módulos de sincronización.',
    countries: ['🌎'], status: 'coming-soon',
    syncFeatures: ['Productos', 'Stock', 'Pedidos'],
    category: 'platform', docsUrl: 'https://devdocs.prestashop-project.org',
  },
];

const STATUS_META: Record<Status, { label: string; color: string; bg: string; Icon: any }> = {
  connected:     { label: 'Conectada',   color: '#10B981', bg: '#D1FAE5', Icon: CheckCircle2 },
  sandbox:       { label: 'Sandbox',     color: '#F59E0B', bg: '#FEF3C7', Icon: AlertCircle  },
  pending:       { label: 'Sin conectar',color: '#9CA3AF', bg: '#F3F4F6', Icon: Clock        },
  'coming-soon': { label: 'Próximamente',color: '#3B82F6', bg: '#DBEAFE', Icon: Zap          },
};

type CatFilter = 'all' | 'marketplace' | 'platform';

export function IntegracionesTiendasView({ onNavigate }: Props) {
  const [catFilter, setCatFilter]   = useState<CatFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = PLATFORMS.filter(p => catFilter === 'all' || p.category === catFilter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Store}
        title="Tiendas"
        subtitle="Sincronizá tu catálogo con marketplaces y plataformas de eCommerce"
        actions={[{ label: '← Integraciones', onClick: () => onNavigate('integraciones') }]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', backgroundColor: '#F8F9FA' }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Plataformas',     value: PLATFORMS.length,                                         color: '#111827' },
            { label: 'Marketplaces',    value: PLATFORMS.filter(p => p.category === 'marketplace').length, color: '#3B82F6' },
            { label: 'Plataformas CMS', value: PLATFORMS.filter(p => p.category === 'platform').length,    color: '#8B5CF6' },
            { label: 'Conectadas',      value: PLATFORMS.filter(p => p.status === 'connected').length,     color: '#10B981' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: '12px 16px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sync info callout */}
        <div style={{ marginBottom: 20, padding: '12px 18px', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <RefreshCw size={18} color="#3B82F6" style={{ flexShrink: 0 }} />
          <div>
            <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1D4ED8' }}>Sincronización bidireccional</span>
            <span style={{ fontSize: '0.8rem', color: '#1E40AF', marginLeft: 8 }}>
              Catálogo, stock y pedidos se sincronizan automáticamente entre Charlie y cada plataforma conectada.
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {([
            { id: 'all', label: 'Todos' },
            { id: 'marketplace', label: '🛒 Marketplaces' },
            { id: 'platform', label: '🏗️ Plataformas CMS' },
          ] as { id: CatFilter; label: string }[]).map(f => (
            <button key={f.id} onClick={() => setCatFilter(f.id)}
              style={{ padding: '5px 14px', borderRadius: 20, border: `1.5px solid ${catFilter === f.id ? '#3B82F6' : '#E5E7EB'}`, cursor: 'pointer', backgroundColor: catFilter === f.id ? '#3B82F6' : '#fff', color: catFilter === f.id ? '#fff' : '#374151', fontSize: '0.78rem', fontWeight: '600' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map(p => {
            const sm = STATUS_META[p.status];
            const SIcon = sm.Icon;
            const isExp = expandedId === p.id;
            return (
              <div key={p.id} style={{
                backgroundColor: '#fff', borderRadius: 14,
                border: p.recommended ? `1.5px solid ${ORANGE}` : '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: p.recommended ? `0 0 0 4px ${ORANGE}12` : 'none',
              }}>
                <div style={{ height: 3, backgroundColor: '#3B82F6' }} />
                <div style={{ padding: '16px 18px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                      {p.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: '800', color: '#111827', fontSize: '0.95rem' }}>{p.name}</span>
                        {p.recommended && <span style={{ padding: '2px 7px', backgroundColor: `${ORANGE}18`, color: ORANGE, borderRadius: 4, fontSize: '0.62rem', fontWeight: '700' }}>⭐ Recomendado</span>}
                        {p.badge && !p.recommended && <span style={{ padding: '2px 7px', backgroundColor: '#EFF6FF', color: '#3B82F6', borderRadius: 4, fontSize: '0.62rem', fontWeight: '700' }}>{p.badge}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.countries.map((c, i) => <span key={i} style={{ fontSize: '0.75rem' }}>{c}</span>)}
                        <span style={{ padding: '1px 6px', borderRadius: 4, fontSize: '0.62rem', fontWeight: '600', backgroundColor: p.category === 'marketplace' ? '#DBEAFE' : '#EDE9FE', color: p.category === 'marketplace' ? '#1D4ED8' : '#6D28D9' }}>
                          {p.category === 'marketplace' ? 'Marketplace' : 'CMS'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 10px', fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{p.description}</p>

                  {/* Sync features */}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {p.syncFeatures.map(f => (
                      <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 8px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: 4, fontSize: '0.68rem', fontWeight: '600' }}>
                        <Package size={9} />{f}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 9px', backgroundColor: sm.bg, color: sm.color, borderRadius: 20, fontSize: '0.7rem', fontWeight: '700' }}>
                      <SIcon size={11} /> {sm.label}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {p.docsUrl && (
                        <a href={p.docsUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 7, border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#374151', fontSize: '0.72rem', fontWeight: '600', textDecoration: 'none' }}>
                          <ExternalLink size={11} /> Docs
                        </a>
                      )}
                      {p.status !== 'coming-soon' && (
                        <button onClick={() => setExpandedId(isExp ? null : p.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 12px', borderRadius: 7, border: 'none', backgroundColor: '#3B82F6', color: '#fff', fontSize: '0.72rem', fontWeight: '700', cursor: 'pointer' }}>
                          <Settings2 size={11} /> Conectar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Config */}
                  {isExp && (
                    <div style={{ marginTop: 14, padding: '14px', backgroundColor: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
                      <p style={{ margin: '0 0 10px', fontSize: '0.72rem', fontWeight: '700', color: '#374151' }}>Configuración — {p.name}</p>
                      {['URL de la tienda', 'Consumer Key / API Key', 'Consumer Secret / Token'].map((field, i) => (
                        <div key={i} style={{ marginBottom: 8 }}>
                          <label style={{ fontSize: '0.68rem', fontWeight: '700', color: '#9CA3AF', display: 'block', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field}</label>
                          <input type={i > 0 ? 'password' : 'text'} placeholder={field}
                            style={{ width: '100%', padding: '7px 10px', border: '1.5px solid #E5E7EB', borderRadius: 7, fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', backgroundColor: '#fff' }}
                            onFocus={e => (e.target.style.borderColor = '#3B82F6')}
                            onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
                          />
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button style={{ flex: 1, padding: '8px', backgroundColor: '#3B82F6', color: '#fff', border: 'none', borderRadius: 7, fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                          Guardar y sincronizar
                        </button>
                        <button onClick={() => setExpandedId(null)}
                          style={{ padding: '8px 12px', backgroundColor: '#fff', color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 7, fontSize: '0.78rem', cursor: 'pointer' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}