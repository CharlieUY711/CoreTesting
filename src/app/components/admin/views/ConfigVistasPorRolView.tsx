/* =====================================================
   ConfigVistasPorRolView — Configurador granular de vistas por rol
   Charlie Marketplace Builder v1.5
   Vista: Sistema → Configuración de Vistas por Rol
   Nivel: Visual (v1.0) — preparado para conectar a backend
   ===================================================== */
import React, { useState, useCallback } from 'react';
import { OrangeHeader } from '../OrangeHeader';
import type { MainSection } from '../../../AdminDashboard';
import {
  Eye, EyeOff, Plus, Edit2, Trash2, Settings, Shield,
  ChevronDown, ChevronRight, Save, RotateCcw, CheckCircle,
  ShoppingCart, Megaphone, Database, Truck, Wrench, Plug,
  CreditCard, Package, Users, BarChart2, Globe, FileText,
  Zap, Star, Lock, Unlock, AlertTriangle, Info,
} from 'lucide-react';
import { toast } from 'sonner';

const ORANGE = '#FF6835';
interface Props { onNavigate: (s: MainSection) => void; }

/* ── Tipos ── */
type RolKey = 'Cliente' | 'Colaborador' | 'Editor' | 'Administrador' | 'SuperAdmin';

interface SubPermiso {
  id: string;
  label: string;
  enabled: boolean;
}

interface ModuloPermiso {
  id: string;
  label: string;
  icon: React.ElementType;
  visible: boolean;
  subPermisos: SubPermiso[];
}

interface GrupoModulos {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  modulos: ModuloPermiso[];
  expanded: boolean;
}

/* ── Colores por rol ── */
const ROL_COLORS: Record<RolKey, { color: string; badge: string }> = {
  Cliente:       { color: '#6B7280', badge: 'Acceso básico'     },
  Colaborador:   { color: '#10B981', badge: 'Acceso operativo'  },
  Editor:        { color: '#3B82F6', badge: 'Acceso editorial'  },
  Administrador: { color: ORANGE,    badge: 'Acceso avanzado'   },
  SuperAdmin:    { color: '#7C3AED', badge: 'Acceso total'      },
};

/* ── Factory de permisos por defecto ── */
const mkMod = (id: string, label: string, icon: React.ElementType, visible: boolean, perms: [string, string, boolean][]): ModuloPermiso => ({
  id, label, icon, visible,
  subPermisos: perms.map(([pid, plabel, enabled]) => ({ id: pid, label: plabel, enabled })),
});

const mkPasarela = (id: string, label: string, visible: boolean): ModuloPermiso => ({
  id, label, icon: CreditCard, visible,
  subPermisos: [
    { id: 'ver',        label: 'Ver',               enabled: visible },
    { id: 'configurar', label: 'Configurar',         enabled: false  },
    { id: 'activar',    label: 'Activar/Desactivar', enabled: false  },
    { id: 'credenciales',label: 'Editar credenciales', enabled: false },
  ],
});

const mkLogistica = (id: string, label: string, visible: boolean): ModuloPermiso => ({
  id, label, icon: Truck, visible,
  subPermisos: [
    { id: 'ver',        label: 'Ver',               enabled: visible },
    { id: 'configurar', label: 'Configurar',         enabled: false  },
    { id: 'activar',    label: 'Activar/Desactivar', enabled: false  },
  ],
});

/* ── Permisos iniciales por rol ── */
const buildDefaultPermisos = (rol: RolKey): GrupoModulos[] => {
  const isCli  = rol === 'Cliente';
  const isCol  = rol === 'Colaborador';
  const isEdi  = rol === 'Editor';
  const isAdm  = rol === 'Administrador';
  const isSup  = rol === 'SuperAdmin';

  return [
    {
      id: 'ecommerce', label: 'eCommerce', icon: ShoppingCart, color: ORANGE, expanded: true,
      modulos: [
        mkMod('pedidos',   'Pedidos',   ShoppingCart, true, [
          ['ver',    'Ver pedidos',     true ],
          ['crear',  'Crear pedidos',   isCol || isEdi || isAdm || isSup],
          ['editar', 'Editar pedidos',  isAdm || isSup],
          ['eliminar','Eliminar',       isSup],
        ]),
        mkMod('clientes',  'Clientes',  Users, !isCli, [
          ['ver',    'Ver clientes',    !isCli],
          ['crear',  'Crear clientes',  isCol || isAdm || isSup],
          ['editar', 'Editar clientes', isAdm || isSup],
          ['eliminar','Eliminar',       isSup],
        ]),
        mkMod('pagos',     'Pagos',     CreditCard, true, [
          ['ver',    'Ver pagos',       true ],
          ['emitir', 'Emitir pagos',   isAdm || isSup],
          ['devolver','Devoluciones',  isAdm || isSup],
        ]),
        mkMod('productos',  'Catálogo', Package, true, [
          ['ver',    'Ver productos',   true ],
          ['crear',  'Crear productos', isEdi || isAdm || isSup],
          ['editar', 'Editar productos',isEdi || isAdm || isSup],
          ['eliminar','Eliminar',       isAdm || isSup],
        ]),
      ],
    },
    {
      id: 'marketing', label: 'Marketing', icon: Megaphone, color: '#EC4899', expanded: false,
      modulos: [
        mkMod('campanas',  'Campañas',   Megaphone, isEdi || isAdm || isSup, [
          ['ver',    'Ver campañas',    isEdi || isAdm || isSup],
          ['crear',  'Crear campañas',  isEdi || isAdm || isSup],
          ['publicar','Publicar',       isAdm || isSup],
        ]),
        mkMod('mailing',   'Email Mailing', Zap, isEdi || isAdm || isSup, [
          ['ver',    'Ver listas',      isEdi || isAdm || isSup],
          ['enviar', 'Enviar emails',   isAdm || isSup],
          ['config', 'Configurar',      isSup],
        ]),
        mkMod('seo',       'SEO',         Globe, isEdi || isAdm || isSup, [
          ['ver',    'Ver métricas',    isEdi || isAdm || isSup],
          ['editar', 'Editar metadata', isEdi || isAdm || isSup],
        ]),
        mkMod('rrss',      'RRSS Hub',    Star, isEdi || isAdm || isSup, [
          ['ver',    'Ver conexiones',  isEdi || isAdm || isSup],
          ['publicar','Publicar',       isEdi || isAdm || isSup],
          ['config', 'Configurar cuentas', isAdm || isSup],
        ]),
      ],
    },
    {
      id: 'gestion', label: 'Gestión ERP', icon: Database, color: '#3B82F6', expanded: false,
      modulos: [
        mkMod('inventario','Inventario', Package, !isCli, [
          ['ver',    'Ver stock',       !isCli],
          ['ajustar','Ajustar stock',   isCol || isAdm || isSup],
          ['crear',  'Crear artículos', isAdm || isSup],
        ]),
        mkMod('facturacion','Facturación', FileText, isAdm || isSup, [
          ['ver',    'Ver facturas',    isAdm || isSup],
          ['emitir', 'Emitir facturas', isAdm || isSup],
          ['anular', 'Anular facturas', isSup],
        ]),
        mkMod('erp-rrhh',  'RRHH',       Users, isAdm || isSup, [
          ['ver',    'Ver personal',    isAdm || isSup],
          ['gestionar','Gestionar',     isAdm || isSup],
        ]),
        mkMod('erp-crm',   'CRM',         BarChart2, !isCli, [
          ['ver',    'Ver contactos',   !isCli],
          ['editar', 'Editar',          isCol || isAdm || isSup],
        ]),
      ],
    },
    {
      id: 'logistica', label: 'Logística', icon: Truck, color: '#10B981', expanded: false,
      modulos: [
        mkMod('envios',     'Envíos',       Truck, true, [
          ['ver',    'Ver envíos',      true ],
          ['gestionar','Gestionar',     isCol || isAdm || isSup],
        ]),
        mkMod('transportistas','Transportistas', Truck, isAdm || isSup, [
          ['ver',    'Ver',             isAdm || isSup],
          ['gestionar','Gestionar',     isAdm || isSup],
        ]),
        mkMod('fulfillment','Fulfillment',  Package, isAdm || isSup, [
          ['ver',    'Ver',             isAdm || isSup],
          ['operar', 'Operar',          isAdm || isSup],
        ]),
      ],
    },
    {
      id: 'integraciones-pagos', label: 'Pasarelas de Pago', icon: CreditCard, color: '#8B5CF6', expanded: false,
      modulos: [
        mkPasarela('mp',       'Mercado Pago',    !isCli),
        mkPasarela('plexo',    'Plexo',           isAdm || isSup),
        mkPasarela('stripe',   'Stripe',          isSup),
        mkPasarela('paypal',   'PayPal',          isSup),
        mkPasarela('transferencia', 'Transferencia bancaria', !isCli),
        mkPasarela('efectivo', 'Pago en efectivo', !isCli),
      ],
    },
    {
      id: 'integraciones-logistica-group', label: 'Logística Integrada', icon: Truck, color: '#14B8A6', expanded: false,
      modulos: [
        mkLogistica('correouy', 'Correo UY', isAdm || isSup),
        mkLogistica('correo',   'Correo UY', isAdm || isSup),
        mkLogistica('pedidosya','PedidosYa', isAdm || isSup),
      ],
    },
    {
      id: 'sistema-group', label: 'Sistema & Config', icon: Settings, color: '#6B7280', expanded: false,
      modulos: [
        mkMod('sistema',    'Sistema',        Settings, isAdm || isSup, [
          ['ver',    'Ver configuración', isAdm || isSup],
          ['editar', 'Editar config',     isSup],
        ]),
        mkMod('auditoria',  'Auditoría',      Shield, isAdm || isSup, [
          ['ver',    'Ver logs',          isAdm || isSup],
          ['exportar','Exportar logs',    isSup],
        ]),
        mkMod('constructor','Constructor',    Zap, isSup, [
          ['ver',    'Ver',               isSup],
          ['operar', 'Operar',            isSup],
        ]),
        mkMod('documentacion','Documentación',FileText, true, [
          ['ver-usuario', 'Ver docs usuario',   true ],
          ['ver-tecnico', 'Ver docs técnicas',  isEdi || isAdm || isSup],
          ['editar',      'Editar docs',        isSup],
        ]),
      ],
    },
  ];
};

/* ── Switch toggle ── */
function Toggle({ enabled, onChange, color }: { enabled: boolean; onChange: () => void; color: string }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 11,
        backgroundColor: enabled ? color : '#D1D5DB',
        border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: enabled ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        backgroundColor: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        transition: 'left 0.2s',
      }} />
    </button>
  );
}

/* ── Componente principal ── */
export function ConfigVistasPorRolView({ onNavigate: _ }: Props) {
  const ROLES: RolKey[] = ['Cliente', 'Colaborador', 'Editor', 'Administrador', 'SuperAdmin'];
  const [activeRol, setActiveRol] = useState<RolKey>('Editor');
  const [grupos, setGrupos]       = useState<Record<RolKey, GrupoModulos[]>>(() => {
    const init = {} as Record<RolKey, GrupoModulos[]>;
    ROLES.forEach(r => { init[r] = buildDefaultPermisos(r); });
    return init;
  });
  const [hasChanges, setHasChanges] = useState(false);

  const rolColor = ROL_COLORS[activeRol].color;

  /* ── Mutadores ── */
  const toggleGrupo = useCallback((gId: string) => {
    setGrupos(prev => {
      const next = { ...prev };
      next[activeRol] = prev[activeRol].map(g => g.id === gId ? { ...g, expanded: !g.expanded } : g);
      return next;
    });
  }, [activeRol]);

  const toggleModulo = useCallback((gId: string, mId: string) => {
    setGrupos(prev => {
      const next = { ...prev };
      next[activeRol] = prev[activeRol].map(g => g.id !== gId ? g : {
        ...g,
        modulos: g.modulos.map(m => m.id !== mId ? m : {
          ...m,
          visible: !m.visible,
          subPermisos: m.subPermisos.map(sp => ({ ...sp, enabled: !m.visible })),
        }),
      });
      return next;
    });
    setHasChanges(true);
  }, [activeRol]);

  const toggleSubPermiso = useCallback((gId: string, mId: string, spId: string) => {
    setGrupos(prev => {
      const next = { ...prev };
      next[activeRol] = prev[activeRol].map(g => g.id !== gId ? g : {
        ...g,
        modulos: g.modulos.map(m => m.id !== mId ? m : {
          ...m,
          subPermisos: m.subPermisos.map(sp => sp.id !== spId ? sp : { ...sp, enabled: !sp.enabled }),
        }),
      });
      return next;
    });
    setHasChanges(true);
  }, [activeRol]);

  const handleSave = () => {
    setHasChanges(false);
    toast.success(`Permisos de "${activeRol}" guardados`, { description: 'Los cambios entrarán en efecto al recargar.' });
  };

  const handleReset = () => {
    setGrupos(prev => ({ ...prev, [activeRol]: buildDefaultPermisos(activeRol) }));
    setHasChanges(false);
    toast.info(`Permisos de "${activeRol}" restaurados al valor predeterminado`);
  };

  const currentGrupos = grupos[activeRol];

  /* ── Conteo rápido ── */
  const totalModules  = currentGrupos.reduce((a, g) => a + g.modulos.length, 0);
  const visibleModules= currentGrupos.reduce((a, g) => a + g.modulos.filter(m => m.visible).length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>

      <OrangeHeader
        icon={Eye}
        title="Configuración de Vistas por Rol"
        subtitle="Define qué puede ver y hacer cada rol · Visual (v1.0)"
        actions={[
          {
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RotateCcw size={13} /> Restaurar
              </span>
            ),
            onClick: handleReset,
          },
          {
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={13} /> Guardar cambios
              </span>
            ),
            primary: true,
            onClick: handleSave,
          },
        ]}
      />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* ── Tabs de roles ── */}
        <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
          {ROLES.map(rol => {
            const active = rol === activeRol;
            const color  = ROL_COLORS[rol].color;
            return (
              <button
                key={rol}
                onClick={() => { setActiveRol(rol); setHasChanges(false); }}
                style={{
                  padding: '14px 20px',
                  border: 'none', borderBottom: active ? `3px solid ${color}` : '3px solid transparent',
                  backgroundColor: 'transparent',
                  color: active ? color : '#6B7280',
                  fontSize: '0.85rem', fontWeight: active ? '800' : '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                <Shield size={14} color={active ? color : '#9CA3AF'} />
                {rol}
                {active && (
                  <span style={{ fontSize: '0.65rem', fontWeight: '700', color, backgroundColor: `${color}15`, padding: '2px 7px', borderRadius: 5 }}>
                    {ROL_COLORS[rol].badge}
                  </span>
                )}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {hasChanges && (
            <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: 5 }}>
              <AlertTriangle size={12} /> Cambios sin guardar
            </span>
          )}
        </div>

        {/* ── Contenido ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* Resumen del rol */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 12, border: `1.5px solid ${rolColor}30`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: `${rolColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color={rolColor} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: '#111827' }}>{activeRol}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6B7280' }}>{ROL_COLORS[activeRol].badge}</p>
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 22px', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: rolColor }}>{visibleModules}/{totalModules}</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>Módulos visibles</p>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Info size={15} color='#9CA3AF' />
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280', maxWidth: 200 }}>
                Los cambios son visuales. Conectar a backend para aplicar en tiempo real.
              </p>
            </div>
          </div>

          {/* Grupos de módulos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentGrupos.map(grupo => {
              const visiblesEnGrupo = grupo.modulos.filter(m => m.visible).length;
              return (
                <div key={grupo.id} style={{ backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>

                  {/* Header del grupo */}
                  <button
                    onClick={() => toggleGrupo(grupo.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '16px 20px', border: 'none', backgroundColor: 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      borderBottom: grupo.expanded ? '1px solid #F3F4F6' : 'none',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: `${grupo.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <grupo.icon size={16} color={grupo.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: '#111827' }}>{grupo.label}</p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#9CA3AF' }}>
                        {visiblesEnGrupo}/{grupo.modulos.length} módulos habilitados
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: '700',
                        color: visiblesEnGrupo > 0 ? grupo.color : '#9CA3AF',
                        backgroundColor: visiblesEnGrupo > 0 ? `${grupo.color}15` : '#F3F4F6',
                        padding: '3px 9px', borderRadius: 6,
                      }}>
                        {visiblesEnGrupo > 0 ? `${visiblesEnGrupo} activos` : 'Sin acceso'}
                      </span>
                      {grupo.expanded ? <ChevronDown size={16} color='#9CA3AF' /> : <ChevronRight size={16} color='#9CA3AF' />}
                    </div>
                  </button>

                  {/* Módulos del grupo */}
                  {grupo.expanded && (
                    <div style={{ padding: '8px 20px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {grupo.modulos.map(mod => (
                          <div
                            key={mod.id}
                            style={{
                              borderRadius: 12, border: `1.5px solid ${mod.visible ? grupo.color + '30' : '#E5E7EB'}`,
                              backgroundColor: mod.visible ? `${grupo.color}04` : '#FAFAFA',
                              overflow: 'hidden', transition: 'all 0.15s',
                            }}
                          >
                            {/* Módulo header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: mod.visible ? `1px solid ${grupo.color}15` : 'none' }}>
                              <div style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: mod.visible ? `${grupo.color}18` : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <mod.icon size={13} color={mod.visible ? grupo.color : '#9CA3AF'} />
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: '700', color: mod.visible ? '#111827' : '#9CA3AF' }}>{mod.label}</p>
                              </div>
                              <Toggle enabled={mod.visible} onChange={() => toggleModulo(grupo.id, mod.id)} color={grupo.color} />
                            </div>

                            {/* Sub-permisos */}
                            {mod.visible && (
                              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                                {mod.subPermisos.map(sp => (
                                  <div key={sp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      {sp.enabled
                                        ? <Unlock size={11} color={grupo.color} />
                                        : <Lock    size={11} color='#D1D5DB'    />
                                      }
                                      <span style={{ fontSize: '0.74rem', color: sp.enabled ? '#374151' : '#9CA3AF', fontWeight: sp.enabled ? '600' : '400' }}>
                                        {sp.label}
                                      </span>
                                    </div>
                                    <Toggle enabled={sp.enabled} onChange={() => toggleSubPermiso(grupo.id, mod.id, sp.id)} color={grupo.color} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 24, padding: '16px 20px', backgroundColor: `${ORANGE}08`, borderRadius: 12, border: `1.5px solid ${ORANGE}20`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} color={ORANGE} />
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6B7280' }}>
                <strong style={{ color: '#374151' }}>Nivel 1 — Visual:</strong> Los permisos se guardan localmente.
                Conectar a Supabase Auth para aplicar en tiempo real (Nivel 2).
              </p>
            </div>
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 20px', borderRadius: 9,
                border: 'none', backgroundColor: ORANGE,
                color: '#fff', fontSize: '0.82rem', fontWeight: '700',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Save size={14} /> Guardar configuración
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
