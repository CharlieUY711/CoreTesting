/* =====================================================
   SEOView — Módulo de SEO
   Análisis · Keywords · Rankings · On-Page Health
   ===================================================== */
import React, { useState } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Search, TrendingUp, TrendingDown, Globe, AlertCircle,
  CheckCircle2, BarChart3, ArrowUp, ArrowDown, Minus,
  FileText, Link2, Zap, Eye, Star, RefreshCw, Plus,
  ExternalLink, Target, Clock,
} from 'lucide-react';

interface Props { onNavigate: (s: MainSection) => void; }
const ORANGE = '#FF6835';

type Tab = 'overview' | 'keywords' | 'paginas' | 'backlinks' | 'salud';
type Tendencia = 'up' | 'down' | 'stable';

interface Keyword {
  id: string;
  keyword: string;
  posicion: number;
  posicionAnterior: number;
  volumeMensual: number;
  dificultad: number; // 0-100
  ctr: number;
  impressiones: number;
  clics: number;
  url: string;
}

interface PaginaSEO {
  id: string;
  titulo: string;
  url: string;
  score: number;
  problemas: string[];
  keywords: string[];
  traficoOrganico: number;
  posicionPromedio: number;
}

interface Backlink {
  id: string;
  dominio: string;
  url: string;
  autoridad: number;
  tipo: 'dofollow' | 'nofollow';
  estado: 'activo' | 'perdido' | 'nuevo';
  fechaDeteccion: string;
}

const KEYWORDS: Keyword[] = [
  { id: 'k1', keyword: 'ropa online uruguay', posicion: 4, posicionAnterior: 7, volumeMensual: 18000, dificultad: 72, ctr: 3.2, impressiones: 42000, clics: 1344, url: '/tienda/ropa' },
  { id: 'k2', keyword: 'comprar remeras al por mayor', posicion: 2, posicionAnterior: 3, volumeMensual: 5400, dificultad: 58, ctr: 8.7, impressiones: 12000, clics: 1044, url: '/mayorista' },
  { id: 'k3', keyword: 'marketplace segunda mano', posicion: 11, posicionAnterior: 9, volumeMensual: 9800, dificultad: 65, ctr: 0.8, impressiones: 28000, clics: 224, url: '/segunda-mano' },
  { id: 'k4', keyword: 'zapatillas deportivas mujer', posicion: 6, posicionAnterior: 6, volumeMensual: 22000, dificultad: 80, ctr: 2.1, impressiones: 55000, clics: 1155, url: '/calzado/mujer' },
  { id: 'k5', keyword: 'indumentaria de trabajo', posicion: 1, posicionAnterior: 2, volumeMensual: 7200, dificultad: 45, ctr: 14.2, impressiones: 16000, clics: 2272, url: '/trabajo' },
  { id: 'k6', keyword: 'canasta navideña empresas', posicion: 3, posicionAnterior: 5, volumeMensual: 12000, dificultad: 52, ctr: 6.5, impressiones: 28000, clics: 1820, url: '/canastas' },
  { id: 'k7', keyword: 'kit regalo corporativo', posicion: 8, posicionAnterior: 8, volumeMensual: 4300, dificultad: 48, ctr: 1.4, impressiones: 9800, clics: 137, url: '/kits' },
  { id: 'k8', keyword: 'envios a todo el pais', posicion: 15, posicionAnterior: 20, volumeMensual: 8800, dificultad: 70, ctr: 0.4, impressiones: 22000, clics: 88, url: '/envios' },
];

const PAGINAS: PaginaSEO[] = [
  { id: 'p1', titulo: 'Tienda de Ropa Online | Charlie Marketplace', url: '/tienda/ropa', score: 88, problemas: [], keywords: ['ropa online', 'moda uruguay'], traficoOrganico: 2840, posicionPromedio: 4.2 },
  { id: 'p2', titulo: 'Compra al Por Mayor | Mayorista', url: '/mayorista', score: 76, problemas: ['Meta description muy corta', 'Faltan keywords en H2'], keywords: ['ropa mayorista', 'comprar al por mayor'], traficoOrganico: 1890, posicionPromedio: 2.8 },
  { id: 'p3', titulo: 'Segunda Mano — Artículos Usados', url: '/segunda-mano', score: 61, problemas: ['Velocidad de carga alta (4.2s)', 'Falta schema markup', 'Imágenes sin alt text'], keywords: ['segunda mano', 'artículos usados'], traficoOrganico: 780, posicionPromedio: 11.3 },
  { id: 'p4', titulo: 'Indumentaria de Trabajo y Seguridad', url: '/trabajo', score: 94, problemas: [], keywords: ['ropa de trabajo', 'indumentaria industrial'], traficoOrganico: 3120, posicionPromedio: 1.4 },
  { id: 'p5', titulo: 'Canastas y Kits de Regalo Corporativo', url: '/canastas', score: 82, problemas: ['Título demasiado largo (72 car.)'], keywords: ['canasta navideña', 'kit regalo empresa'], traficoOrganico: 2240, posicionPromedio: 3.1 },
];

const BACKLINKS: Backlink[] = [
  { id: 'b1', dominio: 'mercadolibre.com.ar', url: 'https://vendedores.mercadolibre.com.ar/...', autoridad: 92, tipo: 'dofollow', estado: 'activo', fechaDeteccion: '15/01/2024' },
  { id: 'b2', dominio: 'lanacion.com.ar', url: 'https://lanacion.com.ar/economia/...', autoridad: 88, tipo: 'dofollow', estado: 'activo', fechaDeteccion: '10/01/2024' },
  { id: 'b3', dominio: 'infobae.com', url: 'https://infobae.com/...', autoridad: 85, tipo: 'nofollow', estado: 'activo', fechaDeteccion: '05/01/2024' },
  { id: 'b4', dominio: 'pyme.com.ar', url: 'https://pyme.com.ar/moda/...', autoridad: 52, tipo: 'dofollow', estado: 'nuevo', fechaDeteccion: '17/01/2024' },
  { id: 'b5', dominio: 'modauruguay.com', url: 'https://modauruguay.com/...', autoridad: 38, tipo: 'dofollow', estado: 'perdido', fechaDeteccion: '01/12/2023' },
  { id: 'b6', dominio: 'blogmoda.ar', url: 'https://blogmoda.ar/...', autoridad: 29, tipo: 'dofollow', estado: 'activo', fechaDeteccion: '20/12/2023' },
];

const SALUD_ITEMS = [
  { cat: 'Técnico',    label: 'Core Web Vitals — LCP',      valor: '1.8s',  estado: 'ok',   desc: 'Buen rendimiento — menor a 2.5s' },
  { cat: 'Técnico',    label: 'Core Web Vitals — CLS',      valor: '0.03',  estado: 'ok',   desc: 'Sin cambios de layout inesperados' },
  { cat: 'Técnico',    label: 'Core Web Vitals — FID',      valor: '12ms',  estado: 'ok',   desc: 'Respuesta interactiva excelente' },
  { cat: 'Técnico',    label: 'Velocidad mobile',           valor: '62/100',estado: 'warn', desc: 'Mejorable — optimizar imágenes' },
  { cat: 'Técnico',    label: 'HTTPS',                      valor: '✓',     estado: 'ok',   desc: 'SSL activo y válido' },
  { cat: 'Contenido',  label: 'Páginas sin meta description',valor: '12',   estado: 'warn', desc: '12 URLs sin meta description' },
  { cat: 'Contenido',  label: 'Imágenes sin alt text',      valor: '38',    estado: 'error',desc: '38 imágenes sin texto alternativo' },
  { cat: 'Contenido',  label: 'Contenido duplicado',        valor: '3 pág.',estado: 'warn', desc: '3 páginas con contenido similar' },
  { cat: 'Técnico',    label: 'Sitemap XML',                valor: '✓',     estado: 'ok',   desc: 'Actualizado — 248 URLs indexadas' },
  { cat: 'Técnico',    label: 'Robots.txt',                 valor: '✓',     estado: 'ok',   desc: 'Configurado correctamente' },
  { cat: 'Backlinks',  label: 'Domain Authority (DA)',      valor: '41/100',estado: 'warn', desc: 'Creciendo — objetivo: 55+ en 6 meses' },
  { cat: 'Backlinks',  label: 'Backlinks totales',          valor: '1.248', estado: 'ok',   desc: 'Perfil sano de backlinks' },
];

function TendenciaIcon({ actual, anterior }: { actual: number; anterior: number }) {
  if (actual < anterior) return <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#059669', fontSize: '11px', fontWeight: 700 }}><ArrowUp size={11} />+{anterior - actual}</div>;
  if (actual > anterior) return <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#DC2626', fontSize: '11px', fontWeight: 700 }}><ArrowDown size={11} />-{actual - anterior}</div>;
  return <div style={{ color: '#9CA3AF', fontSize: '11px' }}><Minus size={11} /></div>;
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? '#059669' : score >= 70 ? '#D97706' : '#DC2626';
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: `3px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: '12px', fontWeight: 800, color }}>{score}</span>
    </div>
  );
}

export function SEOView({ onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const [search, setSearch] = useState('');
  const [selectedPagina, setSelectedPagina] = useState<PaginaSEO | null>(null);

  const totalClics = KEYWORDS.reduce((s, k) => s + k.clics, 0);
  const totalImpressiones = KEYWORDS.reduce((s, k) => s + k.impressiones, 0);
  const avgCtr = (totalClics / totalImpressiones * 100).toFixed(1);
  const avgPos = (KEYWORDS.reduce((s, k) => s + k.posicion, 0) / KEYWORDS.length).toFixed(1);
  const scorePromedio = Math.round(PAGINAS.reduce((s, p) => s + p.score, 0) / PAGINAS.length);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <OrangeHeader
        icon={Search}
        title="SEO"
        subtitle={`${KEYWORDS.length} keywords monitoreadas · ${totalClics.toLocaleString()} clics/mes · CTR promedio ${avgCtr}%`}
        actions={[
          { label: '← Marketing', onClick: () => onNavigate('marketing') },
          { label: '↻ Sincronizar GSC', primary: true },
        ]}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '12px', padding: '16px 20px 0' }}>
          {[
            { label: 'Clics Orgánicos', value: totalClics.toLocaleString(), sub: '/mes', icon: Eye, color: ORANGE },
            { label: 'Impressiones', value: `${(totalImpressiones/1000).toFixed(0)}K`, sub: '/mes', icon: Globe, color: '#2563EB' },
            { label: 'CTR Promedio', value: `${avgCtr}%`, sub: 'click-through rate', icon: Target, color: '#7C3AED' },
            { label: 'Posición Media', value: `#${avgPos}`, sub: 'ranking promedio', icon: BarChart3, color: '#D97706' },
            { label: 'Health Score', value: `${scorePromedio}/100`, sub: 'estado on-page', icon: Zap, color: scorePromedio >= 80 ? '#059669' : '#DC2626' },
          ].map(c => {
            const Icon = c.icon;
            return (
              <div key={c.label} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#6B7280' }}>{c.label}</span>
                  <Icon size={14} color={c.color} />
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>{c.value}</div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>{c.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '12px 20px 0', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', marginTop: '12px' }}>
          {([['overview','📊 Overview'],['keywords','🔑 Keywords'],['paginas','📄 Páginas'],['backlinks','🔗 Backlinks'],['salud','🏥 Salud SEO']] as [Tab,string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: '10px 18px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '13px', fontWeight: tab === id ? 700 : 500, color: tab === id ? ORANGE : '#6B7280', borderBottom: tab === id ? `2px solid ${ORANGE}` : '2px solid transparent' }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Tab: Overview */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Top keywords */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Keywords por Clics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...KEYWORDS].sort((a,b) => b.clics - a.clics).slice(0,5).map(kw => (
                    <div key={kw.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: kw.posicion <= 3 ? '#ECFDF5' : kw.posicion <= 10 ? '#FFF4EC' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: kw.posicion <= 3 ? '#059669' : kw.posicion <= 10 ? ORANGE : '#DC2626' }}>#{kw.posicion}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.keyword}</div>
                        <div style={{ width: '100%', height: '4px', backgroundColor: '#F3F4F6', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, (kw.clics / 2500) * 100)}%`, height: '100%', backgroundColor: ORANGE, borderRadius: '2px' }} />
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151', flexShrink: 0 }}>{kw.clics.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Salud de páginas */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Salud de Páginas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {PAGINAS.map(p => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <ScoreBadge score={p.score} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.titulo}</div>
                        <div style={{ fontSize: '10px', color: '#9CA3AF' }}>{p.problemas.length === 0 ? '✓ Sin problemas' : `⚠ ${p.problemas.length} problema${p.problemas.length > 1 ? 's' : ''}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Oportunidades IA */}
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <Zap size={16} color={ORANGE} />
                  <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sugerencias IA para mejorar el posicionamiento</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { prio: '🔴', titulo: 'Agregar alt text a 38 imágenes', desc: 'Impacto alto en rankings de imágenes y accesibilidad', accion: 'Generar con IA' },
                    { prio: '🟠', titulo: 'Optimizar meta descriptions', desc: '12 páginas sin meta — CTR puede subir 2-3%', accion: 'Sugerir con IA' },
                    { prio: '🟡', titulo: 'Mejorar velocidad mobile', desc: 'Comprimir imágenes > 200KB para ganar 1.2s', accion: 'Optimizar' },
                    { prio: '🟢', titulo: 'Publicar 3 artículos de blog', desc: 'Keywords de cola larga sin contenido aún', accion: 'Redactar con IA' },
                    { prio: '🟢', titulo: 'Agregar schema markup', desc: 'Rich snippets aumentan CTR en 15% promedio', accion: 'Implementar' },
                    { prio: '🟢', titulo: 'Construir 5 backlinks nuevos', desc: 'DA 40+ con guest posts en medios especializados', accion: 'Ver oportunidades' },
                  ].map(s => (
                    <div key={s.titulo} style={{ padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{s.prio}</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: '1.4' }}>{s.titulo}</span>
                      </div>
                      <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>{s.desc}</p>
                      <button style={{ fontSize: '11px', fontWeight: 700, color: ORANGE, backgroundColor: '#FFF4EC', border: `1px solid ${ORANGE}40`, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>
                        {s.accion}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Keywords */}
          {tab === 'keywords' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                  <Search size={13} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar keywords..."
                    style={{ width: '100%', paddingLeft: '30px', paddingRight: '10px', paddingTop: '8px', paddingBottom: '8px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button style={{ padding: '8px 14px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={13} /> Agregar keyword
                </button>
              </div>
              <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB' }}>
                      {['Keyword', 'Posición', 'Cambio', 'Volumen/mes', 'Dificultad', 'CTR', 'Clics', 'URL'].map(h => (
                        <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {KEYWORDS.filter(k => !search || k.keyword.includes(search.toLowerCase())).map((kw, i) => {
                      const posColor = kw.posicion <= 3 ? '#059669' : kw.posicion <= 10 ? ORANGE : '#DC2626';
                      const difColor = kw.dificultad >= 70 ? '#DC2626' : kw.dificultad >= 50 ? '#D97706' : '#059669';
                      return (
                        <tr key={kw.id} style={{ borderBottom: i < KEYWORDS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                          <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 600, color: '#111', maxWidth: '220px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.keyword}</div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '26px', borderRadius: '8px', backgroundColor: `${posColor}18`, fontSize: '13px', fontWeight: 800, color: posColor }}>
                              #{kw.posicion}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}><TendenciaIcon actual={kw.posicion} anterior={kw.posicionAnterior} /></td>
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151', fontWeight: 500 }}>{kw.volumeMensual.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ flex: 1, maxWidth: '60px', height: '5px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${kw.dificultad}%`, height: '100%', backgroundColor: difColor, borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontSize: '11px', color: difColor, fontWeight: 700 }}>{kw.dificultad}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '12px', color: '#374151' }}>{kw.ctr}%</td>
                          <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#111' }}>{kw.clics.toLocaleString()}</td>
                          <td style={{ padding: '12px 14px', fontSize: '11px', color: '#6B7280', maxWidth: '120px' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{kw.url}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab: Páginas */}
          {tab === 'paginas' && (
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PAGINAS.map(pagina => (
                  <div key={pagina.id} onClick={() => setSelectedPagina(pagina.id === selectedPagina?.id ? null : pagina)}
                    style={{ backgroundColor: '#fff', borderRadius: '12px', border: `1.5px solid ${selectedPagina?.id === pagina.id ? ORANGE : '#E5E7EB'}`, padding: '16px 20px', cursor: 'pointer', boxShadow: selectedPagina?.id === pagina.id ? `0 0 0 3px ${ORANGE}22` : 'none', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <ScoreBadge score={pagina.score} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#111', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pagina.titulo}</div>
                        <div style={{ fontSize: '11px', color: '#2563EB', marginBottom: '4px' }}>{pagina.url}</div>
                        <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#6B7280', flexWrap: 'wrap' }}>
                          <span>👁 {pagina.traficoOrganico.toLocaleString()} visitas/mes</span>
                          <span>📊 Pos. media #{pagina.posicionPromedio}</span>
                          {pagina.problemas.length > 0 && <span style={{ color: '#D97706' }}>⚠ {pagina.problemas.length} problema{pagina.problemas.length > 1 ? 's' : ''}</span>}
                          {pagina.problemas.length === 0 && <span style={{ color: '#059669' }}>✓ Sin problemas</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {selectedPagina && (
                <div style={{ width: '300px', flexShrink: 0, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', height: 'fit-content' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <ScoreBadge score={selectedPagina.score} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedPagina.url}</div>
                    </div>
                  </div>
                  {selectedPagina.problemas.length > 0 && (
                    <>
                      <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠ Problemas detectados</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        {selectedPagina.problemas.map((p, i) => (
                          <div key={i} style={{ fontSize: '12px', color: '#D97706', padding: '6px 10px', backgroundColor: '#FFFBEB', borderRadius: '6px', border: '1px solid #FDE68A' }}>
                            {p}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keywords posicionadas</h4>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    {selectedPagina.keywords.map(k => (
                      <span key={k} style={{ fontSize: '11px', color: '#374151', backgroundColor: '#F3F4F6', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>{k}</span>
                    ))}
                  </div>
                  <button style={{ marginTop: '14px', width: '100%', padding: '9px', border: 'none', borderRadius: '8px', backgroundColor: ORANGE, color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Optimizar con IA
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Backlinks */}
          {tab === 'backlinks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {BACKLINKS.map(bl => {
                const estadoCfg = { activo: { color: '#059669', bg: '#ECFDF5', label: '● Activo' }, perdido: { color: '#DC2626', bg: '#FEF2F2', label: '✗ Perdido' }, nuevo: { color: '#2563EB', bg: '#EFF6FF', label: '✦ Nuevo' } }[bl.estado];
                return (
                  <div key={bl.id} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '20px' }}>
                      🔗
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{bl.dominio}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: estadoCfg.color, backgroundColor: estadoCfg.bg, padding: '2px 8px', borderRadius: '10px' }}>{estadoCfg.label}</span>
                        <span style={{ fontSize: '10px', color: bl.tipo === 'dofollow' ? '#059669' : '#9CA3AF', backgroundColor: bl.tipo === 'dofollow' ? '#ECFDF5' : '#F3F4F6', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>{bl.tipo}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#2563EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bl.url}</div>
                      <div style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px' }}>Detectado: {bl.fechaDeteccion}</div>
                    </div>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: bl.autoridad >= 70 ? '#059669' : bl.autoridad >= 40 ? '#D97706' : '#DC2626' }}>{bl.autoridad}</div>
                      <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase' }}>DA</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab: Salud SEO */}
          {tab === 'salud' && (
            <div style={{ maxWidth: '800px' }}>
              {(['Técnico', 'Contenido', 'Backlinks'] as const).map(cat => (
                <div key={cat} style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', marginBottom: '14px' }}>
                  <h3 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {SALUD_ITEMS.filter(s => s.cat === cat).map(item => {
                      const [iconEl, iconColor, iconBg] = item.estado === 'ok'
                        ? [CheckCircle2, '#059669', '#ECFDF5']
                        : item.estado === 'warn'
                        ? [AlertCircle, '#D97706', '#FFFBEB']
                        : [AlertCircle, '#DC2626', '#FEF2F2'];
                      const IconEl = iconEl;
                      return (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: `1px solid ${item.estado === 'error' ? '#FCA5A5' : item.estado === 'warn' ? '#FDE68A' : '#E5E7EB'}` }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <IconEl size={15} color={iconColor} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{item.label}</div>
                            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>{item.desc}</div>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: iconColor, flexShrink: 0 }}>{item.valor}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}