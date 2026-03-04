/* =====================================================
   MetaMapView — Panel admin de configuración MetaMap
   Charlie Marketplace Builder v1.5
   Sistema → Verificación de Edad (MetaMap)
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Shield, Copy, CheckCircle, ExternalLink, AlertTriangle,
  Globe, Webhook, Key, Activity, Clock, Eye, EyeOff,
  ChevronDown, ChevronRight, Zap, Lock, Users,
} from 'lucide-react';
import { toast } from 'sonner';

const ORANGE = '#FF6835';
interface Props { onNavigate: (s: MainSection) => void; }

import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

const WEBHOOK_URL = `https://${projectId}.supabase.co/functions/v1/api/age-verification/metamap-webhook`;

/* ── Data mock de verificaciones recientes ── */
const RECENT_VERIFICATIONS = [
  { id: 'mm-001', user: 'juan.garcia@email.com',  status: 'approved', method: 'DNI AR',    date: '21/02/2026 14:32', order: 'OM-2026-A4F9B1' },
  { id: 'mm-002', user: 'sofia.m@gmail.com',      status: 'approved', method: 'Cédula UY',  date: '21/02/2026 11:08', order: 'OM-2026-C2D8E7' },
  { id: 'mm-003', user: 'diego.r@yahoo.com',      status: 'rejected', method: 'Pasaporte',  date: '20/02/2026 18:55', order: 'OM-2026-F1B3C5' },
  { id: 'mm-004', user: 'ana.lopez@empresa.com',  status: 'approved', method: 'DNI AR',     date: '20/02/2026 16:22', order: 'OM-2026-E9A2D4' },
  { id: 'mm-005', user: 'carlos.v@mail.com',      status: 'pending',  method: 'RUT CL',     date: '20/02/2026 09:45', order: 'OM-2026-B7F4A1' },
];

const STATUS_CFG = {
  approved: { label: 'Aprobada',   color: '#10B981', bg: '#D1FAE5' },
  rejected: { label: 'Rechazada',  color: '#EF4444', bg: '#FEE2E2' },
  pending:  { label: 'Pendiente',  color: '#F59E0B', bg: '#FEF3C7' },
};

const COUNTRY_DOCS: { flag: string; country: string; docs: string[] }[] = [
  { flag: '🇺🇾', country: 'Uruguay',   docs: ['Cédula de Identidad', 'Pasaporte', 'Licencia de Conducir'] },
  { flag: '🇲🇽', country: 'México',    docs: ['INE (Credencial para Votar)', 'Pasaporte', 'Licencia de Conducir'] },
  { flag: '🇨🇱', country: 'Chile',     docs: ['Cédula de Identidad (RUT)', 'Pasaporte', 'Licencia de Conducir'] },
  { flag: '🇧🇷', country: 'Brasil',    docs: ['RG (Registro Geral)', 'CPF (con foto)', 'CNH', 'Pasaporte'] },
  { flag: '🇨🇴', country: 'Colombia',  docs: ['Cédula de Ciudadanía', 'Pasaporte', 'Licencia de Conducir'] },
];

export function MetaMapView({ onNavigate: _ }: Props) {
  const [showSecret,    setShowSecret]    = useState(false);
  const [clientId,      setClientId]      = useState('');
  const [clientSecret,  setClientSecret]  = useState('');
  const [flowId,        setFlowId]        = useState('');
  const [testMode,      setTestMode]      = useState(true);
  const [docsOpen,      setDocsOpen]      = useState(false);
  const [saved,         setSaved]         = useState(false);

  const isConfigured = clientId.length > 8 && flowId.length > 8;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado al portapapeles`));
  };

  const handleSave = () => {
    if (!clientId || !flowId) { toast.error('Client ID y Flow ID son obligatorios'); return; }
    setSaved(true);
    toast.success('Configuración de MetaMap guardada', { description: 'Recuerda configurar las mismas variables en Supabase Edge Functions.' });
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      <OrangeHeader
        icon={Shield}
        title="MetaMap — Verificación de Identidad"
        subtitle="KYC · Verificación de edad · Documentos + Selfie + Liveness"
        actions={[
          {
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><ExternalLink size={12} /> Dashboard MetaMap</span>,
            onClick: () => window.open('https://dashboard.metamap.com/', '_blank'),
          },
          {
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={12} /> Guardar config.</span>,
            primary: true,
            onClick: handleSave,
          },
        ]}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

        {/* ── Banner de estado ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '16px 20px', borderRadius: '12px', marginBottom: '24px',
          backgroundColor: isConfigured ? '#F0FDF4' : '#FFF7ED',
          border: `1.5px solid ${isConfigured ? '#D1FAE5' : '#FED7AA'}`,
        }}>
          {isConfigured
            ? <CheckCircle size={20} color='#10B981' />
            : <AlertTriangle size={20} color='#F59E0B' />
          }
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: isConfigured ? '#059669' : '#92400E' }}>
              {isConfigured ? 'MetaMap configurado y listo' : 'Configuración pendiente'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: isConfigured ? '#6EE7B7' : '#D97706' }}>
              {isConfigured
                ? `Modo: ${testMode ? 'Sandbox (pruebas)' : 'Producción'} · Flow ID configurado`
                : 'Completá el Client ID y Flow ID para activar la verificación de identidad'
              }
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: testMode ? '#F59E0B' : '#10B981', backgroundColor: testMode ? '#FEF3C7' : '#D1FAE5', padding: '3px 10px', borderRadius: '6px' }}>
              {testMode ? '🧪 Sandbox' : '🚀 Producción'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* ── Credenciales ── */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '9px', backgroundColor: `${ORANGE}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Key size={16} color={ORANGE} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#111827' }}>Credenciales API</h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#9CA3AF' }}>Obtenelas en MetaMap → Settings → API Keys</p>
              </div>
            </div>

            {/* Modo */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
              {[{ id: true, label: '🧪 Sandbox (test)' }, { id: false, label: '🚀 Producción' }].map(m => (
                <button
                  key={String(m.id)}
                  onClick={() => setTestMode(m.id)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: '8px',
                    border: `1.5px solid ${testMode === m.id ? ORANGE : '#E5E7EB'}`,
                    backgroundColor: testMode === m.id ? `${ORANGE}10` : '#F9FAFB',
                    color: testMode === m.id ? ORANGE : '#6B7280',
                    fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Client ID */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Client ID <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontWeight: '400', color: '#9CA3AF', marginLeft: '6px' }}>(público — frontend)</span>
                </label>
                <input
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  placeholder="mati_abc123xyz..."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #E5E7EB', fontSize: '0.82rem', fontFamily: 'monospace', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Client Secret */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Client Secret
                  <span style={{ fontWeight: '400', color: '#9CA3AF', marginLeft: '6px' }}>(privado — solo Supabase env)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={clientSecret}
                    onChange={e => setClientSecret(e.target.value)}
                    type={showSecret ? 'text' : 'password'}
                    placeholder="sk_live_abc123xyz..."
                    style={{ width: '100%', padding: '10px 36px 10px 12px', borderRadius: '9px', border: '1.5px solid #E5E7EB', fontSize: '0.82rem', fontFamily: 'monospace', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                    onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'}
                  />
                  <button onClick={() => setShowSecret(!showSecret)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showSecret ? <EyeOff size={15} color='#9CA3AF' /> : <Eye size={15} color='#9CA3AF' />}
                  </button>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.68rem', color: '#9CA3AF' }}>
                  ⚠️ Nunca expongas este valor en el frontend
                </p>
              </div>

              {/* Flow ID */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#374151', marginBottom: '6px' }}>
                  Flow ID <span style={{ color: '#EF4444' }}>*</span>
                  <span style={{ fontWeight: '400', color: '#9CA3AF', marginLeft: '6px' }}>(público)</span>
                </label>
                <input
                  value={flowId}
                  onChange={e => setFlowId(e.target.value)}
                  placeholder="6419e3b2b0c5340011234567"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '9px', border: '1.5px solid #E5E7EB', fontSize: '0.82rem', fontFamily: 'monospace', backgroundColor: '#F9FAFB', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = ORANGE}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = '#E5E7EB'}
                />
              </div>
            </div>

            <div style={{ marginTop: '18px', padding: '12px 14px', backgroundColor: '#F8F9FA', borderRadius: '9px', border: '1px solid #E5E7EB' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Env vars requeridas en Supabase
              </p>
              {['METAMAP_CLIENT_ID', 'METAMAP_CLIENT_SECRET', 'METAMAP_FLOW_ID', 'METAMAP_WEBHOOK_SECRET'].map(v => (
                <div key={v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <code style={{ fontSize: '0.72rem', color: '#374151', fontFamily: 'monospace' }}>{v}</code>
                  <button onClick={() => copyToClipboard(v, v)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', color: '#9CA3AF' }}>
                    <Copy size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Webhook ── */}
          <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '9px', backgroundColor: '#3B82F615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Webhook size={16} color='#3B82F6' />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#111827' }}>Webhook URL</h3>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#9CA3AF' }}>MetaMap → Settings → Webhooks → Add Webhook</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#F3F4F6', borderRadius: '9px', padding: '12px 14px', marginBottom: '16px', position: 'relative' }}>
              <code style={{ fontSize: '0.7rem', color: '#374151', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.5 }}>
                {WEBHOOK_URL}
              </code>
              <button
                onClick={() => copyToClipboard(WEBHOOK_URL, 'Webhook URL')}
                style={{ position: 'absolute', top: '8px', right: '8px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: '#6B7280' }}
              >
                <Copy size={10} /> Copiar
              </button>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '0.78rem', fontWeight: '700', color: '#374151' }}>Eventos a suscribir:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {['verification.completed', 'verification.updated', 'verification.approved', 'verification.rejected'].map(ev => (
                  <div key={ev} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <CheckCircle size={12} color='#10B981' />
                    <code style={{ fontSize: '0.74rem', color: '#374151', fontFamily: 'monospace' }}>{ev}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: 'auto' }}>
              {[
                { icon: Activity, label: 'Verificaciones',  value: '5',    color: ORANGE    },
                { icon: CheckCircle, label: 'Aprobadas',    value: '3',    color: '#10B981' },
                { icon: Clock, label: 'Tasa aprobación',    value: '80%',  color: '#3B82F6' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px', backgroundColor: '#F9FAFB', borderRadius: '9px' }}>
                  <s.icon size={16} color={s.color} style={{ marginBottom: '6px' }} />
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{s.value}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.65rem', color: '#9CA3AF' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Verificaciones recientes ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px 24px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.92rem', fontWeight: '800', color: '#111827' }}>
            Verificaciones recientes <span style={{ fontSize: '0.72rem', fontWeight: '400', color: '#9CA3AF' }}>(últimas 5 · datos de ejemplo)</span>
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  {['ID', 'Usuario', 'Documento', 'Estado', 'Pedido', 'Fecha'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_VERIFICATIONS.map(v => {
                  const s = STATUS_CFG[v.status as keyof typeof STATUS_CFG];
                  return (
                    <tr key={v.id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '10px 12px' }}><code style={{ fontSize: '0.72rem', color: '#6B7280' }}>{v.id}</code></td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{v.user}</td>
                      <td style={{ padding: '10px 12px', color: '#374151' }}>{v.method}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: s.color, backgroundColor: s.bg, padding: '3px 9px', borderRadius: '6px' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}><code style={{ fontSize: '0.72rem', color: ORANGE }}>{v.order}</code></td>
                      <td style={{ padding: '10px 12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>{v.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Documentos por país ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '20px' }}>
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left' }}
          >
            <Globe size={16} color={ORANGE} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#111827', flex: 1 }}>
              Documentos soportados por país
            </p>
            {docsOpen ? <ChevronDown size={16} color='#9CA3AF' /> : <ChevronRight size={16} color='#9CA3AF' />}
          </button>
          {docsOpen && (
            <div style={{ padding: '0 22px 22px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {COUNTRY_DOCS.map(c => (
                <div key={c.country} style={{ padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '0.88rem', fontWeight: '700', color: '#111827' }}>{c.flag} {c.country}</p>
                  {c.docs.map(d => (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle size={11} color='#10B981' />
                      <span style={{ fontSize: '0.74rem', color: '#6B7280' }}>{d}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pricing ── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '22px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '800', color: '#111827' }}>Planes de MetaMap</h3>
            <a href="https://metamap.com/pricing" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: ORANGE, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              Ver precios actuales <ExternalLink size={11} />
            </a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {[
              { plan: 'Free',       price: '$0',      verifs: '100/mes',     extra: '—',           highlight: false },
              { plan: 'Starter',    price: '$299/mes', verifs: '500 incl.',  extra: '$0.50 c/u',   highlight: false },
              { plan: 'Growth',     price: '$999/mes', verifs: '2.500 incl.',extra: '$0.30 c/u',   highlight: true  },
              { plan: 'Enterprise', price: 'Custom',  verifs: 'Alto volumen',extra: 'Negociable',  highlight: false },
            ].map(p => (
              <div key={p.plan} style={{ padding: '16px', borderRadius: '10px', border: `1.5px solid ${p.highlight ? ORANGE : '#E5E7EB'}`, backgroundColor: p.highlight ? `${ORANGE}06` : '#F9FAFB', textAlign: 'center', position: 'relative' }}>
                {p.highlight && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65rem', fontWeight: '800', color: '#fff', backgroundColor: ORANGE, padding: '2px 10px', borderRadius: '10px', whiteSpace: 'nowrap' }}>Recomendado</div>}
                <p style={{ margin: '0 0 4px', fontSize: '0.8rem', fontWeight: '700', color: '#111827' }}>{p.plan}</p>
                <p style={{ margin: '0 0 8px', fontSize: '1.1rem', fontWeight: '900', color: p.highlight ? ORANGE : '#374151' }}>{p.price}</p>
                <p style={{ margin: '0 0 2px', fontSize: '0.72rem', color: '#6B7280' }}>{p.verifs}</p>
                <p style={{ margin: 0, fontSize: '0.68rem', color: '#9CA3AF' }}>extra: {p.extra}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

