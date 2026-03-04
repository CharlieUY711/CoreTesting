/* =====================================================
   AdminSidebar — navegación plana, sin sub-menús, sin scroll
   ===================================================== */
import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Megaphone, Wrench, Database,
  Monitor, Sparkles, Package, Truck, Rss, ExternalLink, Plug,
  Search, Blocks,
} from 'lucide-react';
import type { MainSection } from '../../AdminDashboard';
import { useOrchestrator } from '../../../shells/DashboardShell/app/providers/OrchestratorProvider';

const ORANGE    = '#FF6835';
const ACTIVE_BG = 'rgba(255,255,255,0.22)';
const HOVER_BG  = 'rgba(255,255,255,0.12)';

interface NavArea {
  id: string;
  label: string;
  items: [];
}

const AREAS: NavArea[] = [
  { id: 'logistica',   label: 'Logística',   items: [] },
  { id: 'ecommerce',   label: 'eCommerce',   items: [] },
  { id: 'marketing',   label: 'Marketing',   items: [] },
  { id: 'sistema',     label: 'Sistema',     items: [] },
  { id: 'constructor', label: 'Constructor', items: [] },
];

const MODULOS_POR_AREA: Record<string, string[]> = {
  logistica:   ['transportistas', 'conductores', 'tramos', 'tarifas', 'logistica'],
  ecommerce:   ['ecommerce', 'productos', 'pedidos'],
  marketing:   ['marketing', 'rrss'],
  sistema:     ['herramientas', 'gestion', 'sistema', 'integraciones', 'auditoria'],
  constructor: ['constructor'],
};

interface Props {
  activeSection: MainSection;
  onNavigate: (section: MainSection) => void;
}

export function AdminSidebar({ activeSection, onNavigate }: Props) {
  const { config } = useOrchestrator();
  
  // Obtener valores de la configuración con fallbacks
  const clienteNombre = config?.theme?.nombre ?? 'Charlie';
  const colorPrimario = config?.theme?.primary ?? '#FF6B35';
  const modulosConfig = config?.modulos ?? [];
  
  const todosHabilitados = modulosConfig.includes('*');
  const areasVisibles = AREAS.filter(area => {
    if (todosHabilitados || modulosConfig.length === 0) return true;
    const modulosDelArea = MODULOS_POR_AREA[area.id] ?? [];
    return modulosDelArea.some(m => modulosConfig.includes(m));
  });

  return (
    <aside
      style={{
        width: '200px',
        height: '100vh',
        backgroundColor: colorPrimario,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        overflow: 'hidden',          /* sin scroll */
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        height: '88px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
          <span style={{
            color: '#000',
            fontWeight: '600',
            fontSize: '1.7rem',
            lineHeight: 1,
            textAlign: 'justify',
            textAlignLast: 'justify',
          }}>
            {clienteNombre}
          </span>
        </div>
      </div>

      {/* ── User ── */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.18)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '800', fontSize: '0.78rem',
            flexShrink: 0, border: '2px solid rgba(255,255,255,0.4)',
          }}>
            CV
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ color: '#fff', fontWeight: '700', fontSize: '0.82rem', margin: 0, whiteSpace: 'nowrap' }}>Carlos Varalla</p>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.68rem', margin: 0 }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '6px 0', overflowY: 'auto' }}>
          {areasVisibles.map((area) => {
            const isActive = activeSection === area.id ||
              (MODULOS_POR_AREA[area.id] ?? []).includes(activeSection);
            return (
              <button
                key={area.id}
                onClick={() => onNavigate(area.id as MainSection)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 16px',
                  border: 'none',
                  backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: '6px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = HOVER_BG;
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                <span style={{ fontSize: '13px' }}>{area.label}</span>
              </button>
            );
          })}
      </nav>

      {/* ── Tip ── */}
      <div style={{
        margin: '0 10px 10px',
        padding: '10px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '10px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
          <Sparkles size={12} color="#fff" />
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.72rem' }}>Tip del día</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.67rem', margin: 0, lineHeight: '1.4' }}>
          Usá la IA para optimizar descripciones de productos automáticamente
        </p>
      </div>

      {/* ── Ver Tienda ── */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          margin: '0 10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '7px',
          padding: '9px 0',
          backgroundColor: '#fff',
          color: colorPrimario,
          borderRadius: '10px',
          textDecoration: 'none',
          fontSize: '0.8rem',
          fontWeight: '700',
          flexShrink: 0,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        <ExternalLink size={13} />
        Ver tienda
      </a>
    </aside>
  );
}