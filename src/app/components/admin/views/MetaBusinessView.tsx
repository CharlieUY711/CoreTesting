/* =====================================================
   MetaBusinessView — Meta Business / RRSS Shop
   Facebook · Instagram · Ads · Píxel · Catálogo
   ===================================================== */
import React, { useState } from 'react';
import {
  Store, TrendingUp, Users, ShoppingBag, Eye, Heart,
  RefreshCw, CheckCircle, AlertCircle, Clock, Settings,
  ExternalLink, BarChart2, Target, Zap, Package,
  Facebook, Instagram, ArrowUp, ArrowDown, Circle,
} from 'lucide-react';
import type { MainSection } from '../../../AdminDashboard';
import { OrangeHeader } from '../OrangeHeader';
import { RRSSBanner }   from '../RRSSBanner';

interface Props { onNavigate: (s: MainSection) => void; }

const ORANGE = '#FF6835';
const META_BLUE = '#1877F2';
const IG_PINK = '#E1306C';

type Tab = 'overview' | 'catalogo' | 'campanas' | 'pixel' | 'shop';

interface Product {
  id: string; name: string; sku: string; price: number;
  stock: number; imgUrl: string; syncStatus: 'synced' | 'pending' | 'error';
  platforms: ('facebook' | 'instagram')[];
}

interface Campaign {
  id: string; name: string; status: 'active' | 'paused' | 'ended';
  budget: number; spent: number; reach: number; clicks: number; conversions: number;
  platform: 'facebook' | 'instagram' | 'both';
}

const PRODUCTS: Product[] = [
  { id: '1', name: 'Zapatillas Running X200', sku: 'ZAP-001', price: 18990, stock: 43, imgUrl: '', syncStatus: 'synced',  platforms: ['facebook', 'instagram'] },
  { id: '2', name: 'Mochila Urbana Pro',      sku: 'MOC-034', price: 12500, stock: 18, imgUrl: '', syncStatus: 'synced',  platforms: ['facebook'] },
  { id: '3', name: 'Auriculares BT MAX',      sku: 'AUR-007', price: 25000, stock: 0,  imgUrl: '', syncStatus: 'error',   platforms: ['instagram'] },
  { id: '4', name: 'Camiseta Dry Fit',        sku: 'REM-092', price: 4500,  stock: 120,imgUrl: '', syncStatus: 'synced',  platforms: ['facebook', 'instagram'] },
  { id: '5', name: 'Suplemento Proteína 2kg', sku: 'SUP-015', price: 8900,  stock: 32, imgUrl: '', syncStatus: 'pending', platforms: [] },
  { id: '6', name: 'Shorts Running',          sku: 'SHO-028', price: 3200,  stock: 67, imgUrl: '', syncStatus: 'synced',  platforms: ['facebook'] },
];

const CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Verano 2026 — Zapatillas', status: 'active',  budget: 15000, spent: 9870,  reach: 84200,  clicks: 3420,  conversions: 128, platform: 'both' },
  { id: '2', name: 'Remarketing Carritos',      status: 'active',  budget: 5000,  spent: 2340,  reach: 12800,  clicks: 890,   conversions: 67,  platform: 'facebook' },
  { id: '3', name: 'Stories — Mochilas',        status: 'paused',  budget: 8000,  spent: 8000,  reach: 42100,  clicks: 1870,  conversions: 89,  platform: 'instagram' },
  { id: '4', name: 'Black Friday 2025',         status: 'ended',   budget: 30000, spent: 29870, reach: 210000, clicks: 18400, conversions: 892, platform: 'both' },
];

const PIXEL_EVENTS = [
  { name: 'PageView',         count: 18400, status: 'active', lastFired: 'hace 2 min' },
  { name: 'ViewContent',      count: 7820,  status: 'active', lastFired: 'hace 5 min' },
  { name: 'AddToCart',        count: 1240,  status: 'active', lastFired: 'hace 12 min' },
  { name: 'InitiateCheckout', count: 380,   status: 'active', lastFired: 'hace 1 h' },
  { name: 'Purchase',         count: 128,   status: 'active', lastFired: 'hace 3 h' },
  { name: 'Lead',             count: 0,     status: 'inactive', lastFired: '—' },
];

const STATUS_COLOR = { active: '#22C55E', paused: '#F59E0B', ended: '#9CA3AF', synced: '#22C55E', pending: '#F59E0B', error: '#EF4444', inactive: '#E5E7EB' } as const;
const STATUS_LABEL = { active: 'Activa', paused: 'Pausada', ended: 'Finalizada', synced: 'Sincronizado', pending: 'Pendiente', error: 'Error', inactive: 'Inactivo' } as const;

const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
const pesos = (n: number) => `$${n.toLocaleString('es-UY')}`;

export function MetaBusinessView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('overview');

  const TABS = [
    { id: 'overview',  label: '📊 Overview'  },
    { id: 'catalogo',  label: '📦 Catálogo'  },
    { id: 'campanas',  label: '🎯 Campañas'  },
    { id: 'pixel',     label: '🔵 Píxel'     },
    { id: 'shop',      label: '🛍 RRSS Shop' },
  ] as const;

  const StatCard = ({ icon: Icon, label, value, delta, color }: any) => (
    <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E5E7EB', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '9px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: '600' }}>{label}</span>
      </div>
      <p style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#111' }}>{value}</p>
      {delta && (
        <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: delta > 0 ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', gap: '3px' }}>
          {delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {Math.abs(delta)}% vs. mes anterior
        </p>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      <OrangeHeader
        icon={Store}
        title="Meta Business / RRSS Shop"
        subtitle="Facebook · Instagram · Ads · Píxel · Catálogo"
        actions={[{ label: '← Volver', onClick: () => onNavigate('rrss') }]}
      />

      <RRSSBanner onNavigate={onNavigate} active="meta-business" />

      {/* Top Bar — tabs */}
      <div style={{
        height: '56px', flexShrink: 0, backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex', alignItems: 'center', padding: '0 28px', gap: '14px',
      }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Facebook size={18} color={META_BLUE} />
          <Instagram size={18} color={IG_PINK} />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#111' }}>
          Meta Business / RRSS Shop
        </h1>
        <span style={{ fontSize: '0.7rem', backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '2px 8px', borderRadius: '20px', fontWeight: '700' }}>
          Meta API
        </span>
        <div style={{ flex: 1 }} />
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '5px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: '600',
            backgroundColor: tab === t.id ? META_BLUE : 'transparent',
            color: tab === t.id ? '#fff' : '#6B7280',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Stat row */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <StatCard icon={Users}      label="Seguidores totales"  value="34.2k"  delta={8.4}  color={META_BLUE} />
              <StatCard icon={Eye}        label="Alcance mensual"     value="210k"   delta={12.1} color={IG_PINK}   />
              <StatCard icon={Heart}      label="Engagement rate"     value="4.7%"   delta={1.2}  color="#F59E0B"   />
              <StatCard icon={ShoppingBag}label="Pedidos desde Shop"  value="892"    delta={-3.1} color="#22C55E"   />
              <StatCard icon={TrendingUp} label="ROAS promedio"       value="3.8x"   delta={5.2}  color={ORANGE}    />
            </div>

            {/* Platforms summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { name: 'Facebook Page', icon: Facebook, color: META_BLUE, followers: '18.4k', reach: '124k', posts: 48, status: 'Conectado' },
                { name: 'Instagram Business', icon: Instagram, color: IG_PINK, followers: '15.8k', reach: '86k', posts: 73, status: 'Conectado' },
              ].map(p => (
                <div key={p.name} style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <p.icon size={20} color={p.color} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', fontSize: '0.9rem', color: '#111' }}>{p.name}</p>
                      <span style={{ fontSize: '0.7rem', color: '#22C55E', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle size={10} /> {p.status}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    {[
                      { label: 'Seguidores', val: p.followers },
                      { label: 'Alcance',    val: p.reach    },
                      { label: 'Posts 30d',  val: String(p.posts) },
                    ].map(s => (
                      <div key={s.label}>
                        <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: '#111' }}>{s.val}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#9CA3AF' }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.88rem', fontWeight: '700', color: '#111' }}>Acciones rápidas</h3>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Sincronizar catálogo', icon: RefreshCw, action: () => setTab('catalogo') },
                  { label: 'Nueva campaña',         icon: Target,    action: () => setTab('campanas') },
                  { label: 'Ver eventos píxel',     icon: Zap,       action: () => setTab('pixel')    },
                  { label: 'Abrir Meta Business',   icon: ExternalLink, action: () => window.open('https://business.facebook.com', '_blank') },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 16px', borderRadius: '9px',
                    border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB',
                    fontSize: '0.8rem', fontWeight: '600', color: '#374151', cursor: 'pointer',
                  }}>
                    <a.icon size={14} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CATÁLOGO ── */}
        {tab === 'catalogo' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px', gap: '12px' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
                <b style={{ color: '#111' }}>{PRODUCTS.filter(p => p.syncStatus === 'synced').length}</b> de {PRODUCTS.length} productos sincronizados
              </p>
              <div style={{ flex: 1 }} />
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                backgroundColor: META_BLUE, color: '#fff',
                fontSize: '0.8rem', fontWeight: '700',
              }}>
                <RefreshCw size={13} /> Sincronizar todo
              </button>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Producto', 'SKU', 'Precio', 'Stock', 'Plataformas', 'Estado', 'Acción'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < PRODUCTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={15} color="#9CA3AF" />
                          </div>
                          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111' }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#6B7280' }}>{p.sku}</span></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111' }}>{pesos(p.price)}</span></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontSize: '0.82rem', color: p.stock === 0 ? '#EF4444' : '#374151', fontWeight: p.stock === 0 ? '700' : '400' }}>{p.stock === 0 ? 'Sin stock' : p.stock}</span></td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {p.platforms.includes('facebook')  && <Facebook size={14} color={META_BLUE} />}
                          {p.platforms.includes('instagram') && <Instagram size={14} color={IG_PINK}  />}
                          {p.platforms.length === 0 && <span style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>—</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px',
                          backgroundColor: `${STATUS_COLOR[p.syncStatus]}20`,
                          color: STATUS_COLOR[p.syncStatus],
                        }}>
                          {STATUS_LABEL[p.syncStatus]}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <button style={{ fontSize: '0.75rem', color: META_BLUE, background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                          {p.syncStatus === 'error' ? 'Reintentar' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CAMPAÑAS ── */}
        {tab === 'campanas' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6B7280' }}>
                  <b style={{ color: '#22C55E' }}>{CAMPAIGNS.filter(c => c.status === 'active').length}</b> campañas activas · Presupuesto total: <b style={{ color: '#111' }}>{pesos(CAMPAIGNS.reduce((a, c) => a + c.budget, 0))}</b>
                </p>
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                backgroundColor: META_BLUE, color: '#fff',
                fontSize: '0.8rem', fontWeight: '700',
              }}>
                <Target size={13} /> Nueva campaña
              </button>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Campaña', 'Plataforma', 'Estado', 'Presupuesto', 'Gastado', 'Alcance', 'Clicks', 'Conversiones', 'ROAS'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CAMPAIGNS.map((c, i) => {
                    const roas = c.spent > 0 ? ((c.conversions * 8000) / c.spent).toFixed(1) : '—';
                    return (
                      <tr key={c.id} style={{ borderBottom: i < CAMPAIGNS.length - 1 ? '1px solid #F3F4F6' : 'none', opacity: c.status === 'ended' ? 0.65 : 1 }}>
                        <td style={{ padding: '12px 12px' }}>
                          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '600', color: '#111' }}>{c.name}</p>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {(c.platform === 'facebook' || c.platform === 'both')  && <Facebook size={13} color={META_BLUE} />}
                            {(c.platform === 'instagram' || c.platform === 'both') && <Instagram size={13} color={IG_PINK} />}
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', backgroundColor: `${STATUS_COLOR[c.status]}20`, color: STATUS_COLOR[c.status] }}>
                            {STATUS_LABEL[c.status]}
                          </span>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: '0.8rem', color: '#374151' }}>{pesos(c.budget)}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#374151' }}>{pesos(c.spent)}</p>
                            <div style={{ height: '3px', backgroundColor: '#E5E7EB', borderRadius: '2px', marginTop: '3px', width: '80px' }}>
                              <div style={{ height: '100%', width: `${Math.min(100, (c.spent / c.budget) * 100)}%`, backgroundColor: META_BLUE, borderRadius: '2px' }} />
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 12px', fontSize: '0.8rem', color: '#374151' }}>{fmt(c.reach)}</td>
                        <td style={{ padding: '12px 12px', fontSize: '0.8rem', color: '#374151' }}>{fmt(c.clicks)}</td>
                        <td style={{ padding: '12px 12px', fontSize: '0.8rem', fontWeight: '700', color: '#111' }}>{c.conversions}</td>
                        <td style={{ padding: '12px 12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: c.status !== 'ended' ? '#22C55E' : '#9CA3AF' }}>{roas}x</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── PÍXEL ── */}
        {tab === 'pixel' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Pixel status card */}
            <div style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '20px', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={22} color={META_BLUE} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#111' }}>Meta Pixel ID: <span style={{ fontFamily: 'monospace', color: META_BLUE }}>1234567890123456</span></p>
                  <span style={{ fontSize: '0.75rem', color: '#22C55E', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={12} /> Activo · Última actividad hace 2 minutos
                  </span>
                </div>
                <div style={{ flex: 1 }} />
                <button style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB',
                  backgroundColor: '#F9FAFB', fontSize: '0.78rem', fontWeight: '600',
                  color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <ExternalLink size={12} /> Abrir Events Manager
                </button>
              </div>

              {/* Snippet */}
              <div style={{ marginTop: '16px', backgroundColor: '#0F172A', borderRadius: '10px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                <p style={{ margin: '0 0 6px', color: '#64748B' }}>{`<!-- Meta Pixel Code — instalar en <head> -->`}</p>
                <p style={{ margin: 0, color: '#7DD3FC' }}>{`!function(f,b,e,v,n,t,s){`}</p>
                <p style={{ margin: 0, color: '#86EFAC' }}>{`  f.fbq=function(){n?...};`}</p>
                <p style={{ margin: 0, color: '#7DD3FC' }}>{`  fbq('init', '1234567890123456');`}</p>
                <p style={{ margin: 0, color: '#7DD3FC' }}>{`  fbq('track', 'PageView');`}</p>
                <p style={{ margin: '4px 0 0', color: '#64748B' }}>{`<!-- End Meta Pixel Code -->`}</p>
              </div>
            </div>

            {/* Events table */}
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
                <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: '#111' }}>Eventos registrados</h3>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Evento', 'Estado', 'Disparos (30d)', 'Último disparo'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '0.72rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PIXEL_EVENTS.map((ev, i) => (
                    <tr key={ev.name} style={{ borderBottom: i < PIXEL_EVENTS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#111', fontFamily: 'monospace' }}>{ev.name}</span>
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '20px', backgroundColor: ev.status === 'active' ? '#DCFCE7' : '#F3F4F6', color: ev.status === 'active' ? '#166534' : '#6B7280' }}>
                          {ev.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: '0.82rem', fontWeight: '600', color: '#111' }}>{fmt(ev.count)}</td>
                      <td style={{ padding: '11px 16px', fontSize: '0.78rem', color: '#6B7280' }}>{ev.lastFired}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── SHOP ── */}
        {tab === 'shop' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { platform: 'Facebook Shop', icon: Facebook, color: META_BLUE, status: 'active', products: 5, orders: 312, revenue: 2840000, url: 'facebook.com/shop/tu-tienda' },
              { platform: 'Instagram Shopping', icon: Instagram, color: IG_PINK, status: 'active', products: 4, orders: 580, revenue: 1920000, url: 'instagram.com/tu-tienda' },
            ].map(shop => (
              <div key={shop.platform} style={{ backgroundColor: '#fff', borderRadius: '14px', padding: '22px', border: '1px solid #E5E7EB' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: `${shop.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <shop.icon size={22} color={shop.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: '700', fontSize: '0.92rem', color: '#111' }}>{shop.platform}</p>
                    <span style={{ fontSize: '0.72rem', color: '#22C55E', fontWeight: '700' }}>● Activo · {shop.url}</span>
                  </div>
                  <div style={{ flex: 1 }} />
                  <button style={{ padding: '7px 14px', borderRadius: '8px', border: '1.5px solid #E5E7EB', backgroundColor: '#F9FAFB', fontSize: '0.78rem', fontWeight: '600', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ExternalLink size={12} /> Ver tienda
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  {[
                    { label: 'Productos publicados', value: String(shop.products) },
                    { label: 'Órdenes totales',       value: String(shop.orders)  },
                    { label: 'Revenue generado',      value: pesos(shop.revenue)  },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111' }}>{s.value}</p>
                      <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: '#6B7280' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ backgroundColor: '#FFF7ED', borderRadius: '12px', padding: '16px 18px', border: '1.5px solid #FED7AA' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <AlertCircle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#92400E', lineHeight: '1.5' }}>
                  Para sincronizar en tiempo real configurá el <b>Meta Commerce Manager</b> y conectá el catálogo de productos mediante la <b>Catalog API</b> con el token de acceso de larga duración.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}